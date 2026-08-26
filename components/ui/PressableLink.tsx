import Link from "next/link";
import type { ReactNode } from "react";

export function PressableLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return <Link href={href} className={`pressable ${className}`}>{children}</Link>;
}
