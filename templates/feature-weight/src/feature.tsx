import React from "react";
import type { FeatureModule } from "@app/contracts";

const pageStyle: React.CSSProperties = {
  padding: "1.5rem",
  display: "flex",
  flexDirection: "column",
  gap: "1rem"
};

const WeightHome: React.FC = () => (
  <div style={pageStyle}>
    <h1>Weight</h1>
    <p>Replace with weight tracking UI.</p>
  </div>
);

export const feature: FeatureModule = {
  id: "weight",
  nav: { label: "Weight", path: "/weight", icon: "⚖️", order: 2 },
  routes: [{ path: "/weight", element: WeightHome }]
};
