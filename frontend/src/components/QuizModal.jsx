/**
 * QuizModal.jsx — Revision question modal triggered by clicking a monster
 *
 * Shown when a monster has a pending question (first click).
 * The monster "asks" the player a multiple choice question about
 * the task that unlocked it.
 *
 * States:
 *   loading   — waiting for backend to generate the question
 *   question  — showing the question and answer options
 *   answered  — showing whether the player was right or wrong
 *   error     — backend failed, show a retry button
 *
 * Props:
 *   monster       — the monster object asking the question
 *   questId       — the task id that unlocked this monster
 *   difficulty    — difficulty string from the task
 *   onClose()     — called when the modal is dismissed
 */

import { useEffect, useState } from "react";
import { useGenerateQuestion } from "../hooks/useGenerateQuestion";

export default function QuizModal({ monster, questId, difficulty, onClose }) {
  const { question, loading, error, generate } = useGenerateQuestion();

  // Which answer option the player selected (null = none yet)
  const [selected, setSelected] = useState(null);

  // Whether the player has submitted their answer
  const [submitted, setSubmitted] = useState(false);

  // Generate the question as soon as the modal opens
  useEffect(() => {
    generate({
      questId,
      difficulty,
      monster: { name: monster.name, type: "default_monster", tone: "playful" },
    });
  }, []);

  const handleSelect = (option) => {
    if (submitted) return;
    setSelected(option);
  };

  const handleSubmit = () => {
    if (!selected) return;
    setSubmitted(true);
  };

  const isCorrect = submitted && selected === question?.answer;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 800,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(2px)",
      }}
    >
      <div
        style={{
          background: "linear-gradient(180deg, #1a0f05 0%, #0d0802 100%)",
          border: "3px solid #7a5c2e",
          borderRadius: 10,
          padding: 28,
          maxWidth: 480,
          width: "90%",
          boxShadow: "0 8px 40px rgba(0,0,0,0.8)",
          fontFamily: "'Press Start 2P', monospace",
        }}
      >
        {/* Monster portrait + header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 20,
            paddingBottom: 14,
            borderBottom: "2px solid #3a2010",
          }}
        >
          <img
            src={monster.sprite}
            alt={monster.name}
            width={56}
            height={56}
            style={{ imageRendering: "pixelated", objectFit: "contain" }}
          />
          <div>
            <div style={{ fontSize: 9, color: "#ffe8a0", marginBottom: 5 }}>
              {monster.name} has a question!
            </div>
            <div style={{ fontSize: 7, color: "#9a7040" }}>
              Answer correctly to impress them
            </div>
          </div>
        </div>

        {/* ── Loading state ── */}
        {loading && (
          <div
            style={{
              textAlign: "center",
              padding: "24px 0",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                border: "3px solid #3a2010",
                borderTop: "3px solid #ffd700",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <div
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 8,
                color: "#ffe8a0",
                lineHeight: 2,
              }}
            >
              {monster.name} is thinking...
            </div>
          </div>
        )}

        {/* ── Error state ── */}
        {error && !loading && (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div
              style={{
                color: "#ff6b6b",
                fontSize: 8,
                marginBottom: 14,
                lineHeight: 2,
              }}
            >
              ⚠ Couldn't load a question right now.
            </div>
            <button onClick={onClose} style={closeBtnStyle}>
              Close
            </button>
          </div>
        )}

        {/* ── Question ── */}
        {question && !loading && (
          <>
            {/* Question text */}
            <div
              style={{
                color: "#ffe8a0",
                fontSize: 9,
                lineHeight: 1.9,
                marginBottom: 18,
              }}
            >
              {question.question}
            </div>

            {/* Answer options */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginBottom: 18,
              }}
            >
              {(question.options ?? []).map((option, i) => {
                let bg = "rgba(255,255,255,0.05)";
                let border = "1px solid #3a2010";
                let color = "#c8a060";

                if (submitted) {
                  if (option === question.answer) {
                    bg = "rgba(74,159,43,0.25)";
                    border = "2px solid #4a9f2b";
                    color = "#7fff00";
                  } else if (option === selected) {
                    bg = "rgba(180,30,30,0.25)";
                    border = "2px solid #b41e1e";
                    color = "#ff6b6b";
                  }
                } else if (option === selected) {
                  bg = "rgba(255,220,80,0.15)";
                  border = "2px solid #ffd700";
                  color = "#ffd700";
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(option)}
                    disabled={submitted}
                    style={{
                      background: bg,
                      border,
                      borderRadius: 5,
                      padding: "10px 14px",
                      color,
                      fontFamily: "'Press Start 2P', monospace",
                      fontSize: 8,
                      cursor: submitted ? "default" : "pointer",
                      textAlign: "left",
                      lineHeight: 1.7,
                      transition: "background 0.15s, border-color 0.15s",
                    }}
                  >
                    {String.fromCharCode(65 + i)}. {option}
                  </button>
                );
              })}
            </div>

            {/* Result message */}
            {submitted && (
              <div
                style={{
                  textAlign: "center",
                  marginBottom: 14,
                  fontSize: 9,
                  color: isCorrect ? "#7fff00" : "#ff6b6b",
                  lineHeight: 1.8,
                }}
              >
                {isCorrect
                  ? `✓ Correct! ${monster.name} is impressed!`
                  : `✗ Not quite. The answer was: ${question.answer}`}
                {question.explanation && (
                  <div
                    style={{
                      fontSize: 7,
                      color: "#9a7040",
                      marginTop: 8,
                      lineHeight: 1.8,
                    }}
                  >
                    {question.explanation}
                  </div>
                )}
              </div>
            )}

            {/* Submit / Close button */}
            {!submitted ? (
              <button
                onClick={handleSubmit}
                disabled={!selected}
                style={{
                  ...submitBtnStyle,
                  opacity: selected ? 1 : 0.5,
                  cursor: selected ? "pointer" : "default",
                }}
              >
                Submit Answer
              </button>
            ) : (
              <button onClick={onClose} style={closeBtnStyle}>
                Back to Habitat
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const submitBtnStyle = {
  width: "100%",
  background: "linear-gradient(180deg, #f0c040, #d09010)",
  border: "2px solid #906000",
  borderRadius: 5,
  padding: "11px 0",
  color: "#3d2400",
  fontFamily: "'Press Start 2P', monospace",
  fontSize: 9,
  cursor: "pointer",
  boxShadow: "0 3px 0 #906000",
};

const closeBtnStyle = {
  width: "100%",
  background: "linear-gradient(180deg, #5a3e1a, #3a2010)",
  border: "2px solid #7a5c2e",
  borderRadius: 5,
  padding: "11px 0",
  color: "#ffe8a0",
  fontFamily: "'Press Start 2P', monospace",
  fontSize: 9,
  cursor: "pointer",
  boxShadow: "0 3px 0 #3a2010",
};
