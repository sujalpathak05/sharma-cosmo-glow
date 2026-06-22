import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("/react/") || id.includes("/react-dom/") || id.includes("react-router")) {
            return "react-vendor";
          }
          if (id.includes("@supabase/")) {
            return "supabase-vendor";
          }
          if (id.includes("@radix-ui/")) {
            return "ui-vendor";
          }
          if (id.includes("@tanstack/") || id.includes("recharts") || id.includes("embla-carousel")) {
            return "data-vendor";
          }
          return "vendor";
        },
      },
    },
  },
}));
