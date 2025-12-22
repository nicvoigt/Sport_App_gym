import React from "react";
import type { FeatureModule } from "@app/contracts";

const pageStyle: React.CSSProperties = {
  padding: "1.5rem",
  display: "flex",
  flexDirection: "column",
  gap: "1rem"
};

const NutritionHome: React.FC = () => (
  <div style={pageStyle}>
    <h1>Nutrition</h1>
    <p>Coming soon. This module is ready for its own repo.</p>
  </div>
);

export const feature: FeatureModule = {
  id: "nutrition",
  nav: { label: "Nutrition", path: "/nutrition", icon: "🥗", order: 4 },
  routes: [{ path: "/nutrition", element: NutritionHome }]
};
