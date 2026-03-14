/**
 * Monster.jsx — A single wandering creature on the habitat field
 *
 * Handles:
 *   - Leisurely walk AI: moves to a new spot every 6–14 seconds,
 *     with occasional pauses (30% chance to just stand still)
 *   - Smooth CSS transition for movement (speed tied to distance so
 *     farther moves don't look like teleporting)
 *   - Idle animation (float / bounce / spin) while standing still
 *   - Facing direction: flips sprite horizontally based on movement
 *   - Click → shows quip bubble for 3 seconds
 *   - Drop shadow for depth on the field
 *   - PNG sprite with emoji fallback if file is missing
 *
 * Props:
 *   monster         — full monster object from MONSTER_ROSTER
 *   initialPosition — { x, y } percentages, loaded from store
 *   onPositionChange(id, x, y) — called after each move so store can persist it
 */

import { useState, useEffect, useRef } from "react";

export default function Monster({
  monster,
  initialPosition,
  onPositionChange,
}) {
  // Current position as percentage of the field container
  const [pos, setPos] = useState(() => initialPosition ?? { x: 50, y: 50 });

  // True while the CSS transition is playing (suppresses idle animation)
  const [moving, setMoving] = useState(false);
  const [travelTime, setTravelTime] = useState(2000);

  // Which direction the sprite faces: 1 = right, -1 = left
  const [facing, setFacing] = useState(1);

  // The quip text shown in the speech bubble (null = hidden)
  const [quip, setQuip] = useState(null);

  const walkTimerRef = useRef(null);
  const quipTimerRef = useRef(null);

  // ── Walk AI ───────────────────────────────────────────────────────────────
  // Schedules the next move. Each move:
  //   1. Waits a leisurely 6–14 seconds (with 30% chance of a longer pause)
  //   2. Sometimes skips moving entirely (idle stop)
  //   3. Picks a target close to the current position (short wandering steps)
  //   4. Calculates travel duration based on distance so speed feels consistent
  // ─────────────────────────────────────────────────────────────────────────
  // Store pos in a ref so the walk closure always sees the latest value
  const posRef = useRef(pos);
  useEffect(() => {
    posRef.current = pos;
  }, [pos]);

  useEffect(() => {
    const scheduleNextWalk = () => {
      const isLongPause = Math.random() < 0.15; // less frequent long pauses
      const delay = isLongPause
        ? 6000 + Math.random() * 4000 // long pause: 6–10s (was 12–20s)
        : 3000 + Math.random() * 3000; // normal walk: 3–6s (was 6–14s)

      walkTimerRef.current = setTimeout(() => {
        // 20% chance to just stand still this beat
        if (Math.random() < 0.2) {
          scheduleNextWalk();
          return;
        }

        // Read current position from ref (always fresh)
        const current = posRef.current;
        const stepX = (Math.random() - 0.5) * 36;
        const stepY = (Math.random() - 0.5) * 28;
        const newX = Math.max(4, Math.min(94, current.x + stepX));
        const newY = Math.max(6, Math.min(88, current.y + stepY));

        setFacing(stepX >= 0 ? 1 : -1);

        const dist = Math.sqrt(stepX ** 2 + stepY ** 2);
        const travelMs = Math.max(3000, (dist / 10) * 1000 * 3.5);

        setTravelTime(travelMs);
        setMoving(true);
        setPos({ x: newX, y: newY });
        onPositionChange?.(monster.id, newX, newY);

        setTimeout(() => {
          setMoving(false);
          scheduleNextWalk(); // only schedule next walk after this one fully finishes
        }, travelMs + 50);
      }, delay);
    };

    scheduleNextWalk();
    return () => clearTimeout(walkTimerRef.current);
  }, [monster.id]);

  // ── Click: show quip bubble ───────────────────────────────────────────────
  const handleClick = () => {
    // Clear any existing quip timer so clicks don't stack
    clearTimeout(quipTimerRef.current);
    setQuip(monster.quip);
    quipTimerRef.current = setTimeout(() => setQuip(null), 3000);
  };

  // Cleanup quip timer on unmount
  useEffect(() => () => clearTimeout(quipTimerRef.current), []);

  // ── Travel duration style (recalculated when position changes) ────────────
  // We pass it inline because it varies per move
  const transitionStyle = moving
    ? {
        transition: `left ${travelTime}ms cubic-bezier(0.45,0,0.55,1), top ${travelTime}ms cubic-bezier(0.45,0,0.55,1)`,
      }
    : { transition: "none" };

  // ── Idle animation (only plays while standing still) ─────────────────────
  const idleStyle =
    !moving && monster.idleAnim !== "none"
      ? { animation: `monster-${monster.idleAnim} 2.4s ease-in-out infinite` }
      : {};

  return (
    <div
      style={{
        position: "absolute",
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        transform: "translate(-50%, -50%)",
        ...transitionStyle,
        // Monsters further down the screen (higher y) appear in front
        zIndex: 10 + Math.floor(pos.y),
        cursor: "pointer",
        userSelect: "none",
      }}
      onClick={handleClick}
    >
      {/* ── Quip speech bubble ─────────────────────────────────────────────── */}
      {quip && (
        <div
          style={{
            position: "absolute",
            bottom: "110%",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(255,248,220,0.97)",
            border: "2px solid #8B7355",
            borderRadius: 8,
            padding: "6px 12px",
            whiteSpace: "nowrap",
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 8,
            color: "#3d2b1f",
            boxShadow: "2px 2px 0 #8B7355",
            zIndex: 999,
            pointerEvents: "none",
            // Fade in
            animation: "quip-appear 0.2s ease-out both",
          }}
        >
          {quip}
          {/* Downward pointing triangle */}
          <div
            style={{
              position: "absolute",
              bottom: -8,
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderTop: "8px solid #8B7355",
            }}
          />
        </div>
      )}

      {/* ── Sprite wrapper (handles idle animation + horizontal flip) ─────── */}
      <div
        style={{
          ...idleStyle,
          transform: `scaleX(${facing})`, // flip to face direction of travel
          display: "flex",
          justifyContent: "center",
        }}
      >
        {/* PNG sprite */}
        <img
          src={monster.sprite}
          alt={monster.name}
          width={monster.size}
          height={monster.size}
          style={{ imageRendering: "pixelated", display: "block" }}
          onError={(e) => {
            // If PNG is missing, show emoji fallback instead
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "block";
          }}
        />
        {/* Emoji fallback (hidden until PNG fails) */}
        <span
          style={{
            fontSize: monster.size * 0.65,
            display: "none",
            lineHeight: 1,
          }}
        >
          {monster.emoji}
        </span>
      </div>

      {/* ── Drop shadow (slightly wider when moving = subtle "walking" feel) ── */}
      <div
        style={{
          width: monster.size * (moving ? 0.8 : 0.65),
          height: 5,
          background: "rgba(0,0,0,0.2)",
          borderRadius: "50%",
          margin: "0 auto",
          marginTop: -3,
          filter: "blur(2px)",
          transition: "width 0.4s ease",
        }}
      />
    </div>
  );
}
