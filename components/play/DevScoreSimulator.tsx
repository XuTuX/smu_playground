"use client";

import { useState } from "react";
import type { Game } from "@/lib/types";

export function DevScoreSimulator({ game }: { game: Game }) {
  const [score, setScore] = useState(37);
  const [message, setMessage] = useState(
    "ESP32 없이 점수 수신을 테스트할 수 있습니다.",
  );
  const [sending, setSending] = useState(false);

  const sendScore = async () => {
    setSending(true);
    try {
      const response = await fetch("/api/device/score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-DEVICE-KEY": "dev-local",
        },
        body: JSON.stringify({
          device_id: game.deviceId,
          game_id: game.id,
          score,
        }),
      });
      const body = (await response.json()) as {
        success?: boolean;
        error?: string;
      };
      setMessage(
        response.ok && body.success
          ? `${score}점이 도착했습니다.`
          : (body.error ?? "점수를 전송하지 못했습니다."),
      );
    } catch {
      setMessage("개발 서버에 연결할 수 없습니다.");
    } finally {
      setSending(false);
    }
  };

  return (
    <aside className="dev-simulator">
      <div>
        <strong>개발용 점수 테스트</strong>
        <p>{message}</p>
      </div>
      <label htmlFor="dev-score">점수</label>
      <input
        id="dev-score"
        type="number"
        min={0}
        max={game.maxScore}
        value={score}
        onChange={(event) => setScore(Number(event.target.value))}
      />
      <button
        className="pressable-button"
        type="button"
        onClick={sendScore}
        disabled={sending}
      >
        {sending ? "전송 중..." : "점수 전송"}
      </button>
    </aside>
  );
}
