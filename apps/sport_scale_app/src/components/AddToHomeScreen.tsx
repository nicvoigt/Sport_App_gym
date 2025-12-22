import React, { useEffect, useState } from "react";

const bannerStyle: React.CSSProperties = {
  position: "fixed",
  bottom: "4.5rem",
  left: "1rem",
  right: "1rem",
  background: "#0f172a",
  border: "1px solid #1f2937",
  borderRadius: "14px",
  padding: "0.75rem 1rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  zIndex: 9
};

const buttonStyle: React.CSSProperties = {
  alignSelf: "flex-end",
  background: "transparent",
  border: "1px solid #334155",
  borderRadius: "10px",
  color: "#e2e8f0",
  padding: "0.4rem 0.75rem"
};

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

const isIOS = () => /iphone|ipad|ipod/i.test(window.navigator.userAgent);

export const AddToHomeScreen: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isIOS()) return;
    setVisible(!isStandalone());
  }, []);

  if (!visible) return null;

  return (
    <div style={bannerStyle}>
      <strong>Add to Home Screen</strong>
      <span>
        Tap the share icon and choose “Add to Home Screen” for a full-screen, offline-ready
        experience.
      </span>
      <button style={buttonStyle} onClick={() => setVisible(false)}>
        Dismiss
      </button>
    </div>
  );
};
