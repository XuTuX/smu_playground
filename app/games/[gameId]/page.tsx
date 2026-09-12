import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { RankingAutoRefresh } from "@/components/ranking/RankingAutoRefresh";
import { TopThreePodium, type TopThreePodiumItem } from "@/components/ranking/TopThreePodium";
import { EmptyState } from "@/components/ui/EmptyState";
import { PressableLink } from "@/components/ui/PressableLink";
import { games, getGame } from "@/data/games";
import { getAllScores } from "@/lib/score-store";
import { getPlayerStandings } from "@/lib/ranking";

export function generateStaticParams() {
  return games.map((game) => ({ gameId: game.slug }));
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ gameId: string }>;
}): Promise<Metadata> {
  const game = getGame((await params).gameId);
  return { title: game ? `${game.name} 순위` : "게임" };
}

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;
  const game = getGame(gameId);
  if (!game) notFound();

  const gameScores = (await getAllScores()).filter((score) => score.gameId === game.id);
  const playerStandings = getPlayerStandings(gameScores);

  const topThreeItems: TopThreePodiumItem[] = playerStandings
    .filter((s) => s.rank <= 3)
    .map((s) => ({
      rank: s.rank as 1 | 2 | 3,
      primaryText: s.nickname,
      subText: s.departmentName,
      score: s.score,
      href: `/ranking/${s.id}`,
    }));

  const remainingStandings = playerStandings.filter((s) => s.rank > 3);

  const accentBgMap: Record<string, string> = {
    yellow: "bg-[#FFF9EA]",
    pink: "bg-[#FDF0F3]",
    sky: "bg-[#EEF6FF]",
    mint: "bg-[#EAF8F1]",
    orange: "bg-[#FFF3EB]",
  };
  const heroBg = accentBgMap[game.accent] ?? "bg-[#FFF9EA]";

  return (
    <div className="site-shell py-6 sm:py-10">
      <RankingAutoRefresh />
      <div className="mb-6">
        <PressableLink
          href="/#game-rankings"
          className="pressable-cream inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white shadow-sm font-bold text-sm text-stone-700 hover:text-stone-950"
        >
          ← 5종 게임 목록
        </PressableLink>
      </div>

      {/* Hero Header with Top 1, 2, 3 Podium */}
      <header className={`p-5 sm:p-8 rounded-3xl ${heroBg} shadow-sm mb-8 overflow-hidden`}>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl sm:text-4xl" aria-hidden="true">
            {game.emoji}
          </span>
          <div>
            <h1 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight">
              {game.name}
            </h1>
            <span className="text-sm font-semibold text-stone-500 mt-0.5 block">
              {game.rankingMode === "team" ? "팀 게임" : "개인 게임"} 순위
            </span>
          </div>
        </div>

        {/* Top 3 Podium */}
        <TopThreePodium items={topThreeItems} theme={game.accent as any} />
      </header>

      {/* 4th Place and Below Ranking List */}
      <div>
        {playerStandings.length === 0 ? (
          <div className="p-10 sm:p-12 text-center bg-white rounded-3xl shadow-sm">
            <EmptyState
              title="아직 등록된 기록이 없어요!"
              description={`${game.name} 부스에 방문해서 오늘의 첫 번째 1위 기록을 세워보세요!`}
              actionText="다른 게임 순위 보기"
              actionHref="/#game-rankings"
            />
          </div>
        ) : remainingStandings.length > 0 ? (
          <div className="space-y-3">
              {remainingStandings.map((standing) => (
                <Link
                  key={standing.id}
                  href={`/ranking/${standing.id}`}
                  className="p-4 sm:p-5 bg-white rounded-3xl shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-4 flex-wrap block"
                >
                  {/* Left: Rank badge + Name + Department */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="w-11 h-11 rounded-2xl flex items-center justify-center text-sm sm:text-base shrink-0 bg-stone-100 text-stone-600 font-extrabold">
                      {standing.rank}위
                    </span>
                    <div className="min-w-0">
                      <strong className="block text-base sm:text-lg font-black text-stone-900 truncate">
                        {standing.nickname}
                      </strong>
                      <span className="text-sm font-semibold text-stone-500 truncate block">
                        {standing.departmentName}
                      </span>
                    </div>
                  </div>

                  {/* Right: Score */}
                  <div className="flex items-center gap-1.5 ml-auto">
                    <span className="text-sm font-bold text-stone-500">기록</span>
                    <b className="text-lg sm:text-xl font-black text-stone-900">
                      {standing.score.toLocaleString("ko-KR")}
                      <span className="text-sm font-bold ml-0.5">점</span>
                    </b>
                  </div>
                </Link>
              ))}
            </div>
        ) : null}
      </div>
    </div>
  );
}
