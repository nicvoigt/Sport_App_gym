import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.svg", "maskable.svg"],
      manifest: {
        name: "Sport Scale",
        short_name: "SportScale",
        description: "Offline-first workout tracker",
        start_url: "/",
        display: "standalone",
        background_color: "#0b1120",
        theme_color: "#0ea5e9",
        icons: [
          {
            src: "/icon.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "any"
          },
          {
            src: "/maskable.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "maskable"
          }
        ]
      },
      workbox: {
        navigateFallback: "/index.html",
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === "document",
            handler: "NetworkFirst"
          },
          {
            urlPattern: ({ request }) =>
              ["script", "style", "image", "font"].includes(request.destination),
            handler: "CacheFirst"
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@app/core": path.resolve(__dirname, "../../packages/core/src"),
      "@app/contracts": path.resolve(__dirname, "../../packages/contracts/src"),
      "@app/feature-gym": path.resolve(__dirname, "../../packages/feature-gym/src"),
      "@app/feature-weight": path.resolve(__dirname, "../../packages/feature-weight/src"),
      "@app/feature-run": path.resolve(__dirname, "../../packages/feature-run/src"),
      "@app/feature-nutrition": path.resolve(__dirname, "../../packages/feature-nutrition/src"),
      "@app/feature-more": path.resolve(__dirname, "../../packages/feature-more/src")
    }
  },
  test: {
    include: ["../../packages/core/src/__tests__/**/*.test.ts"],
    environment: "jsdom"
  }
});
