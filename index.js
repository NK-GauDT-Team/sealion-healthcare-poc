// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import { randomUUID } from "crypto";
var MemStorage = class {
  users;
  chatSessions;
  medicines;
  pharmacies;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.chatSessions = /* @__PURE__ */ new Map();
    this.medicines = /* @__PURE__ */ new Map();
    this.pharmacies = /* @__PURE__ */ new Map();
    this.initializeSampleData();
  }
  initializeSampleData() {
    const sampleMedicines = [
      {
        id: randomUUID(),
        name: "Paracetamol",
        genericName: "Acetaminophen",
        dosage: "500mg tablets",
        description: "Pain reliever and fever reducer",
        sideEffects: "Rare: liver damage with overdose",
        availableCountries: ["Thailand", "Singapore", "Malaysia", "Indonesia"]
      },
      {
        id: randomUUID(),
        name: "Domperidone",
        genericName: "Domperidone",
        dosage: "10mg tablets",
        description: "Anti-nausea medication",
        sideEffects: "Dry mouth, headache, abdominal cramps",
        availableCountries: ["Thailand", "Singapore", "Malaysia"]
      },
      {
        id: randomUUID(),
        name: "Ibuprofen",
        genericName: "Ibuprofen",
        dosage: "200mg tablets",
        description: "Anti-inflammatory pain reliever",
        sideEffects: "Stomach irritation, dizziness",
        availableCountries: ["Thailand", "Singapore", "Malaysia", "Indonesia", "Philippines"]
      }
    ];
    sampleMedicines.forEach((medicine) => {
      this.medicines.set(medicine.id, medicine);
    });
    const samplePharmacies = [
      {
        id: randomUUID(),
        name: "Boots Pharmacy",
        address: "Central World, 4th Floor, 999/9 Rama I Rd",
        latitude: "13.7470",
        longitude: "100.5392",
        country: "Thailand",
        city: "Bangkok",
        phoneNumber: "+66-2-613-1111",
        openingHours: "10:00 AM - 10:00 PM"
      },
      {
        id: randomUUID(),
        name: "Watsons",
        address: "Siam Paragon, B1 Floor, 991 Rama I Rd",
        latitude: "13.7460",
        longitude: "100.5352",
        country: "Thailand",
        city: "Bangkok",
        phoneNumber: "+66-2-610-8000",
        openingHours: "10:00 AM - 10:00 PM"
      },
      {
        id: randomUUID(),
        name: "Fascino Pharmacy",
        address: "Terminal 21, 2nd Floor, 88 Sukhumvit Soi 19",
        latitude: "13.7308",
        longitude: "100.5609",
        country: "Thailand",
        city: "Bangkok",
        phoneNumber: "+66-2-108-0888",
        openingHours: "10:00 AM - 10:00 PM"
      }
    ];
    const jakartaPharmacies = [
      {
        id: randomUUID(),
        name: "Alfamart",
        address: "Jakarta, Indonesia",
        latitude: "-6.2088",
        longitude: "106.8456",
        country: "Indonesia",
        city: "Jakarta",
        phoneNumber: "+62-21-12345678",
        openingHours: "24/7"
      },
      {
        id: randomUUID(),
        name: "Indomaret",
        address: "Jakarta, Indonesia",
        latitude: "-6.2088",
        longitude: "106.8456",
        country: "Indonesia",
        city: "Jakarta",
        phoneNumber: "+62-21-87654321",
        openingHours: "6:00 AM - 10:00 PM"
      },
      {
        id: randomUUID(),
        name: "Guardian",
        address: "Jakarta, Indonesia",
        latitude: "-6.2088",
        longitude: "106.8456",
        country: "Indonesia",
        city: "Jakarta",
        phoneNumber: "+62-21-11223344",
        openingHours: "8:00 AM - 9:00 PM"
      }
    ];
    const allPharmacies = [...samplePharmacies, ...jakartaPharmacies];
    allPharmacies.forEach((pharmacy) => {
      this.pharmacies.set(pharmacy.id, pharmacy);
    });
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = randomUUID();
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  async createChatSession(insertSession) {
    const id = randomUUID();
    const session = {
      ...insertSession,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.chatSessions.set(id, session);
    return session;
  }
  async getChatSession(id) {
    return this.chatSessions.get(id);
  }
  async getMedicines() {
    return Array.from(this.medicines.values());
  }
  async getMedicinesBySymptoms(symptoms) {
    const lowerSymptoms = symptoms.toLowerCase();
    return Array.from(this.medicines.values()).filter((medicine) => {
      if (lowerSymptoms.includes("headache") || lowerSymptoms.includes("pain")) {
        return medicine.name === "Paracetamol" || medicine.name === "Ibuprofen";
      }
      if (lowerSymptoms.includes("nausea") || lowerSymptoms.includes("vomit")) {
        return medicine.name === "Domperidone";
      }
      if (lowerSymptoms.includes("fever")) {
        return medicine.name === "Paracetamol" || medicine.name === "Ibuprofen";
      }
      return false;
    });
  }
  async getPharmacies() {
    return Array.from(this.pharmacies.values());
  }
  async getPharmaciesByCity(city) {
    return Array.from(this.pharmacies.values()).filter(
      (pharmacy) => pharmacy.city.toLowerCase() === city.toLowerCase()
    );
  }
};
var storage = new MemStorage();

// server/routes.ts
import OpenAI from "openai";
var openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "your-api-key-here"
});
async function registerRoutes(app2) {
  app2.post("/api/chat", async (req, res) => {
    try {
      const { symptoms, location } = req.body;
      if (!symptoms) {
        return res.status(400).json({ error: "Symptoms are required" });
      }
      const analysisResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a medical assistant AI helping travelers. Analyze symptoms and suggest over-the-counter treatments. Always include medical disclaimers. Respond in JSON format with: {
              "analysis": "symptom analysis",
              "severity": "low/medium/high",
              "recommendations": ["medicine1", "medicine2"],
              "disclaimer": "medical disclaimer text",
              "seekEmergencyCare": boolean
            }`
          },
          {
            role: "user",
            content: `Patient symptoms: ${symptoms}. Current location: ${location || "Unknown"}`
          }
        ],
        response_format: { type: "json_object" }
      });
      const analysis = JSON.parse(analysisResponse.choices[0].message.content || "{}");
      const medicines = await storage.getMedicinesBySymptoms(symptoms);
      const session = await storage.createChatSession({
        symptoms,
        location,
        recommendations: { ...analysis, medicines }
      });
      res.json({
        sessionId: session.id,
        analysis,
        medicines,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Chat API error:", error);
      res.status(500).json({ error: "Failed to analyze symptoms" });
    }
  });
  app2.get("/api/medicines", async (req, res) => {
    try {
      const { symptoms } = req.query;
      let medicines;
      if (symptoms) {
        medicines = await storage.getMedicinesBySymptoms(symptoms);
      } else {
        medicines = await storage.getMedicines();
      }
      res.json(medicines);
    } catch (error) {
      console.error("Medicines API error:", error);
      res.status(500).json({ error: "Failed to fetch medicines" });
    }
  });
  app2.get("/api/pharmacies", async (req, res) => {
    try {
      const { city } = req.query;
      if (!city) {
        return res.status(400).json({ error: "City parameter is required" });
      }
      const pharmacies = await storage.getPharmaciesByCity(city);
      res.json(pharmacies);
    } catch (error) {
      console.error("Pharmacies API error:", error);
      res.status(500).json({ error: "Failed to fetch pharmacies" });
    }
  });
  app2.get("/api/chat/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = await storage.getChatSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      console.error("Chat session API error:", error);
      res.status(500).json({ error: "Failed to fetch session" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  base: "/sealion-healthcare-poc/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
import { fileURLToPath as fileURLToPath2 } from "url";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = path2.dirname(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(__dirname2, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
import { fileURLToPath as fileURLToPath3 } from "url";
import path3 from "path";
var __filename3 = fileURLToPath3(import.meta.url);
var __dirname3 = path3.dirname(__filename3);
var staticPath = path3.join(__dirname3, "../client/dist");
var app = express2();
app.use(express2.static(staticPath));
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
