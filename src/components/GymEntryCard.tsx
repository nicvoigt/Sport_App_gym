import type { EntryCardProps } from "@tracker/contracts";
import { calculateWorkoutVolume } from "../utils/volume";
import type { GymPayload } from "../contracts";

export const GymEntryCard = ({ entry }: EntryCardProps<GymPayload>) => {
  const date = new Date(entry.startAt).toLocaleDateString();
  const exerciseCount = entry.payload.exercises.length;
  const setCount = entry.payload.exercises.reduce(
    (count, exercise) => count + exercise.sets.length,
    0
  );
  const volume = calculateWorkoutVolume(entry.payload);

  return (
    <article style={{ border: "1px solid #ddd", padding: 12, display: "grid", gap: 6 }}>
      <header style={{ fontWeight: 600 }}>{date}</header>
      <div>{exerciseCount} Übungen</div>
      <div>{setCount} Sätze</div>
      <div>Volumen: {volume.toFixed(1)} kg</div>
    </article>
  );
};
