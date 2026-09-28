import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Relative base, so the build opens from any static folder or sub-path.
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  build: {
    target: "es2022",
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        // Three.js and the R3F stack change rarely: keep them in their own
        // long-cached chunk, apart from the app code.
        manualChunks(id) {
          if (/node_modules[\/](three|@react-three|postprocessing|three-stdlib)[\/]/.test(id)) return "three";
          return undefined;
        },
      },
    },
  },
});
