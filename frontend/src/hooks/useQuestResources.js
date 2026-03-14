/**
 * useQuestResources.js — Hook for fetching learning resources for a quest
 *
 * Calls POST /quests/:quest_id/resources
 *
 * Usage in ResourcesModal.jsx:
 *   const { resources, loading, error, fetch } = useQuestResources();
 *   fetch(questId, { max_results: 5, resource_types: ["youtube","article"] });
 */

import { useState, useCallback, useRef } from "react";
import { getQuestResources, ApiError } from "../lib/api/client";

export function useQuestResources() {
  const [resources, setResources] = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const abortRef = useRef(null);

  const fetch = useCallback(async (questId, payload) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);
    setResources(null);

    try {
      const data = await getQuestResources(questId, payload, abortRef.current.signal);
      setResources(data.resources ?? []);
    } catch (err) {
      if (err.name === "AbortError") return;
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not load resources."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  return { resources, loading, error, fetch };
}
