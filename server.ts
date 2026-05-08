import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // NVIDIA NIM API Proxy
  app.post("/api/chat", async (req, res) => {
    const { messages } = req.body;
    const apiKey = process.env.NVIDIA_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ 
        error: "NVIDIA_API_KEY is not configured. Please set it in the Secrets panel." 
      });
    }

    try {
      const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "nvidia/nemotron-3-super-120b-a12b",
          messages,
          temperature: 0.5,
          top_p: 1,
          max_tokens: 1024,
          stream: false, // Simplifying for this version
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("NVIDIA API Error:", errorData);
        throw new Error(errorData.error?.message || "Failed to fetch from NVIDIA API");
      }

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error("Server Error:", error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

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
