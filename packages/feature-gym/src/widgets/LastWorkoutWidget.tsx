import React, { useEffect, useState } from "react";
import type { EntryEnvelope, WidgetContext } from "@tracker/contracts";
import type { GymPayload } from "../contracts";
import { GYM_ENTRY_TYPE_ID } from "../ids";
import { calculateVolume } from "../utils/volume";

type WidgetProps = {
  config: Record<string, never>;
  ctx: WidgetContext;
};

export const LastWorkoutWidget: React.FC<WidgetProps> = ({ ctx }) => {
  const [lastEntry, setLastEntry] = useState<EntryEnvelope<GymPayload> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    ctx.services.entryStore
      .query({
        types: [GYM_ENTRY_TYPE_ID],
        limit: 1,
        sortBy: "startAt",
        sortDir: "desc"
      })
      .then((entries) => {
        if (!active) return;
        setLastEntry((entries[0] as EntryEnvelope<GymPayload>) ?? null);
      })
      .finally(() => {
        if (!active) return;
        setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [ctx.services.entryStore]);

  const navigateToLogbook = () => ctx.services.navigate("/logbook?type=gym");

  if (isLoading) {
    return <p>Lade letzten Workout...</p>;
  }

  if (!lastEntry) {
    return (
      <div>
        <p>Noch kein Gym-Workout gespeichert.</p>
        <button type="button" onClick={() => ctx.services.navigate("/logbook")}>
          Erstes Workout anlegen
        </button>
      </div>
    );
  }

  const volume = calculateVolume(lastEntry.payload);
  const exerciseCount = lastEntry.payload.exercises.length;
  const setCount = lastEntry.payload.exercises.reduce((total, exercise) => total + exercise.sets.length, 0);
  const dateLabel = new Date(lastEntry.startAt).toLocaleDateString();

  return (
    <div style={{ display: "grid", gap: "0.5rem" }}>
      <strong>Letztes Workout ({dateLabel})</strong>
      <span>{exerciseCount} Übungen · {setCount} Sätze</span>
      <span>Volumen: {volume.toFixed(1)} kg</span>
      <button type="button" onClick={navigateToLogbook}>
        Zum Logbook
      </button>
    </div>
  );
};
