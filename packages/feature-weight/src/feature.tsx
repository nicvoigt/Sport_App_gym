import React, { useMemo, useState } from "react";
import { useApp } from "@app/core";
import type { FeatureModule } from "@app/contracts";
import type { Measurement } from "@app/core";
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
  background: "#16a34a",
  color: "white",
  fontWeight: 600,
  cursor: "pointer"
};

const ChartCanvas: React.FC<{ labels: string[]; data: number[]; label: string }> = ({
  labels,
  data,
  label
}) => {
  const ref = React.useRef<HTMLCanvasElement | null>(null);
  React.useEffect(() => {
    if (!ref.current) return;
    const chart = new Chart(ref.current, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label,
            data,
            borderColor: "#fbbf24",
            backgroundColor: "rgba(251,191,36,0.2)",
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

const smoothTrend = (values: number[], windowSize = 3): number[] =>
  values.map((value, index) => {
    const start = Math.max(0, index - windowSize + 1);
    const slice = values.slice(start, index + 1);
    return slice.reduce((sum, item) => sum + item, 0) / slice.length;
  });

const WeightHome: React.FC = () => {
  const { db, units, settings, setSettings } = useApp();
  const [measurements, setMeasurements] = React.useState<Measurement[]>([]);
  const [value, setValue] = useState("");
  const [notes, setNotes] = useState("");

  React.useEffect(() => {
    db.measurements.orderBy("measuredAt").reverse().toArray().then(setMeasurements);
  }, [db]);

  const addMeasurement = async () => {
    const numericValue = Number(value);
    if (!numericValue) return;
    const measurement: Measurement = {
      id: crypto.randomUUID(),
      measuredAt: new Date().toISOString(),
      type: "bodyweight",
      valueKg: units.toStorageWeight(numericValue),
      notes: notes.trim() || undefined
    };
    await db.measurements.add(measurement);
    setValue("");
    setNotes("");
    setMeasurements(await db.measurements.orderBy("measuredAt").reverse().toArray());
  };

  const sorted = [...measurements].sort(
    (a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime()
  );

  const chartData = sorted.map((entry) => units.toDisplayWeight(entry.valueKg));
  const trendData = smoothTrend(chartData);
  const labels = sorted.map((entry) => new Date(entry.measuredAt).toLocaleDateString());

  const insights = useMemo(() => {
    if (!sorted.length) return null;
    const last = chartData[chartData.length - 1];
    const start7 = chartData[Math.max(0, chartData.length - 7)] ?? last;
    const start30 = chartData[Math.max(0, chartData.length - 30)] ?? last;
    const start90 = chartData[Math.max(0, chartData.length - 90)] ?? last;
    const min7 = Math.min(...chartData.slice(-7));
    const max7 = Math.max(...chartData.slice(-7));
    const rateWeek = (last - start30) / (Math.min(30, chartData.length) / 7);
    return {
      delta7: last - start7,
      delta30: last - start30,
      delta90: last - start90,
      min7,
      max7,
      rateWeek
    };
  }, [chartData, sorted.length]);

  return (
    <div style={pageStyle}>
      <h1>Weight</h1>
      <div style={cardStyle}>
        <label>Today</label>
        <input
          style={inputStyle}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          type="number"
          inputMode="decimal"
          placeholder={`Weight (${units.weightUnit})`}
        />
        <input
          style={inputStyle}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Notes (optional)"
        />
        <button style={buttonStyle} onClick={addMeasurement}>
          Save entry
        </button>
      </div>
      <div style={cardStyle}>
        <h2>Trend</h2>
        {labels.length ? (
          <>
            <ChartCanvas labels={labels} data={chartData} label="Weight" />
            <ChartCanvas labels={labels} data={trendData} label="Trend" />
          </>
        ) : (
          <p>No data yet.</p>
        )}
      </div>
      <div style={cardStyle}>
        <h2>Insights</h2>
        {insights ? (
          <>
            <p>Δ 7 days: {insights.delta7.toFixed(2)} {units.weightUnit}</p>
            <p>Δ 30 days: {insights.delta30.toFixed(2)} {units.weightUnit}</p>
            <p>Δ 90 days: {insights.delta90.toFixed(2)} {units.weightUnit}</p>
            <p>Rate/week: {insights.rateWeek.toFixed(2)} {units.weightUnit}</p>
            <p>Min/Max (7d): {insights.min7.toFixed(1)} / {insights.max7.toFixed(1)} {units.weightUnit}</p>
          </>
        ) : (
          <p>No insights yet.</p>
        )}
        <label>Goal bodyweight</label>
        <input
          style={inputStyle}
          value={
            settings.goalBodyweightKg
              ? units.toDisplayWeight(settings.goalBodyweightKg).toFixed(1)
              : ""
          }
          onChange={(event) => {
            const nextValue = event.target.value;
            setSettings({
              ...settings,
              goalBodyweightKg: nextValue ? units.toStorageWeight(Number(nextValue)) : undefined
            });
          }}
          placeholder={`Goal (${units.weightUnit})`}
        />
      </div>
      <div style={cardStyle}>
        <h2>Log</h2>
        {measurements.map((entry) => (
          <div key={entry.id}>
            {new Date(entry.measuredAt).toLocaleDateString()} · {units.toDisplayWeight(entry.valueKg).toFixed(1)} {units.weightUnit}
          </div>
        ))}
      </div>
    </div>
  );
};

export const feature: FeatureModule = {
  id: "weight",
  nav: { label: "Weight", path: "/weight", icon: "⚖️", order: 2 },
  routes: [{ path: "/weight", element: WeightHome }]
};
