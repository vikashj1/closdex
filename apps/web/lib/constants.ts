/** Lookup tables for difficulty tiers + ranks. Mirrors the SOW exactly; the
 *  backend Prisma seed in packages/db/prisma/seed.ts is the canonical source. */

export type DifficultyLevel = 'Rookie' | 'Easy' | 'Medium' | 'Hard' | 'Expert';

export const DIFFICULTY: Record<DifficultyLevel, { color: string; base: number }> = {
  Rookie: { color: 'var(--d-rookie)', base: 50 },
  Easy:   { color: 'var(--d-easy)',   base: 100 },
  Medium: { color: 'var(--d-medium)', base: 200 },
  Hard:   { color: 'var(--d-hard)',   base: 400 },
  Expert: { color: 'var(--d-expert)', base: 800 },
};

export type RankName =
  | 'Rookie' | 'Bronze' | 'Silver' | 'Gold'
  | 'Platinum' | 'Diamond' | 'Master' | 'Grandmaster';

export const RANKS: Record<RankName, { color: string; min: number }> = {
  Rookie:      { color: 'var(--r-rookie)',   min: 0 },
  Bronze:      { color: 'var(--r-bronze)',   min: 500 },
  Silver:      { color: 'var(--r-silver)',   min: 1500 },
  Gold:        { color: 'var(--r-gold)',     min: 4000 },
  Platinum:    { color: 'var(--r-platinum)', min: 9000 },
  Diamond:     { color: 'var(--r-diamond)',  min: 18000 },
  Master:      { color: 'var(--r-master)',   min: 35000 },
  Grandmaster: { color: 'var(--r-gm)',       min: 70000 },
};
