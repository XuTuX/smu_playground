import type { Metadata } from "next";
import { AdminConsole } from "@/components/admin/AdminConsole";
import { RetroCard } from "@/components/ui/RetroCard";

export const metadata: Metadata = { title: "관리자" };
export default function AdminPage() { return <div className="site-shell"><header className="page-intro section-heading"><div><h1>행사 관리</h1><p>학생의 게임 점수를 직접 등록하고 순위 반영 결과를 확인합니다.</p></div></header><RetroCard className="admin-card"><AdminConsole /></RetroCard></div>; }
