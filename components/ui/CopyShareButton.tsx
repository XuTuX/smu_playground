"use client";

import { useState } from "react";

export function CopyShareButton({ title = "기록 링크 복사" }: { title?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      className={`pressable pressable-share${copied ? " pressable-mint" : " pressable-yellow"}`}
      onClick={handleCopy}
    >
      <span>{copied ? "✓ 링크가 복사되었습니다!" : `🔗 ${title}`}</span>
    </button>
  );
}
