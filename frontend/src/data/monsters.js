/**
 * monsters.js — Master monster roster + rarity configuration
 *
 * This is the single source of truth for every monster in the game.
 * Import MONSTER_ROSTER anywhere you need to look up a monster by id,
 * display its name, sprite, or quip.
 *
 * To add a new monster:
 *   1. Add an entry to MONSTER_ROSTER below
 *   2. Drop its PNG into /public/monsters/<name>.png
 *   That's it — the gacha system picks from this list automatically.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Monster fields:
//   id         — unique key used everywhere as the reference
//   name       — display name shown in UI
//   species    — flavour subtitle shown in gallery card
//   rarity     — "common" | "rare" | "legendary"
//   emoji      — fallback if PNG sprite file is missing
//   sprite     — path relative to /public (e.g. "/monsters/buzzy.png")
//   quip       — one-liner shown when player clicks the monster in the habitat
//   idleAnim   — which CSS animation plays while standing still:
//                  "float"  → gentle bob up and down
//                  "bounce" → squash-and-stretch jump
//                  "spin"   → subtle left-right rock
//   size       — rendered width/height in pixels (before any scaling)
// ─────────────────────────────────────────────────────────────────────────────
export const MONSTER_ROSTER = [
  {
    id: "m001",
    name: "Trent",
    species: "Tiny Treant",
    rarity: "rare",
    emoji: "🌳",
    sprite: "/monsters/GrizzledTreant.gif",
    quip: "Stop laughing! I just haven't hit my growth spurt!",
    idleAnim: "none",
    size: 64,
  },
  {
    id: "m002",
    name: "The Hand",
    species: "Zombie (a part of one...)",
    rarity: "epic",
    emoji: "🖐️",
    sprite: "/monsters/SkitteringHand.gif",
    quip: "I'm the guy everyone calls when they need a hand.",
    idleAnim: "none",
    size: 64,
  },
  {
    id: "m003",
    name: "Barry",
    species: "Bat",
    rarity: "common",
    emoji: "🦇",
    sprite: "/monsters/VampireBat.gif",
    quip: "I think my sleep schedule is better than CS students'.",
    idleAnim: "none",
    size: 64,
  },
  {
    id: "m004",
    name: "Franklin",
    species: "Turtle",
    rarity: "common",
    emoji: "🐢",
    sprite: "/monsters/SlowTurtle.gif",
    quip: "Take it slow, bro...",
    idleAnim: "none",
    size: 64,
  },
  {
    id: "m005",
    name: "Diggy",
    species: "Mole",
    rarity: "common",
    emoji: "🦔",
    sprite: "/monsters/TunnelingMole.gif",
    quip: "I ain't saying she a gold digger.",
    idleAnim: "none",
    size: 64,
  },
  {
    id: "m006",
    name: "Little Timmy",
    species: "Human",
    rarity: "legendary",
    emoji: "👦",
    sprite: "/monsters/PlayfulChild.gif",
    quip: "Why am I here?",
    idleAnim: "none",
    size: 64,
  },
  {
    id: "m007",
    name: "King of Pop",
    species: "Zombie",
    rarity: "rare",
    emoji: "🧟",
    sprite: "/monsters/MutilatedStumbler.gif",
    quip: "Cause this is thriller! Thriller night!",
    idleAnim: "none",
    size: 64,
  },
  {
    id: "m008",
    name: "Bing and Bong",
    species: "Ogre",
    rarity: "epic",
    emoji: "👾",
    sprite: "/monsters/HumongousEttin.gif",
    quip: "BING! BONG!",
    idleAnim: "none",
    size: 64,
  },
  {
    id: "m009",
    name: "Slimey",
    species: "Death Slime",
    rarity: "rare",
    emoji: "🟢",
    sprite: "/monsters/DeathSlime.gif",
    quip: "Don't let the name fool you. I'm mostly harmless.",
    idleAnim: "none",
    size: 64,
  },
];
// ─────────────────────────────────────────────────────────────────────────────
// Rarity config — used by the gacha system for weights and by the UI for colours
//
//   color   — hex colour used for glow effects, badges, gallery borders
//   label   — human-readable string shown in the UI
//   weight  — relative probability out of 100 (must sum to 100)
// ─────────────────────────────────────────────────────────────────────────────
export const RARITY_CONFIG = {
  common:    { color: "#4caf50", label: "Common",    weight: 60 },
  rare:      { color: "#2196f3", label: "Rare",      weight: 30 },
  epic:      { color: "#9c27b0", label: "Epic",      weight: 10 },
  legendary: { color: "#ffd700", label: "Legendary", weight: 5  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: look up a single monster by id
// Returns undefined if the id doesn't exist in the roster
// ─────────────────────────────────────────────────────────────────────────────
export const getMonsterById = (id) => MONSTER_ROSTER.find((m) => m.id === id);

// ─────────────────────────────────────────────────────────────────────────────
// Helper: pick a random monster id weighted by rarity
// Used by the gacha system when the backend isn't available
// ─────────────────────────────────────────────────────────────────────────────
export const pickRandomMonsterId = () => {
  // Build a weighted pool: each rarity weight determines how many copies go in
  const pool = MONSTER_ROSTER.flatMap((m) => {
    const w = RARITY_CONFIG[m.rarity]?.weight ?? 10;
    return Array(w).fill(m.id);
  });
  return pool[Math.floor(Math.random() * pool.length)];
};
