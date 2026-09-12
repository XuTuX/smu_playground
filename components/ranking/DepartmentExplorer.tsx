"use client";

import { useMemo, useState } from "react";
import { colleges, departments } from "@/data/departments";
import { DepartmentRanking } from "@/components/ranking/DepartmentRanking";
import { EmptyState } from "@/components/ui/EmptyState";
import type { DepartmentStanding } from "@/lib/types";

type DepartmentExplorerProps = {
  standings: DepartmentStanding[];
};

export function DepartmentExplorer({ standings }: DepartmentExplorerProps) {
  const [selectedCollegeId, setSelectedCollegeId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const departmentMap = useMemo(() => {
    return new Map(departments.map((dept) => [dept.id, dept]));
  }, []);

  const filteredStandings = useMemo(() => {
    return standings.filter((standing) => {
      const dept = departmentMap.get(standing.departmentId);
      if (!dept) return true;

      // College filter
      if (selectedCollegeId && dept.collegeId !== selectedCollegeId) {
        return false;
      }

      // Keyword search
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        return dept.name.toLowerCase().includes(query);
      }

      return true;
    });
  }, [standings, departmentMap, selectedCollegeId, searchQuery]);

  return (
    <div className="department-explorer">
      <div className="department-filter-bar">
        <div className="search-input-wrap">
          <span className="search-icon" aria-hidden="true">🔍</span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="학과명 검색 (예: 컴퓨터, 간호, 경찰)"
            className="search-input"
            aria-label="학과명 검색"
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-button"
              onClick={() => setSearchQuery("")}
              aria-label="검색어 지우기"
            >
              ✕
            </button>
          )}
        </div>

        <div className="college-filter-chips" role="radiogroup" aria-label="단과대학 선택">
          <button
            type="button"
            className={`college-chip${selectedCollegeId === "" ? " is-active" : ""}`}
            onClick={() => setSelectedCollegeId("")}
            role="radio"
            aria-checked={selectedCollegeId === ""}
          >
            전체 단과대
          </button>
          {colleges.map((college) => (
            <button
              type="button"
              className={`college-chip${selectedCollegeId === college.id ? " is-active" : ""}`}
              onClick={() => setSelectedCollegeId(college.id)}
              role="radio"
              aria-checked={selectedCollegeId === college.id}
              key={college.id}
            >
              {college.name}
            </button>
          ))}
        </div>
      </div>

      <div className="department-filter-status">
        <span>{filteredStandings.length}개 학과 표시 중</span>
        {(selectedCollegeId || searchQuery) && (
          <button
            type="button"
            className="filter-reset-link"
            onClick={() => {
              setSelectedCollegeId("");
              setSearchQuery("");
            }}
          >
            필터 초기화
          </button>
        )}
      </div>

      {filteredStandings.length > 0 ? (
        <DepartmentRanking standings={filteredStandings} limit={filteredStandings.length} />
      ) : (
        <EmptyState
          compact
          title="해당 조건의 학과를 찾을 수 없어요"
          description="검색어나 단과대학 필터를 변경해보세요."
        />
      )}
    </div>
  );
}
