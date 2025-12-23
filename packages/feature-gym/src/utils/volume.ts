import type { GymPayload } from "../contracts";

export const calculateVolume = (payload: GymPayload): number => {
  return payload.exercises.reduce((total, exercise) => {
    const exerciseVolume = exercise.sets.reduce((sum, set) => {
      return sum + set.reps * set.weightKg;
    }, 0);
    return total + exerciseVolume;
  }, 0);
};
