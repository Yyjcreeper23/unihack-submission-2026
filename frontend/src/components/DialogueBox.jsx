/**
 * DialogueBox.jsx — Stardew-style dialogue panel (bottom of screen)
 *
 * This is the main UI chrome. It shows:
 *   - Lumi's animated portrait on the left (with idle wing-flap animation)
 *   - Her dialogue text on the right (changes based on game state)
 *   - The goal input on first visit
 *   - The current task + Complete button while playing
 *   - A celebration message when all tasks are done
 *
 * Lumi lives entirely inside this box — she does NOT appear on the field.
 * Her portrait animates with a gentle glow pulse and wing bob.
 *
 * Props:
 *   task        — current task object { id, label, description } or null
 *   taskIndex   — zero-based index of current task (e.g. 0 for first task)
 *   totalTasks  — total number of tasks (usually 5)
 *   allDone     — boolean, true when player has finished all tasks
 *   goal        — the player's goal string (empty if not set yet)
 *   onComplete  — called when player clicks "Complete Task"
 *   onSetGoal(goal, tasks) — called with goal string + mock tasks on submit
 */

import { useState } from "react";
import { useLearningPlan } from "../hooks/useLearningPlan";

export default function DialogueBox({
  task,
  taskIndex,
  totalTasks,
  allDone,
  goal,
  onComplete,
  onSetGoal,
  onShowResources,
  onNewSkill,
}) {
  const [goalInput, setGoalInput] = useState("");
  const [returningAdventurer, setReturningAdventurer] = useState(false);

  // ── Lumi's dialogue — changes based on current game state ────────────────
  const lumiSays = () => {
    if (!goal)
      return returningAdventurer
        ? "You're on a roll, adventurer! ✨ What skill would you like to learn next?"
        : "Hey traveller! I'm Lumi ✨ What skill are you on a quest to learn?";
    if (allDone)
      return `You've completed every quest on your journey to "${goal}"! Your habitat is flourishing! 🎉`;
    if (!task) return "Loading your quests...";
    if (taskIndex === 0)
      return `Yay! Let's begin your journey to "${goal}"! Here's your first challenge!`;
    return `Amazing work! Ready for the next one? Here we go!`;
  };

  const { submit, loading: planLoading, error: planError } = useLearningPlan();

  const handleGoalSubmit = () => {
    if (!goalInput.trim()) return;
    submit(goalInput.trim(), (goal, tasks) => {
      onSetGoal(goal, tasks);
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 220,
        zIndex: 400,
        display: "flex",
        alignItems: "stretch",
        // Warm wooden panel — matches the Stardew Valley reference
        background:
          "linear-gradient(180deg, #c8a96e 0%, #b8935a 40%, #a07840 100%)",
        borderTop: "4px solid #7a5c2e",
        boxShadow: "0 -4px 0 #5a3e1a, 0 -8px 0 rgba(0,0,0,0.3)",
        fontFamily: "'Press Start 2P', monospace",
      }}
    >
      {/* ── LEFT: Lumi's portrait panel ─────────────────────────────────── */}
      <div
        style={{
          width: 180,
          flexShrink: 0,
          background: "linear-gradient(135deg, #d4a96a, #b07830)",
          borderRight: "4px solid #7a5c2e",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: 14,
        }}
      >
        {/* Portrait frame with Lumi's animated sprite inside */}
        <div
          style={{
            width: 140,
            height: 140,
            border: "3px solid #5a3e1a",
            borderRadius: 6,
            background: "linear-gradient(135deg, #ffe8b0, #f0c060)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3), 2px 2px 0 #5a3e1a",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Glow halo behind Lumi — pulses gently */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at 50% 60%, rgba(255,220,80,0.35) 0%, transparent 70%)",
              animation: "lumi-glow 2.5s ease-in-out infinite",
              pointerEvents: "none",
            }}
          />

          {/* Lumi portrait image — replace with real asset at /fairy/lumi-portrait.png */}
          <img
            src="/Lumi.gif"
            alt="Lumi"
            style={{
              width: "70%",
              height: "70%",
              imageRendering: "pixelated",
              objectFit: "cover",
              // Wing-bob idle animation
              animation: "lumi-portrait-idle 1.8s ease-in-out infinite",
              position: "relative",
              zIndex: 1,
            }}
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
          {/* Emoji fallback shown if portrait PNG is missing */}
          <div
            style={{
              display: "none",
              fontSize: 60,
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
              position: "relative",
              zIndex: 1,
              animation: "lumi-portrait-idle 1.8s ease-in-out infinite",
            }}
          >
            🧚
          </div>

          {/* Sparkle particles layered on top of portrait */}
          {["✦", "✧", "✦"].map((s, i) => (
            <span
              key={i}
              style={{
                position: "absolute",
                fontSize: 10,
                color: "#ffe066",
                animation: `sparkle ${1 + i * 0.5}s ease-in-out infinite`,
                top: [6, 18, 2][i],
                right: [8, 4, 20][i],
                zIndex: 2,
                opacity: 0,
              }}
            >
              {s}
            </span>
          ))}
        </div>

        {/* Name plate */}
        <div
          style={{
            background: "linear-gradient(90deg, #5a3e1a, #7a5c2e, #5a3e1a)",
            border: "2px solid #3a2010",
            borderRadius: 3,
            padding: "4px 14px",
            color: "#ffe8a0",
            fontSize: 9,
            letterSpacing: 1,
            textShadow: "1px 1px 0 #3a2010",
          }}
        >
          Lumi
        </div>
      </div>

      {/* ── RIGHT: Dialogue content panel ───────────────────────────────── */}
      <div
        style={{
          flex: 1,
          padding: "14px 24px 14px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 10,
          position: "relative",
          background:
            "linear-gradient(180deg, rgba(255,232,160,0.12) 0%, transparent 100%)",
        }}
      >
        {/* Lumi's spoken line */}
        <div
          style={{
            color: "#3d2b1f",
            fontSize: 14,
            lineHeight: 1.3,
            textShadow: "1px 1px 0 rgba(255,255,255,0.25)",
            animation: "dialogue-appear 0.3s ease-out both",
          }}
        >
          {lumiSays()}
        </div>

        {!goal && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                autoFocus
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGoalSubmit()}
                placeholder="e.g. Learn Python..."
                style={{
                  flex: 1,
                  background: "rgba(255,240,180,0.9)",
                  border: "2px solid #7a5c2e",
                  borderRadius: 4,
                  padding: "7px 12px",
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: 12,
                  color: "#3d2b1f",
                  outline: "none",
                  boxShadow: "inset 1px 1px 3px rgba(0,0,0,0.2)",
                }}
              />
              <button
                onClick={handleGoalSubmit}
                disabled={planLoading}
                style={{ ...primaryBtnStyle, opacity: planLoading ? 0.6 : 1 }}
              >
                {planLoading ? "Generating..." : "Begin Quest!"}
              </button>
            </div>

            {/* Error now sits below the input row */}
            {planError && (
              <div
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: 9,
                  color: "#f80808",
                }}
              >
                ⚠ {planError}
              </div>
            )}
          </div>
        )}

        {/* ── Quest inset box ── */}
        {goal && task && !allDone && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              background: "rgba(0,0,0,0.18)",
              border: "2px solid #5a3e1a",
              borderRadius: 6,
              padding: "16px 20px",
              minHeight: 120,
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)",
            }}
          >
            {/* ⚔ icon */}
            <div style={{ fontSize: 20, flexShrink: 0 }}>⚔️</div>

            {/* Task text */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  color: "#6abf4b",
                  fontSize: 12,
                  marginBottom: 4,
                  textShadow: "1px 1px 0 #2a6f0b",
                }}
              >
                {task.label}
              </div>
              <div style={{ color: "#e8d0a0", fontSize: 11, lineHeight: 1.6 }}>
                {task.description}
              </div>
            </div>

            {/* Right side: progress + button */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 6,
                flexShrink: 0,
              }}
            >
              <div style={{ fontSize: 10, color: "#c8a060" }}>
                Task {taskIndex + 1} of {totalTasks}
              </div>
              <button onClick={onComplete} style={completeBtnStyle}>
                ✓ Complete Task
              </button>
              <button onClick={onShowResources} style={helpBtnStyle}>
                ? How do I do this?
              </button>
            </div>
          </div>
        )}

        {allDone && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div
              style={{
                color: "#ffd700",
                fontSize: 11,
                textAlign: "center",
                textShadow: "0 0 10px #ffd700, 0 0 20px rgba(255,215,0,0.4)",
                animation: "glow-pulse 2s ease-in-out infinite",
                background: "rgba(0,0,0,0.18)",
                border: "2px solid #5a3e1a",
                borderRadius: 6,
                padding: "10px 16px",
              }}
            >
              🏆 All quests complete! Your habitat is flourishing!
            </div>

            <button
              onClick={() => {
                setReturningAdventurer(true);
                onNewSkill();
              }}
              style={newSkillBtnStyle}
            >
              ✦ Learn a New Skill
            </button>
          </div>
        )}
        {/* Chevron */}
        <div
          style={{
            position: "absolute",
            bottom: 8,
            right: 14,
            fontSize: 14,
            color: "rgba(90,62,26,0.35)",
          }}
        >
          ▼
        </div>
      </div>
    </div>
  );
}

// ── Shared button styles ──────────────────────────────────────────────────────
const primaryBtnStyle = {
  background: "linear-gradient(180deg, #6abf4b, #4a9f2b)",
  border: "2px solid #2a6f0b",
  borderRadius: 4,
  padding: "10px 18px", // was 7px 14px
  color: "#e8ffe0",
  fontFamily: "'Press Start 2P', monospace",
  fontSize: 12,
  cursor: "pointer",
  boxShadow: "0 3px 0 #2a6f0b",
  textShadow: "0 1px 0 #1a4f00",
  whiteSpace: "nowrap",
};

const completeBtnStyle = {
  background: "linear-gradient(180deg, #f0c040, #d09010)",
  border: "2px solid #906000",
  borderRadius: 4,
  padding: "10px 22px", // was 7px 16px
  color: "#3d2400",
  fontFamily: "'Press Start 2P', monospace",
  fontSize: 12,
  cursor: "pointer",
  boxShadow: "0 3px 0 #906000",
  textShadow: "0 1px 0 rgba(255,255,255,0.25)",
  whiteSpace: "nowrap",
};

const helpBtnStyle = {
  background: "linear-gradient(180deg, #3a5a8a, #2a3a6a)",
  border: "2px solid #1a2a5a",
  borderRadius: 4,
  padding: "7px 14px",
  color: "#b0d0ff",
  fontFamily: "'Press Start 2P', monospace",
  fontSize: 9,
  cursor: "pointer",
  boxShadow: "0 2px 0 #1a2a5a",
  whiteSpace: "nowrap",
};

const newSkillBtnStyle = {
  flex: 1,
  background: "linear-gradient(180deg, #1a5a8a, #0a3a6a)",
  border: "2px solid #4a9aff",
  borderRadius: 4,
  padding: "10px 8px",
  color: "#c0e0ff",
  fontFamily: "'Press Start 2P', monospace",
  fontSize: 9,
  cursor: "pointer",
  boxShadow: "0 3px 0 #0a2a5a",
  whiteSpace: "nowrap",
};
