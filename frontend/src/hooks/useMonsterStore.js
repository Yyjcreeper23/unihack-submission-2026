/**
 * useMonsterStore.js — Global game state + localStorage persistence
 *
 * This hook is the single place all game state lives.
 * Import it in any component that needs to read or change game data.
 *
 * Usage:
 *   import { useMonsterStore } from "../hooks/useMonsterStore";
 *   const { goal, ownedMonsters, addMonster, completeCurrentTask } = useMonsterStore();
 *
 * What it persists to localStorage:
 *   goal             — the player's current learning goal string
 *   tasks            — the AI-generated task list with completion flags
 *   currentTaskIndex — which task Lumi is currently presenting
 *   ownedMonsterIds  — array of monster ids the player has caught
 *   monsterPositions — last known position of each monster on the field
 *                      stored as percentages so it's responsive:
 *                      { "m001": { x: 42.5, y: 67.1 } }
 */

import { useState, useEffect, useCallback } from "react";
import { MONSTER_ROSTER, getMonsterById } from "../data/monsters";

const STORAGE_KEY = "monsterquest_save";

// ─────────────────────────────────────────────────────────────────────────────
// Default save — what a brand new player starts with (nothing owned, no goal)
// ─────────────────────────────────────────────────────────────────────────────
const DEFAULT_STATE = {
  goal:             "",
  tasks:            [],
  currentTaskIndex: 0,
  ownedMonsterIds:  [],
  monsterPositions: {},
};

export function useMonsterStore() {
  // ── Initialise from localStorage (runs once on mount) ────────────────────
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return { ...DEFAULT_STATE, ...JSON.parse(saved) };
    } catch {
      // Corrupt data — start fresh
    }
    return DEFAULT_STATE;
  });

  // ── Auto-save whenever state changes ─────────────────────────────────────
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("localStorage save failed:", e);
    }
  }, [state]);

  // ── ACTIONS ───────────────────────────────────────────────────────────────

  /**
   * setGoalAndTasks
   * Called when the player enters a goal and the AI (or mock) returns tasks.
   * Resets task progress so the player starts fresh on the new goal.
   *
   * @param {string} goal   - e.g. "Learn Python"
   * @param {Array}  tasks  - [{ id, label, description }]
   */
  const setGoalAndTasks = useCallback((goal, tasks) => {
    setState((prev) => ({
      ...prev,
      goal,
      tasks: tasks.map((t) => ({ ...t, completed: false })),
      currentTaskIndex: 0,
    }));
  }, []);

  /**
   * addMonster
   * Called after a successful gacha pull.
   * Assigns a random starting position so the monster spawns somewhere
   * natural-looking rather than always at the centre.
   * Silently ignores duplicate ids.
   *
   * @param {string} monsterId - e.g. "m003"
   */
  const addMonster = useCallback((monsterId) => {
    setState((prev) => {
      // Don't add duplicates
      if (prev.ownedMonsterIds.includes(monsterId)) return prev;
      return {
        ...prev,
        ownedMonsterIds: [...prev.ownedMonsterIds, monsterId],
        monsterPositions: {
          ...prev.monsterPositions,
          [monsterId]: {
            // Keep away from edges so monsters don't spawn half off-screen
            x: 10 + Math.random() * 78,
            y: 10 + Math.random() * 65,
          },
        },
      };
    });
  }, []);

  /**
   * completeCurrentTask
   * Marks the active task as done and advances to the next one.
   * The DialogueBox reads currentTaskIndex to know what to display.
   */
  const completeCurrentTask = useCallback(() => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t, i) =>
        i === prev.currentTaskIndex ? { ...t, completed: true } : t
      ),
      currentTaskIndex: prev.currentTaskIndex + 1,
    }));
  }, []);

  /**
   * updateMonsterPosition
   * Called by the Monster component's walk AI after each move.
   * Saves the position so monsters don't teleport on re-render.
   *
   * @param {string} monsterId
   * @param {number} x  - percentage (0–100) of field width
   * @param {number} y  - percentage (0–100) of field height
   */
  const updateMonsterPosition = useCallback((monsterId, x, y) => {
    setState((prev) => ({
      ...prev,
      monsterPositions: {
        ...prev.monsterPositions,
        [monsterId]: { x, y },
      },
    }));
  }, []);

  /**
   * resetAll
   * Wipes everything back to DEFAULT_STATE.
   * Useful for demos and testing — exposed via the debug panel.
   */
  const resetAll = useCallback(() => {
    setState(DEFAULT_STATE);
  }, []);

  // ── DERIVED VALUES ────────────────────────────────────────────────────────

  // Resolve ids → full monster objects, filtering out any stale ids
  const ownedMonsters = state.ownedMonsterIds
    .map((id) => getMonsterById(id))
    .filter(Boolean);

  // The task Lumi is currently presenting (null if none / all done)
  const currentTask = state.tasks[state.currentTaskIndex] ?? null;

  // True once the player has completed all tasks in their current goal
  const allTasksDone =
    state.tasks.length > 0 &&
    state.currentTaskIndex >= state.tasks.length;

  return {
    // ── Readable state ──────────────────────────────────────────────────────
    goal:             state.goal,
    tasks:            state.tasks,
    currentTaskIndex: state.currentTaskIndex,
    currentTask,
    allTasksDone,
    ownedMonsters,
    ownedMonsterIds:  state.ownedMonsterIds,
    monsterPositions: state.monsterPositions,
    totalMonsters:    MONSTER_ROSTER.length,

    // ── Actions ─────────────────────────────────────────────────────────────
    setGoalAndTasks,
    addMonster,
    completeCurrentTask,
    updateMonsterPosition,
    resetAll,
  };
}
