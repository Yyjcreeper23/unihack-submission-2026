import { useState, useEffect, useCallback } from "react";
import { MONSTER_ROSTER, getMonsterById } from "../data/monsters";

const STORAGE_KEY = "monsterquest_save";

const DEFAULT_STATE = {
  goal:             "",
  tasks:            [],
  currentTaskIndex: 0,
  ownedMonsterIds:  [],
  monsterPositions: {},
};

export function useMonsterStore() {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return { ...DEFAULT_STATE, ...JSON.parse(saved) };
    } catch {
      // Corrupt data — start fresh
    }
    return DEFAULT_STATE;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("localStorage save failed:", e);
    }
  }, [state]);

  const setGoalAndTasks = useCallback((goal, tasks) => {
    setState((prev) => ({
      ...prev,
      goal,
      tasks: tasks.map((t) => ({ ...t, completed: false })),
      currentTaskIndex: 0,
    }));
  }, []);

  const addMonster = useCallback((monsterId) => {
    setState((prev) => {
      if (prev.ownedMonsterIds.includes(monsterId)) return prev;
      return {
        ...prev,
        ownedMonsterIds: [...prev.ownedMonsterIds, monsterId],
        monsterPositions: {
          ...prev.monsterPositions,
          [monsterId]: {
            x: 10 + Math.random() * 78,
            y: 10 + Math.random() * 65,
          },
        },
      };
    });
  }, []);

  const completeCurrentTask = useCallback(() => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t, i) =>
        i === prev.currentTaskIndex ? { ...t, completed: true } : t,
      ),
      currentTaskIndex: prev.currentTaskIndex + 1,
    }));
  }, []);

  const updateMonsterPosition = useCallback((monsterId, x, y) => {
    setState((prev) => ({
      ...prev,
      monsterPositions: {
        ...prev.monsterPositions,
        [monsterId]: { x, y },
      },
    }));
  }, []);

  const resetAll = useCallback(() => {
    setState(DEFAULT_STATE);
  }, []);

  const restartWithGoal = useCallback(() => {
    setState((prev) => ({
      ...prev,
      goal:             "",
      tasks:            [],
      currentTaskIndex: 0,
    }));
  }, []);

  const ownedMonsters = state.ownedMonsterIds
    .map((id) => getMonsterById(id))
    .filter(Boolean);

  const currentTask    = state.tasks[state.currentTaskIndex] ?? null;
  const allTasksDone   = state.tasks.length > 0 && state.currentTaskIndex >= state.tasks.length;

  return {
    goal:             state.goal,
    tasks:            state.tasks,
    currentTaskIndex: state.currentTaskIndex,
    currentTask,
    allTasksDone,
    ownedMonsters,
    ownedMonsterIds:  state.ownedMonsterIds,
    monsterPositions: state.monsterPositions,
    totalMonsters:    MONSTER_ROSTER.length,
    setGoalAndTasks,
    addMonster,
    completeCurrentTask,
    updateMonsterPosition,
    resetAll,
    restartWithGoal,
  };
}