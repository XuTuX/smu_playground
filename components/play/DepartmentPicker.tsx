"use client";

import { useMemo, useState } from "react";
import type { College, Department } from "@/lib/types";

type CollegeGroup = College & { departments: Department[] };

export function DepartmentPicker({
  groups,
  value,
  onChange,
}: {
  groups: CollegeGroup[];
  value: string;
  onChange: (departmentId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const selected = groups
    .flatMap((group) => group.departments)
    .find((department) => department.id === value);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("ko");
    return groups
      .map((group) => ({
        ...group,
        departments: group.departments.filter(
          (department) =>
            !normalized ||
            department.name.toLocaleLowerCase("ko").includes(normalized),
        ),
      }))
      .filter((group) => group.departments.length > 0);
  }, [groups, query]);

  return (
    <div className="department-picker">
      <label htmlFor="department-search">학과</label>
      {selected ? (
        <div className="selected-department">
          <span>{selected.name}</span>
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="선택한 학과 지우기"
          >
            ×
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="selected-department department-trigger"
          aria-expanded={isOpen}
          aria-controls="department-options"
          onClick={() => setIsOpen((open) => !open)}
        >
          <span>학과를 선택하세요</span>
          <span aria-hidden="true">{isOpen ? "접기" : "열기"}</span>
        </button>
      )}
      {!selected && isOpen && (
        <>
          <input
            id="department-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="학과를 검색하세요"
            autoComplete="off"
            aria-controls="department-options"
          />
          <div
            className="department-options"
            id="department-options"
            role="listbox"
            aria-label="학과 검색 결과"
          >
            {filtered.map((group) => (
              <div className="department-group" key={group.id}>
                <strong>{group.name}</strong>
                {group.departments.map((department) => (
                  <button
                    role="option"
                    aria-selected={false}
                    type="button"
                    key={department.id}
                    onClick={() => {
                      onChange(department.id);
                      setQuery("");
                      setIsOpen(false);
                    }}
                  >
                    {department.name}
                  </button>
                ))}
              </div>
            ))}
            {filtered.length === 0 && <p>검색 결과가 없습니다.</p>}
          </div>
        </>
      )}
    </div>
  );
}
