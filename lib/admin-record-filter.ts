import { getDepartment } from "@/data/departments";
import type { AdminScoreRecord } from "@/lib/types";

export function filterAdminRecords(
  records: AdminScoreRecord[],
  gameId: string,
  rawQuery: string,
) {
  const gameRecords = records.filter((record) => record.gameId === gameId);
  const query = rawQuery.trim().toLocaleLowerCase("ko");
  if (!query) return gameRecords;

  const phoneQuery = query.replace(/\D/g, "");
  return gameRecords.filter((record) => {
    const phone = record.participantPhone ?? "";
    const searchText = [
      record.nickname,
      getDepartment(record.departmentId)?.name ?? record.departmentId,
      phone || "미등록",
    ]
      .join(" ")
      .toLocaleLowerCase("ko");

    return (
      searchText.includes(query) ||
      (phoneQuery.length > 0 && phone.includes(phoneQuery))
    );
  });
}
