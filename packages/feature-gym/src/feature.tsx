import React, { useEffect, useMemo, useState } from "react";
import { Link, Route, Routes, useNavigate, useParams } from "react-router-dom";
import {
  createRestTimer,
  estimate1RM,
  getRecordSets,
  seedIfEmpty,
  useApp,
  volumeForSet
} from "@app/core";
import type { FeatureModule } from "@app/contracts";
import type {
  Exercise,
  Template,
  TemplateEntry,
  Workout,
  WorkoutEntry,
  WorkoutSet
} from "@app/core";
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale } from "chart.js";

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale);

const pageStyle: React.CSSProperties = {
  padding: "1.5rem",
  display: "flex",
  flexDirection: "column",
  gap: "1rem"
};

const cardStyle: React.CSSProperties = {
  background: "#111827",
  borderRadius: "16px",
  padding: "1rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
  border: "1px solid #1f2937"
};

const buttonStyle: React.CSSProperties = {
  padding: "0.75rem 1rem",
  borderRadius: "12px",
  border: "1px solid #374151",
  background: "#2563eb",
  color: "white",
  fontWeight: 600,
  cursor: "pointer"
};

const outlineButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  background: "transparent",
  color: "#e5e7eb"
};

const inputStyle: React.CSSProperties = {
  padding: "0.75rem",
  borderRadius: "10px",
  border: "1px solid #374151",
  background: "#0f172a",
  color: "#e5e7eb"
};

const useReloadable = <T,>(loader: () => Promise<T>, deps: React.DependencyList): [T | null, () => void] => {
  const [data, setData] = useState<T | null>(null);
  const [nonce, setNonce] = useState(0);
  useEffect(() => {
    let mounted = true;
    loader().then((result) => {
      if (mounted) setData(result);
    });
    return () => {
      mounted = false;
    };
  }, [...deps, nonce]);
  const reload = () => setNonce((value) => value + 1);
  return [data, reload];
};

const GymHome: React.FC = () => {
  const { db } = useApp();
  const navigate = useNavigate();
  const [workouts, reloadWorkouts] = useReloadable<Workout[]>(
    () => db.workouts.orderBy("startedAt").reverse().toArray(),
    [db]
  );

  useEffect(() => {
    seedIfEmpty(db).catch(() => undefined);
  }, [db]);

  const createWorkout = async () => {
    const workout: Workout = {
      id: crypto.randomUUID(),
      startedAt: new Date().toISOString(),
      title: "Workout"
    };
    await db.workouts.add(workout);
    reloadWorkouts();
    navigate(`/gym/workout/${workout.id}`);
  };

  return (
    <div style={pageStyle}>
      <h1>Gym</h1>
      <button style={buttonStyle} onClick={createWorkout}>
        Start workout
      </button>
      <div style={cardStyle}>
        <h2>Recent workouts</h2>
        {workouts?.length ? (
          workouts.map((workout) => (
            <Link key={workout.id} to={`/gym/workout/${workout.id}`}>
              {workout.title ?? "Workout"} · {new Date(workout.startedAt).toLocaleString()}
            </Link>
          ))
        ) : (
          <p>No workouts yet.</p>
        )}
      </div>
      <div style={cardStyle}>
        <Link to="/gym/exercises">Exercise library</Link>
        <Link to="/gym/templates">Templates</Link>
        <Link to="/gym/history">History</Link>
      </div>
    </div>
  );
};

const ExerciseLibrary: React.FC = () => {
  const { db } = useApp();
  const [exercises, reloadExercises] = useReloadable<Exercise[]>(
    () => db.exercises.orderBy("name").toArray(),
    [db]
  );
  const [name, setName] = useState("");
  const [bodyPart, setBodyPart] = useState("Full body");
  const [equipment, setEquipment] = useState("Bodyweight");
  const [exerciseType, setExerciseType] = useState<Exercise["exerciseType"]>("reps+weight");

  const addExercise = async () => {
    if (!name.trim()) return;
    await db.exercises.add({
      id: crypto.randomUUID(),
      name,
      bodyPart,
      equipment,
      exerciseType
    });
    setName("");
    reloadExercises();
  };

  return (
    <div style={pageStyle}>
      <h1>Exercise library</h1>
      <div style={cardStyle}>
        <input
          style={inputStyle}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Exercise name"
        />
        <input
          style={inputStyle}
          value={bodyPart}
          onChange={(event) => setBodyPart(event.target.value)}
          placeholder="Body part"
        />
        <input
          style={inputStyle}
          value={equipment}
          onChange={(event) => setEquipment(event.target.value)}
          placeholder="Equipment"
        />
        <select
          style={inputStyle}
          value={exerciseType}
          onChange={(event) => setExerciseType(event.target.value as Exercise["exerciseType"])}
        >
          <option value="reps+weight">Reps + weight</option>
          <option value="assisted">Assisted</option>
          <option value="duration">Duration</option>
          <option value="distance+duration">Distance + duration</option>
        </select>
        <button style={buttonStyle} onClick={addExercise}>
          Add exercise
        </button>
      </div>
      <div style={cardStyle}>
        <h2>All exercises</h2>
        {exercises?.map((exercise) => (
          <Link key={exercise.id} to={`/gym/exercise/${exercise.id}`}>
            {exercise.name} · {exercise.bodyPart}
          </Link>
        ))}
      </div>
    </div>
  );
};

const RestTimerOverlay: React.FC<{
  remaining: number;
  onClose: () => void;
  onAdd: (delta: number) => void;
}> = ({ remaining, onClose, onAdd }) => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.8)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 20
    }}
  >
    <div style={{ ...cardStyle, width: "min(320px, 90%)", textAlign: "center" }}>
      <h2>Rest timer</h2>
      <p style={{ fontSize: "2.5rem", margin: 0 }}>{remaining}s</p>
      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
        <button style={outlineButtonStyle} onClick={() => onAdd(15)}>
          +15s
        </button>
        <button style={outlineButtonStyle} onClick={() => onAdd(-15)}>
          -15s
        </button>
      </div>
      <button style={buttonStyle} onClick={onClose}>
        Skip
      </button>
    </div>
  </div>
);

const WorkoutDetail: React.FC = () => {
  const { id } = useParams();
  const { db, settings } = useApp();
  const [workout, reloadWorkout] = useReloadable<Workout | undefined>(
    () => db.workouts.get(id ?? ""),
    [db, id]
  );
  const [entries, reloadEntries] = useReloadable<WorkoutEntry[]>(
    () => db.workoutEntries.where("workoutId").equals(id ?? "").sortBy("orderIndex"),
    [db, id]
  );
  const [exercises, reloadExercises] = useReloadable<Exercise[]>(
    () => db.exercises.orderBy("name").toArray(),
    [db]
  );
  const [sets, reloadSets] = useReloadable<WorkoutSet[]>(
    () => db.sets.toArray(),
    [db]
  );
  const [selectedExercise, setSelectedExercise] = useState("");
  const [supersetGroup, setSupersetGroup] = useState("");
  const [supersetOrder, setSupersetOrder] = useState(1);
  const [restState, setRestState] = useState(createRestTimer(settings.defaultRestTimerWorkingSeconds));
  const [showTimer, setShowTimer] = useState(false);

  useEffect(() => {
    if (!showTimer) return;
    const interval = window.setInterval(() => {
      setRestState((state) => {
        if (state.mode !== "running") return state;
        const next = {
          ...state,
          remainingSeconds: Math.max(0, state.remainingSeconds - 1)
        };
        if (next.remainingSeconds === 0) {
          return { ...next, mode: "completed" };
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [showTimer]);

  const addEntry = async () => {
    if (!selectedExercise || !id) return;
    const orderIndex = entries?.length ?? 0;
    await db.workoutEntries.add({
      id: crypto.randomUUID(),
      workoutId: id,
      exerciseId: selectedExercise,
      orderIndex,
      supersetGroupId: supersetGroup || undefined,
      supersetOrderIndex: supersetGroup ? supersetOrder : undefined
    });
    reloadEntries();
  };

  const addSet = async (entryId: string, tag: WorkoutSet["tag"]) => {
    const entrySets = sets?.filter((set) => set.entryId === entryId) ?? [];
    await db.sets.add({
      id: crypto.randomUUID(),
      entryId,
      setIndex: entrySets.length,
      isCompleted: false,
      tag
    });
    reloadSets();
  };

  const updateSet = async (set: WorkoutSet, updates: Partial<WorkoutSet>) => {
    await db.sets.update(set.id, updates);
    reloadSets();
  };

  const completeSet = async (set: WorkoutSet) => {
    await updateSet(set, { isCompleted: true });
    const nextSeconds = set.tag === "warmup" ? settings.defaultRestTimerWarmupSeconds : settings.defaultRestTimerWorkingSeconds;
    setRestState({ mode: "running", remainingSeconds: nextSeconds, totalSeconds: nextSeconds });
    setShowTimer(true);
  };

  const saveAsTemplate = async () => {
    if (!id || !entries) return;
    const template: Template = { id: crypto.randomUUID(), name: workout?.title ?? "Template" };
    await db.templates.add(template);
    await db.templateEntries.bulkAdd(
      entries.map((entry) => ({
        id: crypto.randomUUID(),
        templateId: template.id,
        exerciseId: entry.exerciseId,
        orderIndex: entry.orderIndex,
        supersetGroupId: entry.supersetGroupId,
        supersetOrderIndex: entry.supersetOrderIndex,
        plannedSets: (sets ?? []).filter((set) => set.entryId === entry.id).length || 3
      }))
    );
  };

  if (!workout) {
    return (
      <div style={pageStyle}>
        <p>Workout not found.</p>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <h1>{workout.title ?? "Workout"}</h1>
      <div style={cardStyle}>
        <label>Title</label>
        <input
          style={inputStyle}
          value={workout.title ?? ""}
          onChange={(event) =>
            db.workouts.update(workout.id, { title: event.target.value }).then(reloadWorkout)
          }
        />
        <label>Notes</label>
        <textarea
          style={{ ...inputStyle, minHeight: "80px" }}
          value={workout.notes ?? ""}
          onChange={(event) =>
            db.workouts.update(workout.id, { notes: event.target.value }).then(reloadWorkout)
          }
        />
        <button style={outlineButtonStyle} onClick={saveAsTemplate}>
          Save as template
        </button>
      </div>
      <div style={cardStyle}>
        <h2>Add exercise</h2>
        <select
          style={inputStyle}
          value={selectedExercise}
          onChange={(event) => setSelectedExercise(event.target.value)}
        >
          <option value="">Select exercise</option>
          {exercises?.map((exercise) => (
            <option key={exercise.id} value={exercise.id}>
              {exercise.name}
            </option>
          ))}
        </select>
        <input
          style={inputStyle}
          value={supersetGroup}
          onChange={(event) => setSupersetGroup(event.target.value)}
          placeholder="Superset group (optional, e.g. A)"
        />
        <input
          style={inputStyle}
          type="number"
          value={supersetOrder}
          min={1}
          onChange={(event) => setSupersetOrder(Number(event.target.value))}
          placeholder="Superset order"
        />
        <button style={buttonStyle} onClick={addEntry}>
          Add to workout
        </button>
      </div>
      {entries?.map((entry) => {
        const exercise = exercises?.find((ex) => ex.id === entry.exerciseId);
        const entrySets = (sets ?? []).filter((set) => set.entryId === entry.id);
        return (
          <div key={entry.id} style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <strong>{exercise?.name ?? "Exercise"}</strong>
                {entry.supersetGroupId ? (
                  <span>
                    {" "}· Superset {entry.supersetGroupId}
                    {entry.supersetOrderIndex ? `-${entry.supersetOrderIndex}` : ""}
                  </span>
                ) : null}
              </div>
              <Link to={`/gym/exercise/${entry.exerciseId}`}>Details</Link>
            </div>
            {entrySets.map((set) => (
              <div key={set.id} style={{ display: "grid", gap: "0.5rem" }}>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <span>Set {set.setIndex + 1}</span>
                  <select
                    style={inputStyle}
                    value={set.tag}
                    onChange={(event) => updateSet(set, { tag: event.target.value as WorkoutSet["tag"] })}
                  >
                    <option value="normal">Normal</option>
                    <option value="warmup">Warmup</option>
                    <option value="dropset">Dropset</option>
                    <option value="failure">Failure</option>
                  </select>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  <input
                    style={inputStyle}
                    type="number"
                    inputMode="numeric"
                    placeholder="Reps"
                    value={set.reps ?? ""}
                    onChange={(event) => updateSet(set, { reps: Number(event.target.value) })}
                  />
                  <input
                    style={inputStyle}
                    type="number"
                    inputMode="decimal"
                    placeholder="Weight"
                    value={set.weight ?? ""}
                    onChange={(event) => updateSet(set, { weight: Number(event.target.value) })}
                  />
                </div>
                <button style={outlineButtonStyle} onClick={() => completeSet(set)}>
                  {set.isCompleted ? "Completed" : "Complete set"}
                </button>
              </div>
            ))}
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button style={outlineButtonStyle} onClick={() => addSet(entry.id, "normal")}>Add set</button>
              <button style={outlineButtonStyle} onClick={() => addSet(entry.id, "warmup")}>Warmup</button>
            </div>
          </div>
        );
      })}
      {showTimer && (
        <RestTimerOverlay
          remaining={restState.remainingSeconds}
          onClose={() => setShowTimer(false)}
          onAdd={(delta) =>
            setRestState((state) => ({
              ...state,
              remainingSeconds: Math.max(0, state.remainingSeconds + delta)
            }))
          }
        />
      )}
    </div>
  );
};

const History: React.FC = () => {
  const { db } = useApp();
  const [workouts] = useReloadable<Workout[]>(
    () => db.workouts.orderBy("startedAt").reverse().toArray(),
    [db]
  );
  return (
    <div style={pageStyle}>
      <h1>History</h1>
      <div style={cardStyle}>
        {workouts?.map((workout) => (
          <Link key={workout.id} to={`/gym/workout/${workout.id}`}>
            {workout.title ?? "Workout"} · {new Date(workout.startedAt).toLocaleDateString()}
          </Link>
        ))}
      </div>
    </div>
  );
};

const Templates: React.FC = () => {
  const { db } = useApp();
  const navigate = useNavigate();
  const [templates, reloadTemplates] = useReloadable<Template[]>(
    () => db.templates.toArray(),
    [db]
  );
  const [templateName, setTemplateName] = useState("");

  const createTemplate = async () => {
    if (!templateName.trim()) return;
    await db.templates.add({ id: crypto.randomUUID(), name: templateName.trim() });
    setTemplateName("");
    reloadTemplates();
  };

  const startFromTemplate = async (templateId: string) => {
    const templateEntries = await db.templateEntries.where("templateId").equals(templateId).toArray();
    const workout: Workout = { id: crypto.randomUUID(), startedAt: new Date().toISOString(), title: "Workout" };
    await db.workouts.add(workout);
    await db.workoutEntries.bulkAdd(
      templateEntries.map((entry, index) => ({
        id: crypto.randomUUID(),
        workoutId: workout.id,
        exerciseId: entry.exerciseId,
        orderIndex: index,
        supersetGroupId: entry.supersetGroupId,
        supersetOrderIndex: entry.supersetOrderIndex
      }))
    );
    const workoutEntries = await db.workoutEntries.where("workoutId").equals(workout.id).toArray();
    const setsToAdd: WorkoutSet[] = [];
    templateEntries.forEach((entry) => {
      const workoutEntry = workoutEntries.find((we) => we.exerciseId === entry.exerciseId);
      if (!workoutEntry) return;
      for (let i = 0; i < entry.plannedSets; i += 1) {
        setsToAdd.push({
          id: crypto.randomUUID(),
          entryId: workoutEntry.id,
          setIndex: i,
          isCompleted: false,
          tag: "normal"
        });
      }
    });
    if (setsToAdd.length) {
      await db.sets.bulkAdd(setsToAdd);
    }
    navigate(`/gym/workout/${workout.id}`);
  };

  return (
    <div style={pageStyle}>
      <h1>Templates</h1>
      <div style={cardStyle}>
        <input
          style={inputStyle}
          value={templateName}
          onChange={(event) => setTemplateName(event.target.value)}
          placeholder="Template name"
        />
        <button style={buttonStyle} onClick={createTemplate}>
          Create template
        </button>
      </div>
      <div style={cardStyle}>
        {templates?.map((template) => (
          <div key={template.id} style={{ display: "flex", justifyContent: "space-between" }}>
            <span>{template.name}</span>
            <button style={outlineButtonStyle} onClick={() => startFromTemplate(template.id)}>
              Start workout
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const ChartCanvas: React.FC<{ labels: string[]; data: number[]; label: string }> = ({
  labels,
  data,
  label
}) => {
  const ref = React.useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    const chart = new Chart(ref.current, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label,
            data,
            borderColor: "#38bdf8",
            backgroundColor: "rgba(56,189,248,0.2)",
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } }
      }
    });
    return () => chart.destroy();
  }, [labels, data, label]);

  return <canvas ref={ref} />;
};

const ExerciseDetail: React.FC = () => {
  const { id } = useParams();
  const { db } = useApp();
  const [exercise] = useReloadable<Exercise | undefined>(() => db.exercises.get(id ?? ""), [db, id]);
  const [entries] = useReloadable<WorkoutEntry[]>(
    () => db.workoutEntries.where("exerciseId").equals(id ?? "").toArray(),
    [db, id]
  );
  const [workouts] = useReloadable<Workout[]>(() => db.workouts.toArray(), [db]);
  const [sets] = useReloadable<WorkoutSet[]>(() => db.sets.toArray(), [db]);

  const dataPoints = useMemo(() => {
    if (!entries || !workouts || !sets) return [];
    return entries
      .map((entry) => {
        const workout = workouts.find((item) => item.id === entry.workoutId);
        if (!workout) return null;
        const entrySets = sets.filter((set) => set.entryId === entry.id);
        const volume = entrySets.reduce((sum, set) => sum + volumeForSet(set), 0);
        const best1rm = Math.max(...entrySets.map((set) => estimate1RM(set)), 0);
        return {
          date: new Date(workout.startedAt).toLocaleDateString(),
          volume,
          best1rm
        };
      })
      .filter(Boolean) as Array<{ date: string; volume: number; best1rm: number }>;
  }, [entries, workouts, sets]);

  const recordResult = useMemo(() => getRecordSets(sets ?? []), [sets]);

  return (
    <div style={pageStyle}>
      <h1>{exercise?.name ?? "Exercise"}</h1>
      <div style={cardStyle}>
        <h2>Volume</h2>
        {dataPoints.length ? (
          <ChartCanvas
            labels={dataPoints.map((item) => item.date)}
            data={dataPoints.map((item) => item.volume)}
            label="Volume"
          />
        ) : (
          <p>No data yet.</p>
        )}
      </div>
      <div style={cardStyle}>
        <h2>Estimated 1RM</h2>
        {dataPoints.length ? (
          <ChartCanvas
            labels={dataPoints.map((item) => item.date)}
            data={dataPoints.map((item) => item.best1rm)}
            label="1RM"
          />
        ) : (
          <p>No data yet.</p>
        )}
      </div>
      <div style={cardStyle}>
        <h2>Records</h2>
        <p>Best actual: {recordResult.bestActual ? `${recordResult.bestActual.weight ?? 0} x ${recordResult.bestActual.reps ?? 0}` : "-"}</p>
        <p>
          Best predicted: {recordResult.bestPredicted ? estimate1RM(recordResult.bestPredicted).toFixed(1) : "-"}
        </p>
      </div>
    </div>
  );
};

const GymRoutes: React.FC = () => (
  <Routes>
    <Route path="/" element={<GymHome />} />
    <Route path="/exercises" element={<ExerciseLibrary />} />
    <Route path="/templates" element={<Templates />} />
    <Route path="/history" element={<History />} />
    <Route path="/workout/:id" element={<WorkoutDetail />} />
    <Route path="/exercise/:id" element={<ExerciseDetail />} />
  </Routes>
);

export const feature: FeatureModule = {
  id: "gym",
  nav: { label: "Gym", path: "/gym", icon: "🏋️", order: 1 },
  routes: [{ path: "/gym/*", element: GymRoutes }]
};
