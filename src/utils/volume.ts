import type { GymPayload } from "../contracts";

export const calculateWorkoutVolume = (payload: GymPayload): number => {
  return payload.exercises.reduce((exerciseTotal, exercise) => {
    const setTotal = exercise.sets.reduce((setSum, set) => {
      return setSum + set.reps * set.weightKg;
    }, 0);
    return exerciseTotal + setTotal;
  }, 0);
};
