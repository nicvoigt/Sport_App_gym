import React, { useMemo, useState } from "react";
import { GymPayloadSchema } from "../contracts";

type SetDraft = {
  reps: string;
  weightKg: string;
  rpe: string;
  isDropSet: boolean;
  notes: string;
};

type ExerciseDraft = {
  name: string;
  sets: SetDraft[];
};

type FormProps = {
  onSubmit: (payload: { exercises: Array<{ name: string; sets: Array<{ reps: number; weightKg: number; rpe?: number; isDropSet?: boolean; notes?: string }> }>; durationMin?: number; perceivedEffort?: number }) => void;
  onCancel?: () => void;
};

const createSetDraft = (): SetDraft => ({
  reps: "",
  weightKg: "",
  rpe: "",
  isDropSet: false,
  notes: ""
});

const createExerciseDraft = (): ExerciseDraft => ({
  name: "",
  sets: [createSetDraft()]
});

export const GymEntryForm: React.FC<FormProps> = ({ onSubmit, onCancel }) => {
  const [exercises, setExercises] = useState<ExerciseDraft[]>([createExerciseDraft()]);
  const [durationMin, setDurationMin] = useState("");
  const [perceivedEffort, setPerceivedEffort] = useState("");
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => exercises.some((exercise) => exercise.name.trim().length > 0), [exercises]);

  const updateExercise = (index: number, updates: Partial<ExerciseDraft>) => {
    setExercises((current) =>
      current.map((exercise, position) => (position === index ? { ...exercise, ...updates } : exercise))
    );
  };

  const updateSet = (exerciseIndex: number, setIndex: number, updates: Partial<SetDraft>) => {
    setExercises((current) =>
      current.map((exercise, position) => {
        if (position !== exerciseIndex) return exercise;
        return {
          ...exercise,
          sets: exercise.sets.map((set, idx) => (idx === setIndex ? { ...set, ...updates } : set))
        };
      })
    );
  };

  const addExercise = () => setExercises((current) => [...current, createExerciseDraft()]);

  const addSet = (exerciseIndex: number) => {
    setExercises((current) =>
      current.map((exercise, position) => {
        if (position !== exerciseIndex) return exercise;
        return { ...exercise, sets: [...exercise.sets, createSetDraft()] };
      })
    );
  };

  const handleSubmit = () => {
    const payload = {
      exercises: exercises
        .map((exercise) => ({
          name: exercise.name.trim(),
          sets: exercise.sets
            .filter((set) => set.reps !== "" || set.weightKg !== "" || set.notes.trim() !== "")
            .map((set) => ({
              reps: Number(set.reps || 0),
              weightKg: Number(set.weightKg || 0),
              rpe: set.rpe === "" ? undefined : Number(set.rpe),
              isDropSet: set.isDropSet || undefined,
              notes: set.notes.trim() ? set.notes.trim() : undefined
            }))
        }))
        .filter((exercise) => exercise.name.length > 0),
      durationMin: durationMin === "" ? undefined : Number(durationMin),
      perceivedEffort: perceivedEffort === "" ? undefined : Number(perceivedEffort)
    };

    const result = GymPayloadSchema.safeParse(payload);
    if (!result.success) {
      setError("Bitte prüfe die Eingaben, mindestens eine Übung und gültige Sätze sind erforderlich.");
      return;
    }

    setError(null);
    onSubmit(result.data);
  };

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      {exercises.map((exercise, exerciseIndex) => (
        <div key={`exercise-${exerciseIndex}`} style={{ border: "1px solid #e2e8f0", padding: "1rem" }}>
          <label style={{ display: "block", fontWeight: 600 }}>Übung</label>
          <input
            type="text"
            value={exercise.name}
            onChange={(event) => updateExercise(exerciseIndex, { name: event.target.value })}
            placeholder="z.B. Bankdrücken"
            style={{ width: "100%", marginBottom: "0.5rem" }}
          />
          {exercise.sets.map((set, setIndex) => (
            <div key={`set-${setIndex}`} style={{ display: "grid", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <div style={{ display: "grid", gap: "0.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))" }}>
                <input
                  type="number"
                  min={0}
                  value={set.reps}
                  onChange={(event) => updateSet(exerciseIndex, setIndex, { reps: event.target.value })}
                  placeholder="Reps"
                />
                <input
                  type="number"
                  min={0}
                  step="0.5"
                  value={set.weightKg}
                  onChange={(event) => updateSet(exerciseIndex, setIndex, { weightKg: event.target.value })}
                  placeholder="Gewicht (kg)"
                />
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={set.rpe}
                  onChange={(event) => updateSet(exerciseIndex, setIndex, { rpe: event.target.value })}
                  placeholder="RPE (0-10)"
                />
              </div>
              <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={set.isDropSet}
                  onChange={(event) => updateSet(exerciseIndex, setIndex, { isDropSet: event.target.checked })}
                />
                Drop-Set
              </label>
              <input
                type="text"
                value={set.notes}
                onChange={(event) => updateSet(exerciseIndex, setIndex, { notes: event.target.value })}
                placeholder="Notizen"
              />
            </div>
          ))}
          <button type="button" onClick={() => addSet(exerciseIndex)}>
            Satz hinzufügen
          </button>
        </div>
      ))}
      <button type="button" onClick={addExercise}>
        Übung hinzufügen
      </button>
      <div style={{ display: "grid", gap: "0.5rem" }}>
        <input
          type="number"
          min={0}
          value={durationMin}
          onChange={(event) => setDurationMin(event.target.value)}
          placeholder="Dauer (Minuten)"
        />
        <input
          type="number"
          min={1}
          max={10}
          value={perceivedEffort}
          onChange={(event) => setPerceivedEffort(event.target.value)}
          placeholder="Gefühlte Anstrengung (1-10)"
        />
      </div>
      {error ? <p style={{ color: "#dc2626" }}>{error}</p> : null}
      <div style={{ display: "flex", gap: "0.75rem" }}>
        <button type="button" onClick={handleSubmit} disabled={!canSubmit}>
          Workout speichern
        </button>
        {onCancel ? (
          <button type="button" onClick={onCancel}>
            Abbrechen
          </button>
        ) : null}
      </div>
    </div>
  );
};
