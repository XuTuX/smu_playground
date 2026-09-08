import "server-only";

import { google, type sheets_v4 } from "googleapis";
import type { SheetScoreRecord } from "@/lib/sheet-score-parser";

const READONLY_SCOPE = "https://www.googleapis.com/auth/spreadsheets.readonly";
const WRITE_SCOPE = "https://www.googleapis.com/auth/spreadsheets";

let sheetsClient: sheets_v4.Sheets | undefined;

function requiredEnvironmentValue(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} 환경 변수가 설정되지 않았습니다.`);
  return value;
}

function getSheetsClient() {
  if (sheetsClient) return sheetsClient;

  const email = requiredEnvironmentValue("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const privateKey = requiredEnvironmentValue(
    "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY",
  ).replace(/\\n/g, "\n");
  const auth = new google.auth.JWT({
    email,
    key: privateKey,
    scopes: [
      process.env.GOOGLE_SHEETS_READ_ONLY === "true"
        ? READONLY_SCOPE
        : WRITE_SCOPE,
    ],
  });

  sheetsClient = google.sheets({ version: "v4", auth });
  return sheetsClient;
}

export function isGoogleSheetsEnabled() {
  return process.env.GOOGLE_SHEETS_ENABLED === "true";
}

export async function readGoogleSheetScoreRows() {
  const sheets = getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: requiredEnvironmentValue("GOOGLE_SHEETS_SPREADSHEET_ID"),
    range: process.env.GOOGLE_SHEETS_SCORE_RANGE ?? "'점수'!A1:J",
    majorDimension: "ROWS",
    valueRenderOption: "UNFORMATTED_VALUE",
    dateTimeRenderOption: "FORMATTED_STRING",
  });

  return (response.data.values ?? []) as unknown[][];
}

export async function appendGoogleSheetScore(score: SheetScoreRecord) {
  if (process.env.GOOGLE_SHEETS_READ_ONLY === "true") {
    throw new Error("Google Sheets가 읽기 전용으로 설정되어 있습니다.");
  }

  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: requiredEnvironmentValue("GOOGLE_SHEETS_SPREADSHEET_ID"),
    range: process.env.GOOGLE_SHEETS_APPEND_RANGE ?? "'점수'!A:J",
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [[
        score.id,
        score.sessionId,
        score.studentId ?? "",
        score.gameId,
        score.departmentId,
        score.nickname,
        score.score,
        score.createdAt,
        true,
        score.source,
      ]],
    },
  });
}
