/**
 * Gallery.jsx — Collapsible monster collection panel (right side of screen)
 *
 * Shows all monsters grouped by rarity.
 * Owned monsters: full colour image + name + rarity badge
 * Unowned monsters: black silhouette + "???" name
 *
 * A tab button sits on the right edge of the screen at all times.
 * Clicking it slides the panel in from the right.
 *
 * Props:
 *   ownedMonsterIds — array of monster ids the player owns
 */

import { useState } from "react";
import { MONSTER_ROSTER, RARITY_CONFIG } from "../data/monsters";

// Order rarities from most to least common for display
const RARITY_ORDER = ["legendary", "epic", "rare", "common"];

export default function Gallery({ ownedMonsterIds }) {
  const [open, setOpen] = useState(false);

  // Group monsters by rarity
  const grouped = RARITY_ORDER.reduce((acc, rarity) => {
    acc[rarity] = MONSTER_ROSTER.filter((m) => m.rarity === rarity);
    return acc;
  }, {});

  const totalOwned = ownedMonsterIds.length;
  const totalMonsters = MONSTER_ROSTER.length;

  return (
    <>
      {/* ── Tab button — always visible on the right edge ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          position: "fixed",
          right: open ? 320 : 0,
          top: "35%",
          zIndex: 600,
          background: "linear-gradient(180deg, #c8a96e, #a07840)",
          border: "3px solid #7a5c2e",
          borderRight: open ? "3px solid #7a5c2e" : "none",
          borderRadius: open ? "6px 0 0 6px" : "6px 0 0 6px",
          padding: "14px 8px",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          boxShadow: "-3px 0 10px rgba(0,0,0,0.4)",
          transition: "right 0.3s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* Vertical text */}
        {"GALLERY".split("").map((char, i) => (
          <span
            key={i}
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 7,
              color: "#ffe8a0",
              textShadow: "1px 1px 0 #3a2010",
              lineHeight: 1,
            }}
          >
            {char}
          </span>
        ))}

        {/* Owned count badge */}
        <div
          style={{
            marginTop: 4,
            background: "#5a3e1a",
            border: "1px solid #3a2010",
            borderRadius: 3,
            padding: "2px 4px",
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 6,
            color: "#ffd700",
            whiteSpace: "nowrap",
          }}
        >
          {totalOwned}/{totalMonsters}
        </div>

        {/* Arrow indicator */}
        <span
          style={{
            fontSize: 10,
            color: "#ffe8a0",
            marginTop: 2,
            transform: open ? "rotate(0deg)" : "rotate(180deg)",
            transition: "transform 0.3s ease",
            display: "block",
          }}
        >
          ›
        </span>
      </button>

      {/* ── Slide-in panel ── */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: 320,
          // Stop above the dialogue box
          height: "calc(100vh - 220px)",
          zIndex: 599,
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
          background: "linear-gradient(180deg, #1a0f05 0%, #0d0802 100%)",
          borderLeft: "3px solid #7a5c2e",
          display: "flex",
          flexDirection: "column",
          boxShadow: "-8px 0 24px rgba(0,0,0,0.6)",
        }}
      >
        {/* Panel header */}
        <div
          style={{
            padding: "14px 16px",
            borderBottom: "2px solid #3a2010",
            background: "linear-gradient(90deg, #2a1a08, #1a0f05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 10,
                color: "#ffe8a0",
                textShadow: "1px 1px 0 #3a2010",
                marginBottom: 4,
              }}
            >
              📖 Monster Gallery
            </div>
            <div
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 7,
                color: "#9a7040",
              }}
            >
              {totalOwned} / {totalMonsters} discovered
            </div>
          </div>

          {/* Progress bar */}
          <div
            style={{
              width: 80,
              height: 8,
              background: "#2a1a08",
              borderRadius: 4,
              border: "1px solid #3a2010",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${(totalOwned / totalMonsters) * 100}%`,
                height: "100%",
                background: "linear-gradient(90deg, #ffd700, #ffaa00)",
                borderRadius: 4,
                transition: "width 0.5s ease",
              }}
            />
          </div>
        </div>

        {/* Scrollable monster list */}
        <div
          className="gallery-scroll"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "12px 10px",
            scrollbarWidth: "thin",
            scrollbarColor: "#8B6914 #e8c060",
          }}
        >
          {RARITY_ORDER.map((rarity) => {
            const monsters = grouped[rarity];
            if (!monsters.length) return null;
            const conf = RARITY_CONFIG[rarity];

            return (
              <div key={rarity} style={{ marginBottom: 20 }}>
                {/* Rarity section header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 10,
                    paddingBottom: 6,
                    borderBottom: `1px solid ${conf.color}44`,
                  }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: conf.color,
                      boxShadow: `0 0 6px ${conf.color}`,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "'Press Start 2P', monospace",
                      fontSize: 8,
                      color: conf.color,
                      textShadow: `0 0 8px ${conf.color}66`,
                      letterSpacing: 1,
                    }}
                  >
                    {conf.label}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Press Start 2P', monospace",
                      fontSize: 6,
                      color: "#555",
                      marginLeft: "auto",
                    }}
                  >
                    {
                      monsters.filter((m) => ownedMonsterIds.includes(m.id))
                        .length
                    }
                    /{monsters.length}
                  </span>
                </div>

                {/* Monster cards grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 8,
                  }}
                >
                  {monsters.map((monster) => {
                    const owned = ownedMonsterIds.includes(monster.id);
                    return (
                      <MonsterCard
                        key={monster.id}
                        monster={monster}
                        owned={owned}
                        rarityColor={conf.color}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MonsterCard — individual card in the gallery grid
// Owned: full colour sprite + name
// Unowned: silhouette + "???"
// ─────────────────────────────────────────────────────────────────────────────
function MonsterCard({ monster, owned, rarityColor }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: owned ? (hovered ? "#2a1a08" : "#1a0f05") : "#0d0802",
        border: owned
          ? `2px solid ${hovered ? rarityColor : rarityColor + "66"}`
          : "2px solid #1a1208",
        borderRadius: 6,
        padding: "8px 4px 6px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 5,
        cursor: owned ? "pointer" : "default",
        transition: "background 0.15s, border-color 0.15s, box-shadow 0.15s",
        boxShadow: owned && hovered ? `0 0 10px ${rarityColor}44` : "none",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Sprite — silhouette if unowned */}
      <div style={{ position: "relative", width: 52, height: 52 }}>
        <img
          src={monster.sprite}
          alt={owned ? monster.name : "???"}
          width={52}
          height={52}
          style={{
            imageRendering: "pixelated",
            objectFit: "contain",
            display: "block",
            // CSS filter makes it a solid black silhouette when unowned
            filter: owned
              ? hovered
                ? `drop-shadow(0 0 6px ${rarityColor})`
                : "none"
              : "brightness(0)",
            transition: "filter 0.2s ease",
          }}
        />

        {/* New badge for owned monsters (just a dot glow) */}
        {owned && (
          <div
            style={{
              position: "absolute",
              top: -2,
              right: -2,
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: rarityColor,
              boxShadow: `0 0 4px ${rarityColor}`,
            }}
          />
        )}
      </div>

      {/* Name */}
      <div
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 6,
          color: owned ? "#ffe8a0" : "#333",
          textAlign: "center",
          lineHeight: 1.5,
          wordBreak: "break-word",
          maxWidth: "100%",
        }}
      >
        {owned ? monster.name : "???"}
      </div>
    </div>
  );
}
