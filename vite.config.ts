import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [viteReact(), tailwindcss(), tsconfigPaths()],
  server: {
    port: 5173,
  },
});
