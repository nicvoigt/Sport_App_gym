import type React from "react";

export type NavItem = {
  label: string;
  path: string;
  icon?: string;
  order?: number;
};

export type RouteDef = {
  path: string;
  element:
    | React.ComponentType<any>
    | React.LazyExoticComponent<React.ComponentType<any>>;
};

export type AppContextType = {
  db: unknown;
  settings: Record<string, unknown>;
  setSettings: (next: Record<string, unknown>) => void;
  units: {
    weightUnit: "kg" | "lb";
    toDisplayWeight: (valueKg: number) => number;
    toStorageWeight: (value: number) => number;
  };
};

export type FeatureModule = {
  id: string;
  nav: NavItem;
  routes: RouteDef[];
  init?: (ctx: AppContextType) => Promise<void> | void;
};
