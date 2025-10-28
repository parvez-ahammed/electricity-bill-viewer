import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import autoprefixer from "autoprefixer";
import path from "path";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
    base: "/",
    plugins: [react(), tailwindcss(), svgr()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            "@shadcn": path.resolve(__dirname, "./src/components/ui/index.ts"),
        },
    },
    css: {
        postcss: {
            plugins: [autoprefixer({})],
        },
    },
    server: {
        host: "0.0.0.0",
        port: 5173,
        strictPort: true,
    },
    build: {
        sourcemap: false,
        minify: "terser",
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true,
            },
        },
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ["react", "react-dom", "react-router-dom"],
                    ui: ["@radix-ui/react-slot", "lucide-react"],
                    query: ["@tanstack/react-query"],
                },
            },
        },
        chunkSizeWarningLimit: 1000,
    },
});
