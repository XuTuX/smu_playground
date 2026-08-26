import { departments } from "@/data/departments";
import type { ScoreRecord } from "@/lib/types";

export const mockScores: ScoreRecord[] = [];

export const activeDepartmentIds = new Set(
  departments.filter((department) => department.isActive).map(({ id }) => id),
);

