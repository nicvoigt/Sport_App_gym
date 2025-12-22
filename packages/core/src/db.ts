import Dexie, { type Table } from "dexie";

export type ExerciseType = "reps+weight" | "assisted" | "duration" | "distance+duration";

export type Exercise = {
  id: string;
  name: string;
  bodyPart: string;
  equipment: string;
  exerciseType: ExerciseType;
  notes?: string;
};

export type Workout = {
  id: string;
  startedAt: string;
  finishedAt?: string;
  title?: string;
  notes?: string;
};

export type WorkoutEntry = {
  id: string;
  workoutId: string;
  exerciseId: string;
  orderIndex: number;
  supersetGroupId?: string;
  supersetOrderIndex?: number;
};

export type WorkoutSet = {
  id: string;
  entryId: string;
  setIndex: number;
  reps?: number;
  weight?: number;
  durationSeconds?: number;
  distance?: number;
  isCompleted: boolean;
  tag: "normal" | "warmup" | "dropset" | "failure";
};

export type Template = {
  id: string;
  name: string;
};

export type TemplateEntry = {
  id: string;
  templateId: string;
  exerciseId: string;
  orderIndex: number;
  supersetGroupId?: string;
  supersetOrderIndex?: number;
  plannedSets: number;
};

export type Measurement = {
  id: string;
  measuredAt: string;
  type: "bodyweight";
  valueKg: number;
  notes?: string;
};

export type Settings = {
  id: "settings";
  units: "kg" | "lb";
  defaultRestTimerWorkingSeconds: number;
  defaultRestTimerWarmupSeconds: number;
  goalBodyweightKg?: number;
  barWeightKg?: number;
};

export class AppDb extends Dexie {
  exercises!: Table<Exercise>;
  workouts!: Table<Workout>;
  workoutEntries!: Table<WorkoutEntry>;
  sets!: Table<WorkoutSet>;
  templates!: Table<Template>;
  templateEntries!: Table<TemplateEntry>;
  measurements!: Table<Measurement>;
  settings!: Table<Settings>;

  constructor() {
    super("sport_scale_db");
    this.version(1).stores({
      exercises: "id, name, bodyPart, equipment, exerciseType",
      workouts: "id, startedAt, finishedAt",
      workoutEntries: "id, workoutId, exerciseId, orderIndex",
      sets: "id, entryId, setIndex, isCompleted",
      templates: "id, name",
      templateEntries: "id, templateId, exerciseId, orderIndex",
      measurements: "id, measuredAt, type",
      settings: "id"
    });
  }
}

export const DEFAULT_SETTINGS: Settings = {
  id: "settings",
  units: "kg",
  defaultRestTimerWorkingSeconds: 120,
  defaultRestTimerWarmupSeconds: 60,
  goalBodyweightKg: undefined,
  barWeightKg: undefined
};
