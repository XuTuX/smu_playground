import type { ActivityItem } from "@/lib/types";

export function ActivityFeed({ activities }: { activities: ActivityItem[] }) {
  return <div className="activity-feed">{activities.slice(0, 6).map((item) => <div className="activity-item" key={item.id}><strong className="activity-game">{item.gameName}</strong><div className="activity-player"><strong>{item.nickname}</strong><span>{item.departmentName}</span></div><b>{item.score}점</b></div>)}</div>;
}
