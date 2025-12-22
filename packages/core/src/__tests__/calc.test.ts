import { describe, expect, it } from "vitest";
import { estimate1RM, getRecordSets, volumeForSet } from "../utils/calc";
import type { WorkoutSet } from "../db";

const baseSet: WorkoutSet = {
  id: "1",
  entryId: "e1",
  setIndex: 0,
  reps: 5,
  weight: 100,
  isCompleted: true,
  tag: "normal"
};

describe("calc utilities", () => {
  it("calculates volume excluding warmups", () => {
    expect(volumeForSet({ ...baseSet, tag: "warmup" })).toBe(0);
    expect(volumeForSet(baseSet)).toBe(500);
  });

  it("estimates 1RM for reps 1..12", () => {
    expect(estimate1RM(baseSet)).toBeCloseTo(116.6667, 3);
    expect(estimate1RM({ ...baseSet, reps: 15 })).toBe(0);
  });

  it("picks actual and predicted records", () => {
    const sets: WorkoutSet[] = [
      { ...baseSet, id: "a", reps: 5, weight: 100 },
      { ...baseSet, id: "b", reps: 8, weight: 95 },
      { ...baseSet, id: "c", reps: 3, weight: 110, tag: "warmup" }
    ];
    const result = getRecordSets(sets);
    expect(result.bestActual?.id).toBe("a");
    expect(result.bestPredicted?.id).toBe("b");
  });
});
