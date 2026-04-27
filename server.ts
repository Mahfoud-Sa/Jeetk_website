import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { createProxyMiddleware } from "http-proxy-middleware";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Proxy API requests to the real backend
  app.use(
    "/api",
    createProxyMiddleware({
      target: "https://jeetk-api.runasp.net/api",
      changeOrigin: true,
      on: {
        proxyReq: (proxyReq, req, res) => {
          console.log(`[Proxy] Request: ${req.method} ${req.url} -> ${proxyReq.host}${proxyReq.path}`);
        },
        proxyRes: (proxyRes, req, res) => {
          console.log(`[Proxy] Response: ${proxyRes.statusCode} from ${req.url}`);
        },
        error: (err, req, res) => {
          console.error(`[Proxy] Error:`, err);
        },
      },
      logger: console,
    })
  );

  app.use(express.json());

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

