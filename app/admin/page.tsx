import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AdminConsole } from "@/components/admin/AdminConsole";
import { RetroCard } from "@/components/ui/RetroCard";
import { ADMIN_COOKIE, isValidAdminToken } from "@/lib/admin-auth";
import { getAdminSnapshot } from "@/lib/admin-snapshot";

export const metadata: Metadata = { title: "관리자" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const authenticated = isValidAdminToken(cookieStore.get(ADMIN_COOKIE)?.value);
  const initialSnapshot = authenticated ? await getAdminSnapshot() : null;

  return (
    <div className="site-shell">
      <header className="page-intro section-heading">
        <div>
          <h1>행사 관리</h1>
          <p>전화번호로 참가자를 확인하고 게임 점수를 즉시 등록합니다.</p>
        </div>
      </header>
      <RetroCard className="admin-card">
        <AdminConsole initialSnapshot={initialSnapshot} />
      </RetroCard>
    </div>
  );
}
