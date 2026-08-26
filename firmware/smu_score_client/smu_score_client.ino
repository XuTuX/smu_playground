#include <HTTPClient.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>

#include <memory>

#include "secrets.h"

constexpr char DEVICE_ID[] = "GAME_01";
constexpr char GAME_ID[] = "flappy";

uint32_t eventSequence = 0;

void connectWifi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  Serial.print("Wi-Fi connecting");
  const unsigned long startedAt = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - startedAt < 15000) {
    delay(300);
    Serial.print(".");
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("Connected. IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("Wi-Fi connection failed.");
  }
}

String makeEventId() {
  const uint64_t chipId = ESP.getEfuseMac();
  char buffer[65];
  snprintf(buffer, sizeof(buffer), "%04X%08X-%lu-%lu",
           static_cast<uint16_t>(chipId >> 32),
           static_cast<uint32_t>(chipId), millis(), ++eventSequence);
  return String(buffer);
}

bool postScoreOnce(int score, const String& eventId) {
  if (WiFi.status() != WL_CONNECTED) connectWifi();
  if (WiFi.status() != WL_CONNECTED) return false;

  std::unique_ptr<WiFiClient> client;
  if (String(SCORE_ENDPOINT).startsWith("https://")) {
    auto* secureClient = new WiFiClientSecure();
    // Replace with setCACert(...) before a production deployment.
    secureClient->setInsecure();
    client.reset(secureClient);
  } else {
    client.reset(new WiFiClient());
  }

  HTTPClient http;
  if (!http.begin(*client, SCORE_ENDPOINT)) return false;

  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-DEVICE-KEY", DEVICE_API_KEY);
  http.setTimeout(5000);

  const String payload =
      String("{\"device_id\":\"") + DEVICE_ID +
      "\",\"game_id\":\"" + GAME_ID +
      "\",\"score\":" + String(score) +
      ",\"event_id\":\"" + eventId + "\"}";

  const int status = http.POST(payload);
  const String response = http.getString();
  http.end();

  Serial.printf("Score response: %d %s\n", status, response.c_str());
  return status >= 200 && status < 300;
}

bool sendGameScore(int score) {
  const String eventId = makeEventId();
  for (int attempt = 1; attempt <= 3; ++attempt) {
    if (postScoreOnce(score, eventId)) return true;
    delay(attempt * 1000);
  }
  return false;
}

void setup() {
  Serial.begin(115200);
  connectWifi();
}

void loop() {
  // Call sendGameScore(finalScore) once when the physical game ends.
  // The repeated event_id prevents duplicate sessions during HTTP retries.
  delay(1000);
}

