import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { fileURLToPath } from "node:url";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
    publicDir: path.resolve(__dirname, "public"),
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(path.dirname(fileURLToPath(import.meta.url)), "./src")
        }
    }
});
