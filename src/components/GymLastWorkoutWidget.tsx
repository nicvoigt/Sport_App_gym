import { useEffect, useState } from "react";
import type { EntryEnvelope, WidgetProps } from "@tracker/contracts";
import { calculateWorkoutVolume } from "../utils/volume";
import type { GymPayload } from "../contracts";
import { gymEntryTypeId } from "../ids";

const formatDate = (value: string) => new Date(value).toLocaleDateString();

export const GymLastWorkoutWidget = ({ ctx }: WidgetProps<Record<string, never>>) => {
  const [lastEntry, setLastEntry] = useState<EntryEnvelope<GymPayload> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    ctx.services.entryStore
      .query({
        types: [gymEntryTypeId],
        limit: 1,
        sortBy: "startAt",
        sortDir: "desc"
      })
      .then((entries) => {
        if (!isMounted) return;
        setLastEntry((entries[0] as EntryEnvelope<GymPayload>) ?? null);
      })
      .catch(() => {
        if (!isMounted) return;
        setLastEntry(null);
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [ctx]);

  if (isLoading) {
    return <div>Letztes Workout wird geladen…</div>;
  }

  if (!lastEntry) {
    return (
      <div style={{ display: "grid", gap: 8 }}>
        <div>Noch kein Gym-Workout vorhanden.</div>
        <button type="button" onClick={() => ctx.services.navigate("/logbook")}>
          Erstes Workout anlegen
        </button>
      </div>
    );
  }

  const volume = calculateWorkoutVolume(lastEntry.payload);

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ fontWeight: 600 }}>Letztes Workout</div>
      <div>{formatDate(lastEntry.startAt)}</div>
      <div>{lastEntry.payload.exercises.length} Übungen</div>
      <div>Volumen: {volume.toFixed(1)} kg</div>
      <button type="button" onClick={() => ctx.services.navigate("/logbook?type=gym")}>
        Zum Logbook
      </button>
    </div>
  );
};
