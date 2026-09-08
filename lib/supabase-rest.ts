import "server-only";

type SupabaseConfig = {
  url: string;
  secretKey: string;
};

function readConfig(): SupabaseConfig | null {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url && !secretKey) return null;
  if (!url || !secretKey) {
    throw new Error(
      "SUPABASE_URL과 SUPABASE_SECRET_KEY를 둘 다 설정해주세요.",
    );
  }

  return { url: url.replace(/\/$/u, ""), secretKey };
}

export function isSupabaseConfigured() {
  return readConfig() !== null;
}

export async function supabaseRest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const config = readConfig();
  if (!config) throw new Error("Supabase 환경 변수가 설정되지 않았습니다.");

  const headers = new Headers(init.headers);
  headers.set("apikey", config.secretKey);
  headers.set("Accept", "application/json");
  if (init.body) headers.set("Content-Type", "application/json");

  // Legacy service_role keys are JWTs and still require the Authorization header.
  // Modern sb_secret_ keys must only be sent through the apikey header.
  if (!config.secretKey.startsWith("sb_secret_")) {
    headers.set("Authorization", `Bearer ${config.secretKey}`);
  }

  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
  const text = await response.text();

  if (!response.ok) {
    let message = `Supabase 요청이 실패했습니다. (${response.status})`;
    try {
      const body = JSON.parse(text) as { message?: string; hint?: string };
      message = body.message ?? body.hint ?? message;
    } catch {
      if (text) message = text;
    }
    throw new Error(message);
  }

  return (text ? JSON.parse(text) : null) as T;
}
