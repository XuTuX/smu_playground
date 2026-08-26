import { DepartmentRanking } from "@/components/ranking/DepartmentRanking";
import { PlayerRanking } from "@/components/ranking/PlayerRanking";
import { RankingPodium } from "@/components/ranking/RankingPodium";
import { RetroCard } from "@/components/ui/RetroCard";
import { PressableLink } from "@/components/ui/PressableLink";
import { getAllScores } from "@/lib/mock-store";
import { getDepartmentStandings, getPlayerStandings } from "@/lib/ranking";

export default function HomePage() {
  const scores = getAllScores();
  const standings = getDepartmentStandings(scores);
  const playerStandings = getPlayerStandings(scores, { limit: 8 });

  return (
    <div className="departments-page">
      <header className="department-battle-hero">
        <div className="site-shell">
          <h1>SMU 놀이터</h1>
        </div>
      </header>
      <div className="site-shell">
        {standings.length > 0 && (
          <>
            <RankingPodium standings={standings} />
            <section className="section-block">
              <div className="section-heading">
                <h2>학과별 순위</h2>
                <p className="ranking-rule">게임별 상위 5개 기록 합산</p>
              </div>
              <RetroCard className="all-departments-card">
                <DepartmentRanking
                  standings={standings}
                  limit={standings.length}
                />
              </RetroCard>
            </section>
          </>
        )}
        {playerStandings.length > 0 && (
          <section className="section-block home-player-ranking-section">
            <div className="section-heading">
              <h2>개인 순위</h2>
              <PressableLink href="/ranking" className="pressable-cream">전체 개인 순위</PressableLink>
            </div>
            <RetroCard className="home-player-ranking-card">
              <PlayerRanking standings={playerStandings} />
            </RetroCard>
          </section>
        )}
        {standings.length === 0 && playerStandings.length === 0 && (
          <section className="section-block">
            <RetroCard style={{ padding: "64px 20px", textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: "17px", color: "var(--muted)" }}>
                아직 등록된 게임 기록이 없습니다.
              </p>
            </RetroCard>
          </section>
        )}
      </div>
    </div>
  );
}
