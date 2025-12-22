import React from "react";
import type { FeatureModule } from "@app/contracts";

const pageStyle: React.CSSProperties = {
  padding: "1.5rem",
  display: "flex",
  flexDirection: "column",
  gap: "1rem"
};

const GymHome: React.FC = () => (
  <div style={pageStyle}>
    <h1>Gym</h1>
    <p>Replace with gym feature UI.</p>
  </div>
);

export const feature: FeatureModule = {
  id: "gym",
  nav: { label: "Gym", path: "/gym", icon: "🏋️", order: 1 },
  routes: [{ path: "/gym", element: GymHome }]
};
