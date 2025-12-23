import React from "react";
import type { EntryEnvelope } from "@tracker/contracts";
import type { GymPayload } from "../contracts";
import { calculateVolume } from "../utils/volume";

export const GymEntryCard: React.FC<{ entry: EntryEnvelope<GymPayload> }> = ({ entry }) => {
  const exerciseCount = entry.payload.exercises.length;
  const setCount = entry.payload.exercises.reduce((total, exercise) => total + exercise.sets.length, 0);
  const volume = calculateVolume(entry.payload);
  const formattedDate = new Date(entry.startAt).toLocaleDateString();

  return (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: "12px", padding: "1rem" }}>
      <h3 style={{ margin: 0 }}>Gym Session</h3>
      <p style={{ margin: "0.25rem 0" }}>Datum: {formattedDate}</p>
      <p style={{ margin: "0.25rem 0" }}>Übungen: {exerciseCount}</p>
      <p style={{ margin: "0.25rem 0" }}>Sätze: {setCount}</p>
      <p style={{ margin: "0.25rem 0" }}>Volumen: {volume.toFixed(1)} kg</p>
    </div>
  );
};
