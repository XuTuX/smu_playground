import type { Metadata } from "next";
import { AdminConsole } from "@/components/admin/AdminConsole";
import { RetroCard } from "@/components/ui/RetroCard";

export const metadata: Metadata = { title: "관리자" };
export default function AdminPage() { return <div className="site-shell"><header className="page-intro section-heading"><div><h1>행사 관리</h1><p>전화번호로 참가자를 확인하고 게임 점수를 즉시 등록합니다.</p></div></header><RetroCard className="admin-card"><AdminConsole /></RetroCard></div>; }
