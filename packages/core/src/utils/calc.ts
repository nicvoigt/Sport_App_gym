import type { WorkoutSet } from "../db";

export const isWarmup = (set: WorkoutSet): boolean => set.tag === "warmup";

export const volumeForSet = (set: WorkoutSet): number => {
  if (isWarmup(set)) return 0;
  if (set.reps == null || set.weight == null) return 0;
  return set.reps * set.weight;
};

export const estimate1RM = (set: WorkoutSet): number => {
  if (isWarmup(set)) return 0;
  if (set.reps == null || set.weight == null) return 0;
  if (set.reps < 1 || set.reps > 12) return 0;
  return set.weight * (1 + set.reps / 30);
};

export type RecordResult = {
  bestActual: WorkoutSet | null;
  bestPredicted: WorkoutSet | null;
};

export const getRecordSets = (sets: WorkoutSet[]): RecordResult => {
  const filtered = sets.filter((set) => !isWarmup(set) && (set.reps ?? 0) <= 12);
  if (filtered.length === 0) {
    return { bestActual: null, bestPredicted: null };
  }
  const bestActual = filtered.reduce((best, current) => {
    if (!best) return current;
    const bestWeight = best.weight ?? 0;
    const currentWeight = current.weight ?? 0;
    return currentWeight > bestWeight ? current : best;
  }, filtered[0] as WorkoutSet | null);

  const bestPredicted = filtered.reduce((best, current) => {
    if (!best) return current;
    const bestValue = estimate1RM(best);
    const currentValue = estimate1RM(current);
    return currentValue > bestValue ? current : best;
  }, filtered[0] as WorkoutSet | null);

  return { bestActual, bestPredicted };
};
