/**
 * Monster.jsx — A single wandering creature on the habitat field
 *
 * New in this version:
 *   - "!" exclamation badge above monster if they have a quiz ready
 *     (hasQuizReady prop = true means first click ever for this monster)
 *   - First click: if hasQuizReady, triggers onQuizClick instead of quip
 *   - Subsequent clicks: shows quip bubble as before
 */

import { useState, useEffect, useRef } from "react";

export default function Monster({
  monster,
  initialPosition,
  onPositionChange,
  hasQuizReady,     // true if this monster hasn't been clicked yet
  onQuizClick,      // called when player clicks a quiz-ready monster
}) {
  const [pos, setPos]               = useState(() => initialPosition ?? { x: 50, y: 50 });
  const [moving, setMoving]         = useState(false);
  const [travelTime, setTravelTime] = useState(2000);
  const [facing, setFacing]         = useState(1);
  const [quip, setQuip]             = useState(null);

  const walkTimerRef  = useRef(null);
  const quipTimerRef  = useRef(null);
  const posRef        = useRef(pos);

  // Keep posRef in sync with pos state
  useEffect(() => { posRef.current = pos; }, [pos]);

  // ── Walk AI ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const scheduleNextWalk = () => {
      const isLongPause = Math.random() < 0.15;
      const delay = isLongPause
        ? 6000 + Math.random() * 4000
        : 3000 + Math.random() * 3000;

      walkTimerRef.current = setTimeout(() => {
        if (Math.random() < 0.2) {
          scheduleNextWalk();
          return;
        }

        const current  = posRef.current;
        const stepX    = (Math.random() - 0.5) * 36;
        const stepY    = (Math.random() - 0.5) * 28;
        const newX     = Math.max(4, Math.min(94, current.x + stepX));
        const newY     = Math.max(6, Math.min(88, current.y + stepY));

        setFacing(stepX >= 0 ? 1 : -1);

        const dist     = Math.sqrt(stepX ** 2 + stepY ** 2);
        const travelMs = Math.max(3000, (dist / 10) * 1000 * 3.5);

        setTravelTime(travelMs);
        setMoving(true);
        setPos({ x: newX, y: newY });
        onPositionChange?.(monster.id, newX, newY);

        setTimeout(() => {
          setMoving(false);
          scheduleNextWalk();
        }, travelMs + 50);

      }, delay);
    };

    scheduleNextWalk();
    return () => clearTimeout(walkTimerRef.current);
  }, [monster.id]);

  // ── Click handler ─────────────────────────────────────────────────────────
  const handleClick = () => {
    // If monster has a quiz ready, trigger quiz instead of quip
    if (hasQuizReady) {
      onQuizClick?.(monster);
      return;
    }
    // Otherwise show quip bubble
    clearTimeout(quipTimerRef.current);
    setQuip(monster.quip);
    quipTimerRef.current = setTimeout(() => setQuip(null), 3000);
  };

  useEffect(() => () => clearTimeout(quipTimerRef.current), []);

  const transitionStyle = moving
    ? { transition: `left ${travelTime}ms cubic-bezier(0.45,0,0.55,1), top ${travelTime}ms cubic-bezier(0.45,0,0.55,1)` }
    : { transition: "none" };

  const idleStyle = !moving && monster.idleAnim !== "none"
    ? { animation: `monster-${monster.idleAnim} 2.4s ease-in-out infinite` }
    : {};

  return (
    <div
      style={{
        position:   "absolute",
        left:       `${pos.x}%`,
        top:        `${pos.y}%`,
        transform:  "translate(-50%, -50%)",
        ...transitionStyle,
        zIndex:     10 + Math.floor(pos.y),
        cursor:     "pointer",
        userSelect: "none",
      }}
      onClick={handleClick}
    >
      {/* ── "!" quiz ready badge ── */}
      {hasQuizReady && (
        <div style={{
          position:        "absolute",
          top:             -28,
          left:            "50%",
          transform:       "translateX(-50%)",
          background:      "#ffd700",
          border:          "2px solid #906000",
          borderRadius:    4,
          padding:         "2px 7px",
          fontFamily:      "'Press Start 2P', monospace",
          fontSize:        10,
          color:           "#3d2400",
          boxShadow:       "0 0 8px rgba(255,215,0,0.8)",
          zIndex:          999,
          pointerEvents:   "none",
          whiteSpace:      "nowrap",
          // Bob up and down to draw attention
          animation:       "quiz-badge-bob 0.8s ease-in-out infinite",
        }}>
          !
          {/* Arrow pointing down to the monster */}
          <div style={{
            position:    "absolute",
            bottom:      -7,
            left:        "50%",
            transform:   "translateX(-50%)",
            width:       0,
            height:      0,
            borderLeft:  "5px solid transparent",
            borderRight: "5px solid transparent",
            borderTop:   "7px solid #906000",
          }} />
        </div>
      )}

      {/* ── Quip speech bubble ── */}
      {quip && (
        <div style={{
          position:     "absolute",
          bottom:       "110%",
          left:         "50%",
          transform:    "translateX(-50%)",
          background:   "rgba(255,248,220,0.97)",
          border:       "2px solid #8B7355",
          borderRadius: 8,
          padding:      "6px 12px",
          whiteSpace:   "nowrap",
          fontFamily:   "'Press Start 2P', monospace",
          fontSize:     8,
          color:        "#3d2b1f",
          boxShadow:    "2px 2px 0 #8B7355",
          zIndex:       999,
          pointerEvents:"none",
          animation:    "quip-appear 0.2s ease-out both",
        }}>
          {quip}
          <div style={{
            position:    "absolute",
            bottom:      -8,
            left:        "50%",
            transform:   "translateX(-50%)",
            width:       0,
            height:      0,
            borderLeft:  "6px solid transparent",
            borderRight: "6px solid transparent",
            borderTop:   "8px solid #8B7355",
          }} />
        </div>
      )}

      {/* ── Sprite wrapper ── */}
      <div style={{
        ...idleStyle,
        transform:      `scaleX(${facing})`,
        display:        "flex",
        justifyContent: "center",
      }}>
        <img
          src={monster.sprite}
          alt={monster.name}
          width={monster.size}
          height={monster.size}
          style={{ imageRendering: "pixelated", display: "block" }}
          onError={(e) => {
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "block";
          }}
        />
        <span style={{ fontSize: monster.size * 0.65, display: "none", lineHeight: 1 }}>
          {monster.emoji}
        </span>
      </div>

      {/* ── Drop shadow ── */}
      <div style={{
        width:        monster.size * (moving ? 0.8 : 0.65),
        height:       5,
        background:   "rgba(0,0,0,0.2)",
        borderRadius: "50%",
        margin:       "0 auto",
        marginTop:    -3,
        filter:       "blur(2px)",
        transition:   "width 0.4s ease",
      }} />
    </div>
  );
}
