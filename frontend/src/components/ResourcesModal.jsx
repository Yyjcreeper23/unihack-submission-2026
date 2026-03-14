/**
 * ResourcesModal.jsx — Learning resources popup
 *
 * Triggered by the "How do I do this?" button next to Complete Task.
 * Fetches resources for the current quest from POST /quests/:id/resources
 * and displays them as clickable links grouped by type.
 *
 * Props:
 *   task      — current task object { id, label, description }
 *   onClose() — called when the modal is dismissed
 */

import { useEffect } from "react";
import { useQuestResources } from "../hooks/useQuestResources";

// Icon per resource type
const TYPE_ICONS = {
  youtube: "▶",
  article: "📄",
  documentation: "📖",
  course: "🎓",
};

const TYPE_LABELS = {
  youtube: "Video",
  article: "Article",
  documentation: "Docs",
  course: "Course",
};

export default function ResourcesModal({ task, onClose }) {
  const {
    resources,
    loading,
    error,
    fetch: fetchResources,
  } = useQuestResources();

  // Fetch resources when the modal opens
  useEffect(() => {
    fetchResources(task.id, {
      max_results: 5,
      resource_types: ["youtube", "article", "documentation"],
    });
  }, [task.id]);

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
          maxWidth: 500,
          width: "90%",
          maxHeight: "75vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 8px 40px rgba(0,0,0,0.8)",
          fontFamily: "'Press Start 2P', monospace",
        }}
      >
        {/* Header */}
        <div
          style={{
            marginBottom: 16,
            paddingBottom: 14,
            borderBottom: "2px solid #3a2010",
          }}
        >
          <div style={{ fontSize: 9, color: "#ffe8a0", marginBottom: 6 }}>
            📚 How do I do this?
          </div>
          <div
            style={{
              fontSize: 7,
              color: "#9a7040",
              lineHeight: 1.8,
            }}
          >
            {task.label}
          </div>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 16,
              padding: "24px 0",
            }}
          >
            {/* Spinning orb */}
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
                textAlign: "center",
              }}
            >
              Finding the best resources...
            </div>
            <div
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 7,
                color: "#5a3e1a",
              }}
            >
              📚 Searching the library...
            </div>
          </div>
        )}

        {/* ── Error ── */}
        {error && !loading && (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div
              style={{
                color: "#ff6b6b",
                fontSize: 8,
                lineHeight: 2,
                textAlign: "center",
              }}
            >
              ⚠ Could not load resources right now.
            </div>
            <button
              onClick={() =>
                fetchResources(task.id, {
                  max_results: 5,
                  resource_types: ["youtube", "article", "documentation"],
                })
              }
              style={secondaryBtnStyle}
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Resource list ── */}
        {resources && !loading && (
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              // Styled scrollbar
              scrollbarWidth: "thin", // Firefox
              scrollbarColor: "#5a3e1a #1a0f05", // Firefox: thumb track
            }}
          >
            {resources.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  color: "#9a7040",
                  fontSize: 8,
                  lineHeight: 2,
                  padding: "20px 0",
                }}
              >
                No resources found for this task.
              </div>
            )}

            {resources.map((r) => (
              <a
                key={r.resource_id}
                href={r.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid #3a2010",
                  borderRadius: 6,
                  padding: "12px 14px",
                  textDecoration: "none",
                  transition: "background 0.15s, border-color 0.15s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,220,80,0.08)";
                  e.currentTarget.style.borderColor = "#7a5c2e";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  e.currentTarget.style.borderColor = "#3a2010";
                }}
              >
                {/* Type badge */}
                <div
                  style={{
                    flexShrink: 0,
                    width: 32,
                    height: 32,
                    background: "rgba(255,220,80,0.1)",
                    border: "1px solid #5a3e1a",
                    borderRadius: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                  }}
                >
                  {TYPE_ICONS[r.type] ?? "🔗"}
                </div>

                {/* Resource info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 7,
                      color: "#ffe8a0",
                      lineHeight: 1.7,
                      marginBottom: 4,
                      wordBreak: "break-word",
                    }}
                  >
                    {r.title}
                  </div>
                  <div
                    style={{
                      fontSize: 6,
                      color: "#9a7040",
                      marginBottom: 4,
                    }}
                  >
                    {TYPE_LABELS[r.type] ?? r.type}
                    {r.source ? ` · ${r.source}` : ""}
                  </div>
                  {r.summary && (
                    <div
                      style={{
                        fontSize: 6,
                        color: "#6a5030",
                        lineHeight: 1.7,
                        wordBreak: "break-word",
                      }}
                    >
                      {r.summary}
                    </div>
                  )}
                </div>

                {/* Arrow */}
                <div
                  style={{
                    flexShrink: 0,
                    color: "#5a3e1a",
                    fontSize: 12,
                    alignSelf: "center",
                  }}
                >
                  →
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          style={{ ...secondaryBtnStyle, marginTop: 16 }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

const secondaryBtnStyle = {
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
  flexShrink: 0,
};
