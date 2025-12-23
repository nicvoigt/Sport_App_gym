import { useState, type FormEvent } from "react";
import type { EntryFormProps } from "@tracker/contracts";
import { GymPayloadSchema, payloadVersion, type GymPayload } from "../contracts";

const emptySet = () => ({
  reps: 0,
  weightKg: 0,
  rpe: undefined as number | undefined,
  isDropSet: false,
  notes: ""
});

const emptyExercise = () => ({
  name: "",
  sets: [emptySet()]
});

export const GymEntryForm = ({
  initialValue,
  onSubmit,
  onCancel
}: EntryFormProps<GymPayload>) => {
  const [exercises, setExercises] = useState(
    initialValue?.exercises.length ? initialValue.exercises : [emptyExercise()]
  );
  const [durationMin, setDurationMin] = useState<number | undefined>(
    initialValue?.durationMin
  );
  const [perceivedEffort, setPerceivedEffort] = useState<number | undefined>(
    initialValue?.perceivedEffort
  );
  const [error, setError] = useState<string | null>(null);

  const updateExercise = (index: number, updater: (current: typeof exercises[0]) => typeof exercises[0]) => {
    setExercises((current) => {
      const next = [...current];
      next[index] = updater(next[index]);
      return next;
    });
  };

  const handleAddExercise = () => {
    setExercises((current) => [...current, emptyExercise()]);
  };

  const handleAddSet = (exerciseIndex: number) => {
    updateExercise(exerciseIndex, (exercise) => ({
      ...exercise,
      sets: [...exercise.sets, emptySet()]
    }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    const payload = {
      payloadVersion,
      exercises: exercises.map((exercise) => ({
        name: exercise.name.trim(),
        sets: exercise.sets.map((set) => ({
          reps: set.reps,
          weightKg: set.weightKg,
          rpe: set.rpe,
          isDropSet: set.isDropSet,
          notes: set.notes?.trim() || undefined
        }))
      })),
      durationMin,
      perceivedEffort
    };

    const result = GymPayloadSchema.safeParse(payload);
    if (!result.success) {
      setError("Bitte überprüfe die Eingaben.");
      return;
    }

    onSubmit(result.data);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
      {error ? <div style={{ color: "crimson" }}>{error}</div> : null}

      <section style={{ display: "grid", gap: 12 }}>
        {exercises.map((exercise, exerciseIndex) => (
          <div key={`exercise-${exerciseIndex}`} style={{ border: "1px solid #ddd", padding: 12 }}>
            <label style={{ display: "grid", gap: 6 }}>
              Übung
              <input
                type="text"
                value={exercise.name}
                onChange={(event) =>
                  updateExercise(exerciseIndex, (current) => ({
                    ...current,
                    name: event.target.value
                  }))
                }
                placeholder="z.B. Bench Press"
                required
              />
            </label>

            <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
              {exercise.sets.map((set, setIndex) => (
                <div
                  key={`set-${exerciseIndex}-${setIndex}`}
                  style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))" }}
                >
                  <label style={{ display: "grid", gap: 4 }}>
                    Reps
                    <input
                      type="number"
                      min={0}
                      value={set.reps}
                      onChange={(event) =>
                        updateExercise(exerciseIndex, (current) => {
                          const sets = [...current.sets];
                          sets[setIndex] = { ...sets[setIndex], reps: Number(event.target.value) };
                          return { ...current, sets };
                        })
                      }
                      required
                    />
                  </label>
                  <label style={{ display: "grid", gap: 4 }}>
                    Gewicht (kg)
                    <input
                      type="number"
                      min={0}
                      step="0.5"
                      value={set.weightKg}
                      onChange={(event) =>
                        updateExercise(exerciseIndex, (current) => {
                          const sets = [...current.sets];
                          sets[setIndex] = { ...sets[setIndex], weightKg: Number(event.target.value) };
                          return { ...current, sets };
                        })
                      }
                      required
                    />
                  </label>
                  <label style={{ display: "grid", gap: 4 }}>
                    RPE
                    <input
                      type="number"
                      min={0}
                      max={10}
                      step="0.5"
                      value={set.rpe ?? ""}
                      onChange={(event) =>
                        updateExercise(exerciseIndex, (current) => {
                          const sets = [...current.sets];
                          const value = event.target.value;
                          sets[setIndex] = {
                            ...sets[setIndex],
                            rpe: value === "" ? undefined : Number(value)
                          };
                          return { ...current, sets };
                        })
                      }
                    />
                  </label>
                  <label style={{ display: "grid", gap: 4 }}>
                    Drop Set
                    <input
                      type="checkbox"
                      checked={Boolean(set.isDropSet)}
                      onChange={(event) =>
                        updateExercise(exerciseIndex, (current) => {
                          const sets = [...current.sets];
                          sets[setIndex] = { ...sets[setIndex], isDropSet: event.target.checked };
                          return { ...current, sets };
                        })
                      }
                    />
                  </label>
                  <label style={{ display: "grid", gap: 4 }}>
                    Notes
                    <input
                      type="text"
                      value={set.notes ?? ""}
                      onChange={(event) =>
                        updateExercise(exerciseIndex, (current) => {
                          const sets = [...current.sets];
                          sets[setIndex] = { ...sets[setIndex], notes: event.target.value };
                          return { ...current, sets };
                        })
                      }
                      placeholder="optional"
                    />
                  </label>
                </div>
              ))}
              <button type="button" onClick={() => handleAddSet(exerciseIndex)}>
                Satz hinzufügen
              </button>
            </div>
          </div>
        ))}
      </section>

      <button type="button" onClick={handleAddExercise}>
        Übung hinzufügen
      </button>

      <section style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
        <label style={{ display: "grid", gap: 4 }}>
          Dauer (Min.)
          <input
            type="number"
            min={0}
            value={durationMin ?? ""}
            onChange={(event) => {
              const value = event.target.value;
              setDurationMin(value === "" ? undefined : Number(value));
            }}
          />
        </label>
        <label style={{ display: "grid", gap: 4 }}>
          Anstrengung (1-10)
          <input
            type="number"
            min={1}
            max={10}
            value={perceivedEffort ?? ""}
            onChange={(event) => {
              const value = event.target.value;
              setPerceivedEffort(value === "" ? undefined : Number(value));
            }}
          />
        </label>
      </section>

      <div style={{ display: "flex", gap: 8 }}>
        <button type="submit">Workout speichern</button>
        {onCancel ? (
          <button type="button" onClick={onCancel}>
            Abbrechen
          </button>
        ) : null}
      </div>
    </form>
  );
};
