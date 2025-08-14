import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";
import { insertChatSessionSchema } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "your-api-key-here"
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Chat endpoint for medical consultation
  app.post("/api/chat", async (req, res) => {
    try {
      const { symptoms, location } = req.body;
      
      if (!symptoms) {
        return res.status(400).json({ error: "Symptoms are required" });
      }

      // Get AI analysis of symptoms
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
            content: `Patient symptoms: ${symptoms}. Current location: ${location || 'Unknown'}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const analysis = JSON.parse(analysisResponse.choices[0].message.content || "{}");
      
      // Get local medicines based on symptoms
      const medicines = await storage.getMedicinesBySymptoms(symptoms);
      
      // Create chat session
      const session = await storage.createChatSession({
        symptoms,
        location,
        recommendations: { ...analysis, medicines }
      });

      res.json({
        sessionId: session.id,
        analysis: analysis,
        medicines: medicines,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Chat API error:', error);
      res.status(500).json({ error: "Failed to analyze symptoms" });
    }
  });

  // Get medicines endpoint
  app.get("/api/medicines", async (req, res) => {
    try {
      const { symptoms } = req.query;
      
      let medicines;
      if (symptoms) {
        medicines = await storage.getMedicinesBySymptoms(symptoms as string);
      } else {
        medicines = await storage.getMedicines();
      }
      
      res.json(medicines);
    } catch (error) {
      console.error('Medicines API error:', error);
      res.status(500).json({ error: "Failed to fetch medicines" });
    }
  });

  // Get pharmacies endpoint
  app.get("/api/pharmacies", async (req, res) => {
    try {
      const { city } = req.query;
      
      console.log('City parameter:', city);

      if (!city) {
        return res.status(400).json({ error: "City parameter is required" });
      }
      
      const pharmacies = await storage.getPharmaciesByCity(city as string);
      res.json(pharmacies);
    } catch (error) {
      console.error('Pharmacies API error:', error);
      res.status(500).json({ error: "Failed to fetch pharmacies" });
    }
  });

  // Get chat session
  app.get("/api/chat/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = await storage.getChatSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      
      res.json(session);
    } catch (error) {
      console.error('Chat session API error:', error);
      res.status(500).json({ error: "Failed to fetch session" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
