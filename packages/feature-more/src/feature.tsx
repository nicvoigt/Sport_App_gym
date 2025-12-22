import React from "react";
import type { FeatureModule } from "@app/contracts";
import { exportAllTables, triggerCsvDownload, useApp } from "@app/core";

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

const inputStyle: React.CSSProperties = {
  padding: "0.75rem",
  borderRadius: "10px",
  border: "1px solid #374151",
  background: "#0f172a",
  color: "#e5e7eb"
};

const buttonStyle: React.CSSProperties = {
  padding: "0.75rem 1rem",
  borderRadius: "12px",
  border: "1px solid #374151",
  background: "#0ea5e9",
  color: "white",
  fontWeight: 600,
  cursor: "pointer"
};

const MoreHome: React.FC = () => {
  const { db, settings, setSettings, units } = useApp();

  const downloadCsv = async () => {
    const exports = await exportAllTables(db);
    exports.forEach((item) => triggerCsvDownload(item.filename, item.csv));
  };

  return (
    <div style={pageStyle}>
      <h1>More</h1>
      <div style={cardStyle}>
        <h2>Settings</h2>
        <label>Units</label>
        <select
          style={inputStyle}
          value={settings.units}
          onChange={(event) => setSettings({ ...settings, units: event.target.value as "kg" | "lb" })}
        >
          <option value="kg">Kilograms</option>
          <option value="lb">Pounds</option>
        </select>
        <label>Default rest timer (working)</label>
        <input
          style={inputStyle}
          type="number"
          value={settings.defaultRestTimerWorkingSeconds}
          onChange={(event) =>
            setSettings({
              ...settings,
              defaultRestTimerWorkingSeconds: Number(event.target.value)
            })
          }
        />
        <label>Default rest timer (warmup)</label>
        <input
          style={inputStyle}
          type="number"
          value={settings.defaultRestTimerWarmupSeconds}
          onChange={(event) =>
            setSettings({
              ...settings,
              defaultRestTimerWarmupSeconds: Number(event.target.value)
            })
          }
        />
        <label>Bar weight ({units.weightUnit})</label>
        <input
          style={inputStyle}
          type="number"
          value={settings.barWeightKg ? units.toDisplayWeight(settings.barWeightKg).toFixed(1) : ""}
          onChange={(event) => {
            const nextValue = event.target.value;
            setSettings({
              ...settings,
              barWeightKg: nextValue ? units.toStorageWeight(Number(nextValue)) : undefined
            });
          }}
        />
      </div>
      <div style={cardStyle}>
        <h2>Export</h2>
        <button style={buttonStyle} onClick={downloadCsv}>
          Download CSVs
        </button>
      </div>
      <div style={cardStyle}>
        <h2>Offline-first</h2>
        <p>All data stays on your device unless you export it.</p>
      </div>
    </div>
  );
};

export const feature: FeatureModule = {
  id: "more",
  nav: { label: "More", path: "/more", icon: "⋯", order: 5 },
  routes: [{ path: "/more", element: MoreHome }]
};
