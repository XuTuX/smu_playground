import type { Metadata } from "next";
import { RankingExplorer } from "@/components/ranking/RankingExplorer";
import { RetroCard } from "@/components/ui/RetroCard";
import { getAllScores } from "@/lib/mock-store";

export const metadata: Metadata = { title: "개인 랭킹" };
export default function RankingPage() { return <div className="site-shell"><header className="page-intro section-heading public-page-intro ranking-page-intro"><div><h1>개인 순위</h1><p>게임과 학과를 골라 현재 순위를 확인하세요.</p></div></header><RetroCard className="ranking-explorer-card"><RankingExplorer scores={getAllScores()} /></RetroCard></div>; }
