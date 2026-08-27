"use client";

import {
  Children,
  type KeyboardEvent,
  type ReactNode,
  useRef,
  useState,
} from "react";
import type { Game } from "@/lib/types";

type GameRankingTab = Pick<Game, "id" | "name" | "accent">;

type GameRankingTabsProps = {
  tabs: GameRankingTab[];
  children: ReactNode;
};

export function GameRankingTabs({ tabs, children }: GameRankingTabsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const panels = Children.toArray(children);

  if (tabs.length === 0 || panels.length === 0) return null;

  const activateTab = (index: number, focus = false) => {
    setActiveIndex(index);
    if (focus) tabRefs.current[index]?.focus();
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let nextIndex: number | null = null;

    if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = tabs.length - 1;

    if (nextIndex === null) return;
    event.preventDefault();
    activateTab(nextIndex, true);
  };

  return (
    <div className="home-game-tabs">
      <div className="home-game-tablist" role="tablist" aria-label="게임 선택">
        {tabs.map((tab, index) => {
          const isActive = index === activeIndex;

          return (
            <button
              className={`home-game-tab accent-${tab.accent}${isActive ? " is-active" : ""}`}
              id={`game-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-controls={`game-panel-${tab.id}`}
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              onClick={() => activateTab(index)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              key={tab.id}
            >
              <small>게임 {index + 1}</small>
              <strong>{tab.name}</strong>
            </button>
          );
        })}
      </div>

      {tabs.map((tab, index) => (
        <div
          className="home-game-tabpanel"
          id={`game-panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`game-tab-${tab.id}`}
          tabIndex={index === activeIndex ? 0 : -1}
          hidden={index !== activeIndex}
          key={tab.id}
        >
          {panels[index]}
        </div>
      ))}
    </div>
  );
}
