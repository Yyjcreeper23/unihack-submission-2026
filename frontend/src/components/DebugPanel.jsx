/**
 * DebugPanel.jsx — Developer tools panel (top-right corner)
 *
 * Lets you test the habitat without a running backend:
 *   - Spawn a random unowned monster onto the field
 *   - Advance to the next task (skipping completion)
 *   - Reset all state back to a blank save
 *
 * TODO: Remove this panel before the final demo, or hide it behind
 *       a URL param: if (!window.location.search.includes("debug")) return null;
 */

import { useState } from "react";
import { MONSTER_ROSTER } from "../data/monsters";

export default function DebugPanel({ store }) {
  const [open, setOpen] = useState(false);

  // Pick a random monster the player doesn't already own
  const spawnRandom = () => {
    const unowned = MONSTER_ROSTER.filter(
      (m) => !store.ownedMonsterIds.includes(m.id)
    );
    if (unowned.length === 0) return;
    const pick = unowned[Math.floor(Math.random() * unowned.length)];
    store.addMonster(pick.id);
  };

  return (
    <div style={{ position: "absolute", top: 10, right: 10, zIndex: 600 }}>
      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={toggleStyle}
      >
        {open ? "✕ Debug" : "⚙ Debug"}
      </button>

      {/* Panel — only rendered when open */}
      {open && (
        <div style={panelStyle}>
          {/* Owned count */}
          <div style={{ color: "#7fff00", fontFamily: "'Press Start 2P', monospace", fontSize: 7, marginBottom: 6 }}>
            🐾 {store.ownedMonsterIds.length} / {MONSTER_ROSTER.length} owned
          </div>

          {/* Goal state */}
          <div style={{ color: "#aaa", fontSize: 10, marginBottom: 8, wordBreak: "break-word", maxWidth: 150 }}>
            Goal: {store.goal || "(none)"}
          </div>

          <button onClick={spawnRandom}         style={{ ...btnStyle, background: "#1a5a0a" }}>+ Spawn Monster</button>
          <button onClick={store.completeCurrentTask} style={{ ...btnStyle, background: "#1a3a6a" }}>▶ Advance Task</button>
          <button onClick={store.resetAll}       style={{ ...btnStyle, background: "#6a1a1a" }}>⟳ Reset All</button>
        </div>
      )}
    </div>
  );
}

const toggleStyle = {
  background:   "rgba(0,0,0,0.55)",
  border:       "1px solid rgba(255,255,255,0.2)",
  borderRadius: 4,
  color:        "#fff",
  fontFamily:   "'Press Start 2P', monospace",
  fontSize:     7,
  padding:      "5px 10px",
  cursor:       "pointer",
};

const panelStyle = {
  marginTop:     4,
  background:    "rgba(0,0,0,0.78)",
  border:        "1px solid #444",
  borderRadius:  6,
  padding:       12,
  display:       "flex",
  flexDirection: "column",
  gap:           6,
  minWidth:      160,
};

const btnStyle = {
  border:        "1px solid #555",
  borderRadius:  3,
  padding:       "6px 10px",
  color:         "#fff",
  fontFamily:    "'Press Start 2P', monospace",
  fontSize:      7,
  cursor:        "pointer",
  textAlign:     "left",
};
