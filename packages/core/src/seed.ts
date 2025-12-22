import type { AppDb, Exercise } from "./db";

const SEED_EXERCISES: Exercise[] = [
  {
    id: "ex-squat",
    name: "Back Squat",
    bodyPart: "Legs",
    equipment: "Barbell",
    exerciseType: "reps+weight"
  },
  {
    id: "ex-bench",
    name: "Bench Press",
    bodyPart: "Chest",
    equipment: "Barbell",
    exerciseType: "reps+weight"
  },
  {
    id: "ex-deadlift",
    name: "Deadlift",
    bodyPart: "Back",
    equipment: "Barbell",
    exerciseType: "reps+weight"
  },
  {
    id: "ex-row",
    name: "Dumbbell Row",
    bodyPart: "Back",
    equipment: "Dumbbell",
    exerciseType: "reps+weight"
  },
  {
    id: "ex-plank",
    name: "Plank",
    bodyPart: "Core",
    equipment: "Bodyweight",
    exerciseType: "duration"
  }
];

export async function seedIfEmpty(db: AppDb): Promise<void> {
  const count = await db.exercises.count();
  if (count > 0) return;
  await db.exercises.bulkAdd(SEED_EXERCISES);
}
