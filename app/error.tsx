"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page rendering failed", error);
  }, [error]);

  return (
    <div className="site-shell data-error-page" role="alert">
      <h1>순위를 불러오지 못했습니다</h1>
      <p>데이터 연결을 확인하고 잠시 후 다시 시도해주세요.</p>
      <button type="button" className="pressable-button" onClick={reset}>
        다시 시도
      </button>
    </div>
  );
}
