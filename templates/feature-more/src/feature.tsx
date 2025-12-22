import React from "react";
import type { FeatureModule } from "@app/contracts";

const pageStyle: React.CSSProperties = {
  padding: "1.5rem",
  display: "flex",
  flexDirection: "column",
  gap: "1rem"
};

const MoreHome: React.FC = () => (
  <div style={pageStyle}>
    <h1>More</h1>
    <p>Replace with settings/export UI.</p>
  </div>
);

export const feature: FeatureModule = {
  id: "more",
  nav: { label: "More", path: "/more", icon: "⋯", order: 5 },
  routes: [{ path: "/more", element: MoreHome }]
};
