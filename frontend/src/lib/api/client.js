/**
 * client.js — All backend API calls
 *
 * Base URL is read from the .env file:
 *   VITE_API_BASE_URL=http://localhost:8000
 *
 * Every function throws an ApiError on failure so
 * the calling hook can handle it consistently.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

// ── Custom error class ────────────────────────────────────────────────────────
export class ApiError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
    this.name = "ApiError";
  }
}

// ── Shared fetch wrapper ──────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    const code    = data?.error?.code    ?? "UNKNOWN_ERROR";
    const message = data?.error?.message ?? "Something went wrong.";
    throw new ApiError(code, message);
  }

  return data;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. createLearningPlan
//
// Sends the user's goal text and gets back a full quest list.
// Called when the player submits the goal input in DialogueBox.
//
// payload: { prompt: string, max_quests: number }
// returns: { plan_id, goal, quests: [...], source, total_hits }
// ─────────────────────────────────────────────────────────────────────────────
export async function createLearningPlan(payload, signal) {
  return apiFetch("/learning-plans", {
    method: "POST",
    body:   JSON.stringify(payload),
    signal,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. getQuest
//
// Fetches full detail for a single quest by its id.
// Useful for showing learning objectives when Lumi presents a task.
//
// returns: { quest_id, title, description, difficulty,
//            learning_objectives, keywords, category, raw_document }
// ─────────────────────────────────────────────────────────────────────────────
export async function getQuest(questId, signal) {
  return apiFetch(`/quests/${questId}`, { signal });
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. getQuestResources  (stretch — used by quiz / study feature)
//
// Fetches learning resources (videos, articles, docs) for a quest.
//
// payload: { max_results: number, resource_types: string[] }
// returns: { quest_id, resources: [...] }
// ─────────────────────────────────────────────────────────────────────────────
export async function getQuestResources(questId, payload, signal) {
  return apiFetch(`/quests/${questId}/resources`, {
    method: "POST",
    body:   JSON.stringify(payload),
    signal,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. generateQuestion  (stretch — used by quiz mode)
//
// Generates a practice question for a completed quest.
// The monster object personalises the tone of the question.
//
// payload: { quest_id, question_type, difficulty,
//            monster: { type, name, tone } }
// returns: { question_id, quest_id, monster, question_type,
//            difficulty, question, options, answer, explanation }
// ─────────────────────────────────────────────────────────────────────────────
export async function generateQuestion(payload, signal) {
  return apiFetch("/generate-question", {
    method: "POST",
    body:   JSON.stringify(payload),
    signal,
  });
}
