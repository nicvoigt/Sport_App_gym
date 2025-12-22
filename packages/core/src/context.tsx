import React, { createContext, useContext, useMemo, useState } from "react";
import type { AppDb, Settings } from "./db";
import { DEFAULT_SETTINGS } from "./db";

export type AppContextType = {
  db: AppDb;
  settings: Settings;
  setSettings: (next: Settings) => void;
  units: {
    weightUnit: "kg" | "lb";
    toDisplayWeight: (valueKg: number) => number;
    toStorageWeight: (value: number) => number;
  };
};

const AppContext = createContext<AppContextType | undefined>(undefined);

type AppProviderProps = {
  db: AppDb;
  initialSettings?: Settings;
  onSettingsChange?: (next: Settings) => void;
  children: React.ReactNode;
};

export const AppProvider: React.FC<AppProviderProps> = ({
  db,
  initialSettings,
  onSettingsChange,
  children
}) => {
  const [settingsState, setSettingsState] = useState<Settings>(
    initialSettings ?? DEFAULT_SETTINGS
  );

  const setSettings = (next: Settings) => {
    setSettingsState(next);
    onSettingsChange?.(next);
  };

  const units = useMemo(() => {
    const weightUnit = settingsState.units;
    return {
      weightUnit,
      toDisplayWeight: (valueKg: number) => (weightUnit === "kg" ? valueKg : valueKg * 2.20462),
      toStorageWeight: (value: number) => (weightUnit === "kg" ? value : value / 2.20462)
    };
  }, [settingsState.units]);

  return (
    <AppContext.Provider value={{ db, settings: settingsState, setSettings, units }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within AppProvider");
  }
  return ctx;
};
