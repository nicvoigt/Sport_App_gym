import React from "react";
import type { FeatureModule } from "@app/contracts";

const pageStyle: React.CSSProperties = {
  padding: "1.5rem",
  display: "flex",
  flexDirection: "column",
  gap: "1rem"
};

const TemplateHome: React.FC = () => (
  <div style={pageStyle}>
    <h1>Feature Template</h1>
    <p>Replace this with your feature UI.</p>
  </div>
);

export const feature: FeatureModule = {
  id: "template",
  nav: { label: "Template", path: "/template", icon: "✨", order: 99 },
  routes: [{ path: "/template", element: TemplateHome }]
};
