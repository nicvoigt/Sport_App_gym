import { z } from "zod";

export const GymSetSchema = z.object({
  reps: z.number().int().min(0),
  weightKg: z.number().min(0),
  rpe: z.number().min(0).max(10).optional(),
  isDropSet: z.boolean().optional(),
  notes: z.string().optional()
});

export const GymExerciseSchema = z.object({
  name: z.string().min(1),
  sets: z.array(GymSetSchema)
});

export const GymPayloadSchema = z.object({
  exercises: z.array(GymExerciseSchema),
  durationMin: z.number().int().min(0).optional(),
  perceivedEffort: z.number().int().min(1).max(10).optional()
});

export type GymPayload = z.infer<typeof GymPayloadSchema>;

export const GYM_PAYLOAD_VERSION = 1;
