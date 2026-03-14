/**
 * GachaPopup.jsx — Spinning silhouette gacha reveal
 *
 * Animation sequence:
 *   Phase 1 (0–0.6s)   : Overlay fades in, title drops down
 *   Phase 2 (0.6–3.5s) : Reel spins fast through silhouettes of all monsters
 *   Phase 3 (3.5–4.8s) : Reel decelerates and locks onto the winning monster
 *   Phase 4 (4.8–5.4s) : Flash of light, silhouette dissolves into full colour
 *   Phase 5 (5.4s+)    : Name, species, rarity badge slam in — Claim button appears
 *
 * Props:
 *   monster   — the monster object the player won (from MONSTER_ROSTER)
 *   onClaim() — called when player dismisses the popup
 *
 * Usage in App.jsx:
 *   {pendingMonster && (
 *     <GachaPopup monster={pendingMonster} onClaim={handleClaim} />
 *   )}
 */

import { useState, useEffect, useRef } from "react";
import { MONSTER_ROSTER, RARITY_CONFIG } from "../data/monsters";

// How many "fake" slots spin past before landing on the winner
const SPIN_COUNT = 18;

// Duration of the full spin phase in ms
const SPIN_DURATION = 3800;

// Duration of the reveal flash in ms
const FLASH_DURATION = 600;

export default function GachaPopup({ monster, onClaim }) {
  // Which phase we're in
  // "spinning" | "landing" | "flash" | "revealed"
  const [phase, setPhase] = useState("spinning");

  // The index into the reel the indicator is currently on
  const [reelIndex, setReelIndex] = useState(0);

  // Whether the colour sprite is visible (post-flash)
  const [showColour, setShowColour] = useState(false);

  // Whether the name card is visible
  const [showCard, setShowCard] = useState(false);

  const spinIntervalRef = useRef(null);
  const phaseTimerRef = useRef(null);

  const rarityConf = RARITY_CONFIG[monster.rarity] ?? RARITY_CONFIG.common;

  // Build the reel: random monsters + winner at the end
  // We shuffle all monsters and repeat them to fill SPIN_COUNT slots,
  // then append the winner as the final slot
  const reelSlots = useRef(() => {
    const pool = [];
    while (pool.length < SPIN_COUNT) {
      const shuffled = [...MONSTER_ROSTER].sort(() => Math.random() - 0.5);
      pool.push(...shuffled);
    }
    pool.push(monster); // winner is always last
    return pool.slice(0, SPIN_COUNT + 1);
  }).current();

  // ── Spin logic ─────────────────────────────────────────────────────────────
  useEffect(() => {
    // Phase 1: start spinning fast
    let currentIndex = 0;
    let delay = 60; // ms between each slot flip (starts fast)

    const spin = () => {
      currentIndex++;
      setReelIndex(currentIndex);

      const remaining = SPIN_COUNT - currentIndex;

      // Start slowing down in the last 8 slots
      if (remaining <= 8) {
        delay = 60 + (8 - remaining) ** 1.8 * 28;
      }

      if (currentIndex < SPIN_COUNT) {
        spinIntervalRef.current = setTimeout(spin, delay);
      } else {
        // Landed on winner — enter landing phase
        setPhase("landing");

        // Short pause on the silhouette before flash
        phaseTimerRef.current = setTimeout(() => {
          setPhase("flash");

          // Flash → reveal colour
          setTimeout(() => {
            setShowColour(true);
            setPhase("revealed");

            // Stagger the name card in after colour appears
            setTimeout(() => setShowCard(true), 300);
          }, FLASH_DURATION);
        }, 800);
      }
    };

    // Small delay before spinning starts so overlay can fade in first
    spinIntervalRef.current = setTimeout(spin, 600);

    return () => {
      clearTimeout(spinIntervalRef.current);
      clearTimeout(phaseTimerRef.current);
    };
  }, []);

  const currentSlot = reelSlots[Math.min(reelIndex, reelSlots.length - 1)];

  return (
    <>
      {/* ── Inject gacha-specific keyframes ── */}
      <style>{`
        @keyframes gacha-overlay-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes gacha-title-in {
          from { transform: translateY(-40px) scale(0.8); opacity: 0; }
          to   { transform: translateY(0)     scale(1);   opacity: 1; }
        }
        @keyframes gacha-slot-flip {
          0%   { transform: scaleY(0.2); opacity: 0.3; }
          50%  { transform: scaleY(1.1); opacity: 0.9; }
          100% { transform: scaleY(1);   opacity: 1;   }
        }
        @keyframes gacha-flash {
          0%   { opacity: 0; }
          30%  { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes gacha-reveal-sprite {
          from { transform: scale(0.6); opacity: 0; filter: brightness(3); }
          to   { transform: scale(1);   opacity: 1; filter: brightness(1); }
        }
        @keyframes gacha-card-in {
          from { transform: translateY(24px) scale(0.9); opacity: 0; }
          to   { transform: translateY(0)    scale(1);   opacity: 1; }
        }
        @keyframes gacha-rarity-slam {
          0%   { transform: scale(2.5) rotate(-6deg); opacity: 0; }
          60%  { transform: scale(0.9) rotate(1deg);  opacity: 1; }
          100% { transform: scale(1)   rotate(0deg);  opacity: 1; }
        }
        @keyframes gacha-particles {
          0%   { transform: translateY(0)    scale(1);   opacity: 1; }
          100% { transform: translateY(-80px) scale(0.3); opacity: 0; }
        }
        @keyframes gacha-shine {
          0%, 100% { transform: translateX(-100%) rotate(30deg); }
          50%       { transform: translateX(300%)  rotate(30deg); }
        }
        @keyframes landing-pulse {
          0%, 100% { box-shadow: 0 0 20px ${rarityConf.color}, 0 0 40px ${rarityConf.color}44; }
          50%       { box-shadow: 0 0 40px ${rarityConf.color}, 0 0 80px ${rarityConf.color}88; }
        }
        @keyframes claim-btn-in {
          from { transform: translateY(16px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>

      {/* ── Full-screen overlay ── */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          animation: "gacha-overlay-in 0.5s ease-out both",
          // Dark background with rarity-tinted radial glow
          background: `radial-gradient(ellipse 70% 60% at 50% 45%, ${rarityConf.color}22 0%, #0a0a0f 65%)`,
          backdropFilter: "blur(2px)",
        }}
      >
        {/* ── "QUEST COMPLETE!" title ── */}
        <div
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 16,
            color: "#ffe066",
            textShadow: `0 0 20px #ffe066, 0 0 40px ${rarityConf.color}`,
            marginBottom: 32,
            letterSpacing: 2,
            animation:
              "gacha-title-in 0.5s 0.3s cubic-bezier(0.34,1.56,0.64,1) both",
          }}
        >
          ✦ QUEST COMPLETE ✦
        </div>

        {/* ── Spin reel ── */}
        <div
          style={{
            position: "relative",
            width: 220,
            height: 220,
            marginBottom: 28,
          }}
        >
          {/* Reel frame */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              border: "3px solid #444", // always grey, never rarity colour
              borderRadius: 16,
              background: "rgba(0,0,0,0.7)",
              overflow: "hidden",
              // only pulse after landing
              animation:
                phase === "revealed"
                  ? "landing-pulse 1.2s ease-in-out infinite"
                  : "none",
            }}
          >
            {/* Shine sweep effect on the frame */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%)",
                animation: "gacha-shine 2.5s ease-in-out infinite",
                pointerEvents: "none",
              }}
            />
          </div>

          

          {/* Spinning silhouette slot */}
          {phase !== "revealed" && (
            <div
              key={reelIndex}
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation:
                  phase === "spinning"
                    ? "gacha-slot-flip 0.12s ease-out both"
                    : "none",
              }}
            >
              <img
                src={currentSlot.sprite}
                alt=""
                style={{
                  width: 140,
                  height: 140,
                  imageRendering: "pixelated",
                  objectFit: "contain",
                  // CSS filter to turn the sprite into a silhouette
                  filter:
                    phase === "landing"
                      ? `brightness(0) invert(0.15) drop-shadow(0 0 12px ${rarityConf.color})`
                      : "brightness(0) invert(0.1)",
                  transition: "filter 0.3s ease",
                }}
              />
            </div>
          )}

          {/* Flash burst on reveal */}
          {phase === "flash" && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `radial-gradient(circle, white 0%, ${rarityConf.color}88 50%, transparent 80%)`,
                animation: "gacha-flash 0.6s ease-out both",
                borderRadius: 14,
              }}
            />
          )}

          {/* Revealed colour sprite */}
          {showColour && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation:
                  "gacha-reveal-sprite 0.5s cubic-bezier(0.34,1.56,0.64,1) both",
              }}
            >
              <img
                src={monster.sprite}
                alt={monster.name}
                style={{
                  width: 150,
                  height: 150,
                  imageRendering: "pixelated",
                  objectFit: "contain",
                  filter: `drop-shadow(0 0 16px ${rarityConf.color})`,
                }}
              />

              {/* Particle burst around sprite */}
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: rarityConf.color,
                    top: "50%",
                    left: "50%",
                    transform: `rotate(${i * 45}deg) translateX(60px)`,
                    animation: `gacha-particles 0.8s ${i * 0.06}s ease-out both`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Name card (slides in after reveal) ── */}
        {showCard && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              animation:
                "gacha-card-in 0.5s cubic-bezier(0.34,1.56,0.64,1) both",
            }}
          >
            {/* Rarity badge */}
            <div
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 10,
                color: rarityConf.color,
                background: `${rarityConf.color}22`,
                border: `2px solid ${rarityConf.color}`,
                borderRadius: 4,
                padding: "5px 14px",
                textShadow: `0 0 10px ${rarityConf.color}`,
                animation:
                  "gacha-rarity-slam 0.5s 0.1s cubic-bezier(0.34,1.56,0.64,1) both",
                letterSpacing: 2,
              }}
            >
              ★ {rarityConf.label.toUpperCase()} ★
            </div>

            {/* Monster name */}
            <div
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 20,
                color: "#fff",
                textShadow: `0 0 20px ${rarityConf.color}, 2px 2px 0 #000`,
                letterSpacing: 1,
              }}
            >
              {monster.name}
            </div>

            {/* Species */}
            <div
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 9,
                color: "#aaa",
                letterSpacing: 1,
              }}
            >
              {monster.species}
            </div>

            {/* Claim button */}
            <button
              onClick={onClaim}
              style={{
                marginTop: 12,
                background: `linear-gradient(180deg, ${rarityConf.color} 0%, ${rarityConf.color}bb 100%)`,
                border: "none",
                borderRadius: 6,
                padding: "12px 36px",
                color: "#0a0a0f",
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 11,
                cursor: "pointer",
                boxShadow: `0 4px 0 rgba(0,0,0,0.4), 0 0 20px ${rarityConf.color}66`,
                letterSpacing: 1,
                animation: "claim-btn-in 0.4s 0.3s ease-out both",
                transition: "transform 0.1s, box-shadow 0.1s",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = `0 6px 0 rgba(0,0,0,0.4), 0 0 30px ${rarityConf.color}88`;
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = `0 4px 0 rgba(0,0,0,0.4), 0 0 20px ${rarityConf.color}66`;
              }}
            >
              Add to Habitat ✦
            </button>
          </div>
        )}
      </div>
    </>
  );
}
