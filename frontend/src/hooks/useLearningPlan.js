/**
 * useLearningPlan.js — Hook for creating a learning plan from the backend
 *
 * Calls POST /learning-plans with the user's goal text.
 * Maps the response into the task shape that useMonsterStore expects.
 *
 * Usage in DialogueBox.jsx:
 *   const { submit, loading, error } = useLearningPlan();
 *
 *   // When the player clicks "Begin Quest!":
 *   submit("I want to learn guitar", (goal, tasks) => {
 *     onSetGoal(goal, tasks);  // pass to store
 *   });
 */

import { useState, useCallback, useRef } from "react";
import { createLearningPlan, ApiError } from "../lib/api/client";

export function useLearningPlan() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  // Ref holds the AbortController so we can cancel in-flight requests
  const abortRef = useRef(null);

  const submit = useCallback(async (goalText, onSuccess) => {
    // Cancel any previous in-flight request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      await new Promise(r => setTimeout(r, 100)); // remove after testing
      const data = await createLearningPlan(
        {
          prompt:     goalText,
          max_quests: 5,       // always request exactly 5 quests to match Lumi's flow
        },
        abortRef.current.signal
      );

      // Map backend quest shape → the task shape useMonsterStore expects
      // Backend:  { quest_id, title, description, difficulty, ... }
      // Store:    { id, label, description, completed, reward }
      const tasks = (data.quests ?? []).map((q) => ({
        id:          q.quest_id,
        label:       q.title,
        description: q.description,
        difficulty:  q.difficulty   ?? "medium",
        objectives:  q.learning_objectives ?? [],
        keywords:    q.keywords     ?? [],
        completed:   false,
        reward:      null,
      }));

      // goal comes back from the backend — use it (it may be cleaned up vs raw input)
      onSuccess?.(data.goal ?? goalText, tasks, data.plan_id);

    } catch (err) {
      // AbortError means the component unmounted or a new request started — ignore
      if (err.name === "AbortError") return;

      const message = err instanceof ApiError
        ? err.message
        : "Could not connect to the server. Is the backend running?";

      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // clearError lets the UI reset the error banner on retry
  const clearError = useCallback(() => setError(null), []);

  return { submit, loading, error, clearError };
}
