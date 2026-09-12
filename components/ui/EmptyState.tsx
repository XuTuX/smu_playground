import { PressableLink } from "@/components/ui/PressableLink";
import { SeryongMascot } from "@/components/ui/SeryongMascot";

type EmptyStateProps = {
  title?: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  compact?: boolean;
};

export function EmptyState({
  title = "아직 등록된 기록이 없어요!",
  description = "부스에서 게임에 참여하고 첫 번째 1위의 주인공이 되어보세요.",
  actionText,
  actionHref,
  compact = false,
}: EmptyStateProps) {
  return (
    <div className={`empty-state-card${compact ? " empty-state-compact" : ""}`}>
      <div className="empty-state-mascot-wrap">
        <SeryongMascot className="empty-state-mascot" sizes="110px" />
      </div>
      <strong className="empty-state-title">{title}</strong>
      {description && <p className="empty-state-desc">{description}</p>}
      {actionText && actionHref && (
        <div className="empty-state-action">
          <PressableLink href={actionHref} className="pressable-yellow">
            {actionText}
          </PressableLink>
        </div>
      )}
    </div>
  );
}
