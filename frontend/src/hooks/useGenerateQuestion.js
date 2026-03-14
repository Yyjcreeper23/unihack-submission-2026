/**
 * useGenerateQuestion.js — Hook for generating a quiz question (stretch goal)
 *
 * Calls POST /generate-question after a monster is caught.
 * The monster's name and tone are sent so the backend can personalise
 * the question in the monster's voice.
 *
 * Usage:
 *   const { question, loading, error, generate } = useGenerateQuestion();
 *
 *   // After gacha reveal:
 *   generate({
 *     questId:  completedTask.id,
 *     difficulty: completedTask.difficulty,
 *     monster: { name: "Slimey", type: "default_monster", tone: "playful" }
 *   });
 */

import { useState, useCallback, useRef } from "react";
import { generateQuestion, ApiError } from "../lib/api/client";

export function useGenerateQuestion() {
  const [question, setQuestion] = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  const abortRef = useRef(null);

  const generate = useCallback(async ({ questId, difficulty, monster }) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);
    setQuestion(null);

    try {
      await new Promise(r => setTimeout(r, 100)); // remove after testing
      const data = await generateQuestion(
        {
          quest_id:      questId,
          question_type: "multiple_choice",
          difficulty:    difficulty ?? "easy",
          monster: {
            type: "default_monster",
            name: monster?.name ?? "Quest Monster",
            tone: "playful",
          },
        },
        abortRef.current.signal
      );
      setQuestion(data);
    } catch (err) {
      if (err.name === "AbortError") return;
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not generate a question."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const clearQuestion = useCallback(() => {
    setQuestion(null);
    setError(null);
  }, []);

  return { question, loading, error, generate, clearQuestion };
}
