import React, { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppDb, AppProvider, DEFAULT_SETTINGS } from "@app/core";
import { AddToHomeScreen } from "./components/AddToHomeScreen";
import { BottomNav } from "./components/BottomNav";
import { NAV_ITEMS, ROUTES } from "./features/registry";
import type { Settings } from "@app/core";

const appShellStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#0b1120",
  color: "#e2e8f0",
  paddingBottom: "4.5rem"
};

const AppContent: React.FC<{ db: AppDb; initialSettings: Settings }> = ({
  db,
  initialSettings
}) => {
  const handleSettingsChange = async (next: Settings) => {
    await db.settings.put(next);
  };

  return (
    <AppProvider db={db} initialSettings={initialSettings} onSettingsChange={handleSettingsChange}>
      <div style={appShellStyle}>
        <Routes>
          <Route path="/" element={<Navigate to="/gym" replace />} />
          {ROUTES.map((route) => (
            <Route key={route.path} path={route.path} element={<route.element />} />
          ))}
        </Routes>
        <AddToHomeScreen />
        <BottomNav items={NAV_ITEMS} />
      </div>
    </AppProvider>
  );
};

export const App: React.FC = () => {
  const db = useMemo(() => new AppDb(), []);
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      const stored = await db.settings.get("settings");
      if (!stored) {
        await db.settings.put(DEFAULT_SETTINGS);
        setSettings(DEFAULT_SETTINGS);
      } else {
        setSettings(stored);
      }
    };
    loadSettings();
  }, [db]);

  if (!settings) {
    return <div style={{ padding: "2rem" }}>Loading...</div>;
  }

  return <AppContent db={db} initialSettings={settings} />;
};
