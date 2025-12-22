import { describe, expect, it } from "vitest";
import {
  addRestTimerSeconds,
  createRestTimer,
  pauseRestTimer,
  resetRestTimer,
  startRestTimer,
  tickRestTimer
} from "../utils/restTimer";

describe("rest timer", () => {
  it("starts, ticks, and completes", () => {
    const initial = createRestTimer(10);
    const started = startRestTimer(initial, 0);
    const ticked = tickRestTimer(started, 5000);
    expect(ticked.remainingSeconds).toBe(5);
    const completed = tickRestTimer(ticked, 15000);
    expect(completed.mode).toBe("completed");
    expect(completed.remainingSeconds).toBe(0);
  });

  it("pauses and adjusts", () => {
    const initial = startRestTimer(createRestTimer(20), 0);
    const paused = pauseRestTimer(initial, 5000);
    expect(paused.mode).toBe("paused");
    expect(paused.remainingSeconds).toBe(15);
    const adjusted = addRestTimerSeconds(paused, -5);
    expect(adjusted.remainingSeconds).toBe(10);
    const reset = resetRestTimer(adjusted, 30);
    expect(reset.remainingSeconds).toBe(30);
  });
});
