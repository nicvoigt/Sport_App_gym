import React from "react";
import { NavLink } from "react-router-dom";
import type { NavItem } from "@app/contracts";

const navStyle: React.CSSProperties = {
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(60px, 1fr))",
  padding: "0.75rem",
  background: "rgba(2,6,23,0.95)",
  borderTop: "1px solid #1f2937",
  zIndex: 10
};

const linkStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
  alignItems: "center",
  fontSize: "0.75rem",
  color: "#94a3b8",
  textDecoration: "none"
};

const activeStyle: React.CSSProperties = {
  color: "#38bdf8"
};

export const BottomNav: React.FC<{ items: NavItem[] }> = ({ items }) => (
  <nav style={navStyle}>
    {items.map((item) => (
      <NavLink
        key={item.path}
        to={item.path}
        style={({ isActive }) => ({ ...linkStyle, ...(isActive ? activeStyle : {}) })}
      >
        <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
        {item.label}
      </NavLink>
    ))}
  </nav>
);
