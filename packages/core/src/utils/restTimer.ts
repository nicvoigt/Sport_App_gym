export type RestTimerMode = "idle" | "running" | "paused" | "completed";

export type RestTimerState = {
  mode: RestTimerMode;
  remainingSeconds: number;
  totalSeconds: number;
  lastStartedAt?: number;
};

export const createRestTimer = (seconds: number): RestTimerState => ({
  mode: "idle",
  remainingSeconds: seconds,
  totalSeconds: seconds
});

export const startRestTimer = (state: RestTimerState, now = Date.now()): RestTimerState => {
  if (state.mode === "running") return state;
  return { ...state, mode: "running", lastStartedAt: now };
};

export const pauseRestTimer = (state: RestTimerState, now = Date.now()): RestTimerState => {
  if (state.mode !== "running" || state.lastStartedAt == null) return state;
  const elapsed = Math.floor((now - state.lastStartedAt) / 1000);
  const remaining = Math.max(0, state.remainingSeconds - elapsed);
  return { ...state, mode: "paused", remainingSeconds: remaining, lastStartedAt: undefined };
};

export const tickRestTimer = (state: RestTimerState, now = Date.now()): RestTimerState => {
  if (state.mode !== "running" || state.lastStartedAt == null) return state;
  const elapsed = Math.floor((now - state.lastStartedAt) / 1000);
  const remaining = Math.max(0, state.remainingSeconds - elapsed);
  if (remaining === 0) {
    return { ...state, mode: "completed", remainingSeconds: 0, lastStartedAt: undefined };
  }
  return { ...state, remainingSeconds: remaining };
};

export const resetRestTimer = (state: RestTimerState, seconds: number): RestTimerState => ({
  mode: "idle",
  remainingSeconds: seconds,
  totalSeconds: seconds
});

export const addRestTimerSeconds = (
  state: RestTimerState,
  deltaSeconds: number
): RestTimerState => ({
  ...state,
  remainingSeconds: Math.max(0, state.remainingSeconds + deltaSeconds),
  totalSeconds: Math.max(0, state.totalSeconds + deltaSeconds)
});
