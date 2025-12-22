import React from "react";
import type { FeatureModule } from "@app/contracts";

const pageStyle: React.CSSProperties = {
  padding: "1.5rem",
  display: "flex",
  flexDirection: "column",
  gap: "1rem"
};

const RunHome: React.FC = () => (
  <div style={pageStyle}>
    <h1>Run</h1>
    <p>Replace with running feature UI.</p>
  </div>
);

export const feature: FeatureModule = {
  id: "run",
  nav: { label: "Run", path: "/run", icon: "🏃", order: 3 },
  routes: [{ path: "/run", element: RunHome }]
};
