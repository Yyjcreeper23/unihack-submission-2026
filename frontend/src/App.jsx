/**
 * App.jsx — Root component
 */

import { useState }        from "react";
import { useMonsterStore } from "./hooks/useMonsterStore";
import { MONSTER_ROSTER }  from "./data/monsters";
import Monster             from "./components/Monster";
import DialogueBox         from "./components/DialogueBox";
import GachaPopup          from "./components/GachaPopup";

export default function App() {
  const store = useMonsterStore();

  // pendingMonster: the monster shown in the gacha popup.
  // null = popup hidden. Set on task complete, cleared on claim.
  const [pendingMonster, setPendingMonster] = useState(null);

  // ── Task complete handler ─────────────────────────────────────────────────
  // 1. Advance the task
  // 2. Pick a random unowned monster
  // 3. Show gacha popup — monster is NOT added to habitat until player claims
  const handleTaskComplete = () => {
    store.completeCurrentTask();
    // TODO (Dev A): replace with real POST /api/complete-task
    const unowned = MONSTER_ROSTER.filter(
      (m) => !store.ownedMonsterIds.includes(m.id)
    );
    if (unowned.length === 0) return;
    const pick = unowned[Math.floor(Math.random() * unowned.length)];
    setPendingMonster(pick);
  };

  // ── Claim handler — called when player clicks "Add to Habitat" ────────────
  const handleClaim = () => {
    if (pendingMonster) {
      store.addMonster(pendingMonster.id);
      setPendingMonster(null);
    }
  };

  return (
    <>
      {/* ── Global styles + font import + CSS keyframe animations ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        html, body, #root {
          width: 100%;
          height: 100vh;
          overflow: hidden;
          background: #1a2e0a;
        }

        @keyframes lumi-portrait-idle {
          0%, 100% { transform: translateY(0px) scale(1); }
          40%       { transform: translateY(-4px) scale(1.02); }
          70%       { transform: translateY(-3px) scale(1.01); }
        }
        @keyframes lumi-glow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.08); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0.4) rotate(0deg); }
          50%       { opacity: 1; transform: scale(1.3) rotate(20deg); }
        }
        @keyframes monster-float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-7px); }
        }
        @keyframes monster-bounce {
          0%, 100% { transform: translateY(0px) scaleY(1) scaleX(1); }
          35%       { transform: translateY(-9px) scaleY(1.08) scaleX(0.94); }
          65%       { transform: translateY(-9px) scaleY(1.08) scaleX(0.94); }
          85%       { transform: translateY(0px) scaleY(0.92) scaleX(1.06); }
        }
        @keyframes monster-spin {
          0%,  100% { transform: rotate(0deg)  scale(1); }
          25%        { transform: rotate(6deg)  scale(1.04); }
          75%        { transform: rotate(-6deg) scale(1.04); }
        }
        @keyframes quip-appear {
          from { opacity: 0; transform: translateX(-50%) translateY(4px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0px); }
        }
        @keyframes dialogue-appear {
          from { opacity: 0; transform: translateY(3px); }
          to   { opacity: 1; transform: translateY(0px); }
        }
        @keyframes glow-pulse {
          0%, 100% { text-shadow: 0 0 8px #ffd700; }
          50%       { text-shadow: 0 0 20px #ffd700, 0 0 40px rgba(255,215,0,0.4); }
        }
      `}</style>

      {/* ── HABITAT FIELD ─────────────────────────────────────────────────── */}
      <div style={{
        position:         "relative",
        width:            "100vw",
        height:           "calc(100vh - 220px)",
        backgroundImage:  "url('background/grass.png')",
        backgroundSize:   "704px 320px",
        backgroundRepeat: "repeat",
        backgroundColor:  "#5a9e2a",
        overflow:         "hidden",
      }}>

        {/* Warm morning light overlay */}
        <div style={{
          position:      "absolute",
          inset:         0,
          background:    "radial-gradient(ellipse 80% 50% at 25% 15%, rgba(255,240,160,0.13) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex:        1,
        }} />

        {/* Monsters */}
        {store.ownedMonsters.map((monster) => (
          <Monster
            key={monster.id}
            monster={monster}
            initialPosition={store.monsterPositions[monster.id]}
            onPositionChange={store.updateMonsterPosition}
          />
        ))}

        {/* Empty state hint */}
        {store.ownedMonsters.length === 0 && store.goal && (
          <div style={{
            position:      "absolute",
            top:           "42%",
            left:          "50%",
            transform:     "translate(-50%, -50%)",
            textAlign:     "center",
            color:         "rgba(255,255,255,0.65)",
            fontFamily:    "'Press Start 2P', monospace",
            fontSize:      9,
            lineHeight:    2,
            textShadow:    "1px 1px 2px rgba(0,0,0,0.5)",
            pointerEvents: "none",
            zIndex:        2,
          }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🌿</div>
            Complete a task to<br />summon your first monster!
          </div>
        )}
      </div>

      {/* ── DIALOGUE BOX ──────────────────────────────────────────────────── */}
      <DialogueBox
        task={store.currentTask}
        taskIndex={store.currentTaskIndex}
        totalTasks={store.tasks.length}
        allDone={store.allTasksDone}
        goal={store.goal}
        onComplete={handleTaskComplete}
        onSetGoal={store.setGoalAndTasks}
      />

      {/* ── GACHA POPUP — only shown when pendingMonster is set ── */}
      {pendingMonster && (
        <GachaPopup monster={pendingMonster} onClaim={handleClaim} />
      )}
    </>
  );
}