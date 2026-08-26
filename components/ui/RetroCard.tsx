import type { ComponentPropsWithoutRef, ReactNode } from "react";

type RetroCardProps = ComponentPropsWithoutRef<"div"> & {
  children: ReactNode;
  accent?: "cream" | "yellow" | "pink" | "sky" | "mint" | "orange";
  interactive?: boolean;
};

export function RetroCard({ children, accent = "cream", interactive = false, className = "", ...props }: RetroCardProps) {
  return <div className={`retro-card accent-${accent} ${interactive ? "retro-card-interactive" : ""} ${className}`} {...props}>{children}</div>;
}
