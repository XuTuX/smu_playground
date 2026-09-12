"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function MockDataToggle({ initialIsMock = false }: { initialIsMock?: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isMock, setIsMock] = useState(initialIsMock);

  const handleToggle = () => {
    const next = !isMock;
    setIsMock(next);
    document.cookie = `smu_mock_data=${next ? "true" : "false"}; path=/; max-age=86400; SameSite=Lax`;

    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      className={`mock-data-toggle-button${isMock ? " is-active" : ""}`}
      onClick={handleToggle}
      disabled={isPending}
      title={
        isMock
          ? "실제 기록으로 돌아가기"
          : "샘플 기록으로 화면 미리보기"
      }
      aria-label={isMock ? "실제 기록 보기" : "샘플 기록 보기"}
    >
      <span className="mock-toggle-icon" aria-hidden="true">
        {isMock ? "✓" : "+"}
      </span>
      <span className="mock-toggle-text">
        {isPending ? "전환 중" : isMock ? "실제 기록 보기" : "샘플 기록 보기"}
      </span>
      {isPending && <span className="mock-toggle-spinner" aria-hidden="true" />}
    </button>
  );
}
