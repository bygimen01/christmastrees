import { fileURLToPath, pathToFileURL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, Plugin, ViteDevServer } from "vite";

function localOrderApi(): Plugin {
  return {
    name: "local-order-api",
    configureServer(server: ViteDevServer) {
      server.middlewares.use("/api/order", async (req, res) => {
        try {
          const apiPath = fileURLToPath(new URL("./api/order.js", import.meta.url));
          const moduleUrl = `${pathToFileURL(apiPath).href}?t=${Date.now()}`;
          const { default: handler } = await import(moduleUrl);
          await handler(req, res);
        } catch (error) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify({ ok: false, error: "ORDER_API_UNAVAILABLE" }));
          server.config.logger.error(error instanceof Error ? error.message : String(error));
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), localOrderApi()],
  server: {
    host: "127.0.0.1",
    port: 5173
  },
  build: {
    sourcemap: false,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          icons: ["lucide-react"]
        }
      }
    }
  }
});
