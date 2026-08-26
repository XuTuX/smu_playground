import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { DevScoreSimulator } from "@/components/play/DevScoreSimulator";
import { PlayConsole } from "@/components/play/PlayConsole";
import { departmentsByCollege } from "@/data/departments";
import { getGame } from "@/data/games";
import { ADMIN_COOKIE, isValidAdminToken } from "@/lib/admin-auth";

export default async function PlayPage({ params }: { params: Promise<{ deviceId: string }> }) {
  const { deviceId } = await params;
  const game = getGame(deviceId);
  if (!game) notFound();
  const adminToken = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!isValidAdminToken(adminToken)) redirect("/admin");
  const parsed = Number(process.env.NEXT_PUBLIC_REGISTERED_RESET_SECONDS ?? 12);
  const resetSeconds = Number.isFinite(parsed) && parsed >= 3 ? parsed : 12;

  return (
    <div className="play-page">
      <div className="site-shell play-heading"><h1>{game.name}</h1></div>
      <div className="site-shell">
        <PlayConsole
          game={game}
          collegeGroups={departmentsByCollege}
          resetSeconds={resetSeconds}
        />
        {process.env.NODE_ENV === "development" && (
          <DevScoreSimulator game={game} />
        )}
      </div>
    </div>
  );
}
