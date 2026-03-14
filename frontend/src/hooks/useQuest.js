/**
 * useQuest.js — Hook for fetching full quest detail
 *
 * Calls GET /quests/:quest_id to get the full quest object including
 * learning objectives. Useful when Lumi presents a task and you want
 * to show more detail, or when generating a quiz question.
 *
 * Usage:
 *   const { quest, loading, error, fetchQuest } = useQuest();
 *
 *   // Fetch when the current task changes:
 *   useEffect(() => {
 *     if (currentTask?.id) fetchQuest(currentTask.id);
 *   }, [currentTask?.id]);
 */

import { useState, useCallback, useRef } from "react";
import { getQuest, ApiError } from "../lib/api/client";

export function useQuest() {
  const [quest,   setQuest]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const abortRef = useRef(null);

  const fetchQuest = useCallback(async (questId) => {
    if (!questId) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      await new Promise(r => setTimeout(r, 100)); // remove after testing
      const data = await getQuest(questId, abortRef.current.signal);
      setQuest(data);
    } catch (err) {
      if (err.name === "AbortError") return;
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not load quest details."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { quest, loading, error, fetchQuest, clearError };
}
