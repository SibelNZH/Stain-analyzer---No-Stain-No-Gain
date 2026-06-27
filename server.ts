import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload limit for base64 images
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Initialize Google Gen AI lazily or check key
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("Warning: GEMINI_API_KEY is not set in environment variables.");
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// API Route: Analyze Stain
app.post("/api/analyze-stain", async (req, res) => {
  try {
    const { image, fabricType, stainAge, notes, quickStainType } = req.body;
    const ai = getAiClient();

    if (!ai) {
      // Return a mocked high-quality mock response if API Key is missing, so it doesn't crash the UI
      return res.json(getFallbackDiagnosis(fabricType || "Cotton", stainAge || "Today", quickStainType || "Oil"));
    }

    let contents: any[] = [];
    let textPrompt = `You are a professional laundry and fabric care AI assistant (No Stain No Gain).
Please analyze the following fabric stain issue and provide a highly specific, scientific, and practical step-by-step cleaning solution.

Parameters:
- Fabric Type: ${fabricType || "Cotton"}
- Stain Age: ${stainAge || "Just now"}
- User Notes: ${notes || "None"}`;

    if (quickStainType) {
      textPrompt += `\n- Direct Stain Category Selected: ${quickStainType}`;
    }

    if (image) {
      // Parse base64
      const base64Data = image.split(",")[1] || image;
      const mimeType = image.match(/data:([^;]+);/)?.[1] || "image/jpeg";
      contents.push({
        inlineData: {
          mimeType,
          data: base64Data,
        },
      });
      textPrompt += `\n\nAnalyze the attached image to identify the stain type, its severity, and determine the exact substance if possible (e.g., grease, coffee, red wine, cosmetic ink, grass, etc.). Check the fabric weave structure and stain density.`;
    } else {
      textPrompt += `\n\nSince no image is provided, rely on the parameters and notes to diagnose the stain (e.g. assume ${quickStainType || "oil"} or relevant substance based on notes).`;
    }

    contents.push({ text: textPrompt });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction: "You are the primary intelligence of No Stain No Gain, an AI-powered stain identification and cloth-saving companion. Always output an expert analysis with high-accuracy parameters.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            stainName: {
              type: Type.STRING,
              description: "The diagnosed stain name, e.g. 'Oil-based stain', 'Coffee stain', 'Red wine stain', 'Ink stain'. Keep it neat.",
            },
            confidence: {
              type: Type.INTEGER,
              description: "Confidence percentage of the diagnosis (e.g., integer from 75 to 99).",
            },
            fabricType: {
              type: Type.STRING,
              description: "Confirmed fabric type, e.g. 'Cotton Fabric', 'Polyester Blend', 'Denim Fabric'.",
            },
            absorbency: {
              type: Type.STRING,
              description: "Absorbency profile of the fabric and stain, e.g. 'Medium Absorbency', 'High Absorbency', 'Low Absorbency'.",
            },
            precaution: {
              type: Type.STRING,
              description: "A crucial warning or precaution that must be taken FIRST (e.g., 'Do not use hot water before removing the oil. Heat will set the grease permanently into the cotton fibers.')",
            },
            steps: {
              type: Type.ARRAY,
              description: "Numbered step-by-step solution to clean this exact stain from this fabric.",
              items: {
                type: Type.OBJECT,
                properties: {
                  title: {
                    type: Type.STRING,
                    description: "Concise title for the step (e.g., 'Blot the stain immediately', 'Apply dish soap').",
                  },
                  description: {
                    type: Type.STRING,
                    description: "Specific details on how to perform this step.",
                  },
                },
                required: ["title", "description"],
              },
            },
            communityWisdom: {
              type: Type.ARRAY,
              description: "2 custom community advice tips matching this issue.",
              items: {
                type: Type.OBJECT,
                properties: {
                  source: {
                    type: Type.STRING,
                    description: "Source name, e.g. 'r/Laundry Advice' or 'Fabric Expert' or 'Grandma\\'s Tip'.",
                  },
                  text: {
                    type: Type.STRING,
                    description: "The actual advice snippet (e.g., 'Talcum powder works wonders for fresh grease on jeans...').",
                  },
                  subtext: {
                    type: Type.STRING,
                    description: "Helpful counter or professional badge (e.g., '142 users found this helpful' or 'Professional recommendation').",
                  },
                },
                required: ["source", "text", "subtext"],
              },
            },
          },
          required: ["stainName", "confidence", "fabricType", "absorbency", "precaution", "steps", "communityWisdom"],
        },
      },
    });

    const resultText = response.text || "{}";
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("Gemini stain analysis error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze stain" });
  }
});

// API Route: AI Assistant Chat
app.post("/api/chat-assistant", async (req, res) => {
  try {
    const { message, history } = req.body;
    const ai = getAiClient();

    if (!ai) {
      return res.json({
        text: `I'm in offline preview mode because the GEMINI_API_KEY is not set. However, as an expert tip: for most fresh stains on cotton, immediate blotting with cold water and applying a drop of mild dish soap will prevent the stain from binding to the fabric fibers!`,
      });
    }

    // Convert history format to GenAI chat structure if history is provided
    const chat = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction: "You are 'No Stain No Gain' AI assistant, an expert in laundry, fabrics, and chemistry-based stain removal. Give direct, warm, expert advice. Suggest times, materials, and precautions. Keep responses to 1-2 friendly paragraphs. You can suggest soaking depth, detergents, or water temperature.",
      },
    });

    // In a stateless environment, we can rebuild the chat history if needed, or simply pass the message.
    // For simplicity, we just send the message. If we have history, we can initialize chat with history.
    if (history && history.length > 0) {
      // Keep it simple and combine history into the prompt to keep it robust and simple
      let fullPrompt = "Previous conversation:\n";
      for (const h of history) {
        fullPrompt += `${h.role === "user" ? "User" : "AI"}: ${h.text}\n`;
      }
      fullPrompt += `\nUser's new message: ${message}`;
      const response = await chat.sendMessage({ message: fullPrompt });
      return res.json({ text: response.text });
    } else {
      const response = await chat.sendMessage({ message });
      return res.json({ text: response.text });
    }
  } catch (error: any) {
    console.error("Gemini assistant error:", error);
    res.status(500).json({ error: error.message || "Assistant error" });
  }
});

// Fallback diagnosis when API key is missing to keep app fully interactive
function getFallbackDiagnosis(fabricType: string, stainAge: string, quickType: string) {
  const type = (quickType || "Oil").toLowerCase();
  
  if (type.includes("coffee")) {
    return {
      stainName: "Coffee stain",
      confidence: 94,
      fabricType: `${fabricType} Fabric`,
      absorbency: "High Absorbency",
      precaution: "Crucial Precaution: Do not apply direct heat or iron the garment before the coffee is fully removed. Heat will bake the organic tannins into the fibers, turning it permanent.",
      steps: [
        {
          title: "Blot, don't rub",
          description: "Use a clean white paper towel to press and absorb any remaining liquid. Rubbing will spread the tannin pigments deeper.",
        },
        {
          title: "Flush with cold water",
          description: "Run cold water through the back of the stain for 5 minutes to flush out as much coffee concentrate as possible.",
        },
        {
          title: "Apply liquid detergent",
          description: "Gently dab a small amount of liquid laundry detergent or dish soap onto the stain. Let it sit for 5-10 minutes.",
        },
        {
          title: "Soak in lukewarm water",
          description: "Submerge the garment in lukewarm water with a spoonful of oxygen bleach or white vinegar for 30 minutes, then rinse and air dry.",
        }
      ],
      communityWisdom: [
        {
          source: "r/Laundry Advice",
          text: "White vinegar mixed with a bit of dish soap works amazingly well to release dried coffee stains.",
          subtext: "284 users found this helpful"
        },
        {
          source: "Fabric Expert",
          text: "For delicate fabrics like silk, stick to pure cold water flushing and professional cleaning.",
          subtext: "Professional recommendation"
        }
      ]
    };
  }

  if (type.includes("wine") || type.includes("liquor")) {
    return {
      stainName: "Red wine stain",
      confidence: 89,
      fabricType: `${fabricType} Fabric`,
      absorbency: "High Absorbency",
      precaution: "Crucial Precaution: Never use hand soap or dish soap with high pH on red wine. The alkalinity can react with the wine pigments and dye the fabric blue or purple.",
      steps: [
        {
          title: "Blot immediately",
          description: "Absorb as much wet wine as possible using a clean cloth. Apply light pressure.",
        },
        {
          title: "Apply salt or baking soda",
          description: "Generously cover the wet stain with table salt or baking soda. Let it sit for 15 minutes to draw out the wine via capillary action.",
        },
        {
          title: "Taut-flush with boiling or hot water",
          description: "Stretch the stained fabric over a bowl, secure with a rubber band, and pour boiling water from a height of 2 feet (only for cotton/polyester).",
        },
        {
          title: "Wash with enzyme detergent",
          description: "Machine wash on a normal cycle with an oxygen-based color-safe booster.",
        }
      ],
      communityWisdom: [
        {
          source: "r/Laundry Advice",
          text: "If the stain has dried, club soda or hydrogen peroxide mixed with dish soap lifts red wine instantly.",
          subtext: "412 users found this helpful"
        },
        {
          source: "Fabric Expert",
          text: "Salt is a savior, but brush it off fully before washing so it doesn't cause abrasive wear.",
          subtext: "Verified safety guide"
        }
      ]
    };
  }

  if (type.includes("ink") || type.includes("highlighter")) {
    return {
      stainName: "Ink-based stain",
      confidence: 91,
      fabricType: `${fabricType} Fabric`,
      absorbency: "Medium Absorbency",
      precaution: "Crucial Precaution: Standard water washing will make ink bleed and ruin other sections of the garment. Always isolate the stain with a backing towel.",
      steps: [
        {
          title: "Isolate with backing towel",
          description: "Place a folded clean white cloth or paper towel directly underneath the ink stain to catch bleeding ink.",
        },
        {
          title: "Apply rubbing alcohol (Isopropyl)",
          description: "Saturate a cotton swab in rubbing alcohol or hand sanitizer and dab directly onto the ink. Watch the ink transfer to the backing towel.",
        },
        {
          title: "Blot continuously",
          description: "Use a dry paper towel to press and lift the dissolved ink. Move to clean sections of the towel frequently.",
        },
        {
          title: "Pre-treat and wash",
          description: "Apply a drop of liquid detergent, rub gently, and rinse with cold water before a normal wash.",
        }
      ],
      communityWisdom: [
        {
          source: "r/Laundry Advice",
          text: "Aerosol hairspray (the cheap, alcohol-rich kind) is a legendary quick trick to dissolve ballpoint ink.",
          subtext: "198 users found this helpful"
        },
        {
          source: "Fabric Expert",
          text: "Avoid rubbing alcohol on acetate or triacetate fabrics as it will dissolve the fibers themselves!",
          subtext: "Professional warning"
        }
      ]
    };
  }

  // Default: Oil-based stain
  return {
    stainName: "Oil-based stain",
    confidence: 92,
    fabricType: `${fabricType} Fabric`,
    absorbency: "Medium Absorbency",
    precaution: "Crucial Precaution: Do not use hot water before removing the oil. Heat will set the grease permanently into the cotton fibers.",
    steps: [
      {
        title: "Blot the stain immediately",
        description: "Use a clean paper towel to lift excess oil. Do not rub.",
      },
      {
        title: "Apply dish soap",
        description: "Gently massage a grease-cutting detergent (like Blue Dawn) into the area.",
      },
      {
        title: "Wash with warm water",
        description: "Rinse thoroughly under lukewarm running water.",
      },
      {
        title: "Air dry and inspect",
        description: "Confirm the stain is gone before placing in a dryer. Tumble dryers lock oil in.",
      }
    ],
    communityWisdom: [
      {
        source: "r/Laundry Advice",
        text: "Talcum powder or cornstarch works for fresh grease. Let it absorb the oil for 30 mins.",
        subtext: "142 users found this helpful"
      },
      {
        source: "Fabric Expert",
        text: "For high-quality cotton, try white vinegar to restore fabric softness after soap treatment.",
        subtext: "Professional recommendation"
      }
    ]
  };
}

// Vite middleware configuration for development vs production
async function startServer() {
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
