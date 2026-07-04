import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client lazily to avoid crashes if GEMINI_API_KEY is missing during build/startup
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required. Please set it in Settings > Secrets.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// API endpoint for generating cooking to-do lists
app.post('/api/generate-plan', async (req, res) => {
  try {
    const { dayDescription, diet, budget, servings } = req.body;

    if (!dayDescription) {
      res.status(400).json({ error: 'Description of your day is required.' });
      return;
    }

    const ai = getAiClient();

    const prompt = `
      You are a world-class professional personal chef and expert meal planner.
      I need you to generate a fully customized daily cooking to-do list based on my day's description, dietary restrictions, target budget, and servings count.

      User Context:
      - Day's description/schedule: "${dayDescription}"
      - Dietary requirements: "${diet}"
      - Target budget: ₹${budget} INR for the whole day
      - Servings needed: ${servings} person/people

      Please create:
      1. A customized, practical 3-meal plan (Breakfast, Lunch, Dinner) tailored precisely to the time constraints and energy requirements of my day. IMPORTANT: The meals must be authentic Indian cuisine suitable for the Indian context.
      2. An actionable Cooking Schedule/To-Do List (timestamped blocks like "08:00 AM", "01:15 PM" matching my busy hours, specifying exactly what preparation, active cooking, and cleaning tasks to do, and how long they take). Make this logical and realistic!
      3. A Grocery Checklist with exact ingredient quantities, categorized correctly (Produce, Pantry, Protein, Dairy, etc.), realistic estimated grocery store costs (in INR) for each item, and smart ingredient substitutions in case any items are unavailable or need to be swapped for allergy/preference reasons.
      4. A Budget Feasibility report analyzing whether the ₹${budget} budget is sufficient for these ingredients at ${servings} serving(s), along with a feasibility score (0-100), a friendly and encouraging verdict, and practical, actionable tips to save money on this specific meal plan (e.g., buying in bulk, omitting optional spices, swapping out a protein, using pantry staples).

      Make sure all estimated costs in the grocery list sum up to the "totalEstimatedCost" in the budget feasibility object. Keep ingredient prices realistic for India in INR (e.g. garlic clover is ₹10, paneer for 2 is ₹150, spinach is ₹30).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        systemInstruction: `
          You are an expert chef, nutritionist, and budget meal planner. You output highly accurate, delicious, and budget-friendly meal plans with realistic grocery prices.
          Ensure all quantities and cooking times match the user's schedule constraints (e.g., if they are busy all day, breakfasts and lunches must be extremely quick or prep-ahead, and dinners must be straightforward or hands-off).
          You must output STRICT, valid JSON according to the schema provided.
        `,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            meals: {
              type: Type.ARRAY,
              description: 'List of exactly three meals: breakfast, lunch, and dinner.',
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ['breakfast', 'lunch', 'dinner'] },
                  name: { type: Type.STRING, description: 'Delicious name of the dish' },
                  description: { type: Type.STRING, description: 'Short description of why this is perfect for the user\'s day' },
                  prepTime: { type: Type.INTEGER, description: 'Preparation time in minutes' },
                  cookTime: { type: Type.INTEGER, description: 'Cooking time in minutes' },
                  calories: { type: Type.INTEGER, description: 'Estimated calories per serving' },
                  protein: { type: Type.INTEGER, description: 'Protein content in grams per serving' },
                  carbs: { type: Type.INTEGER, description: 'Carbs content in grams per serving' },
                  fat: { type: Type.INTEGER, description: 'Fat content in grams per serving' },
                  instructions: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Step-by-step clear, concise cooking instructions'
                  },
                  keyIngredients: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Important ingredients that are central to this dish'
                  }
                },
                required: ['type', 'name', 'description', 'prepTime', 'cookTime', 'calories', 'protein', 'carbs', 'fat', 'instructions', 'keyIngredients']
              }
            },
            schedule: {
              type: Type.ARRAY,
              description: 'Chronological timeline of the day\'s culinary workflow, preps, cooking times, and tidy-up sessions.',
              items: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.STRING, description: 'E.g., "07:30 AM" or "06:15 PM"' },
                  activity: { type: Type.STRING, description: 'Short task title (e.g., "Prep Quick Oatmeal", "Dinner Prep")' },
                  mealType: { type: Type.STRING, enum: ['breakfast', 'lunch', 'dinner', 'general'] },
                  duration: { type: Type.INTEGER, description: 'Duration of the activity in minutes' },
                  details: { type: Type.STRING, description: 'Detailed chef instruction for this time block' }
                },
                required: ['time', 'activity', 'mealType', 'duration', 'details']
              }
            },
            groceryList: {
              type: Type.ARRAY,
              description: 'Ingredients list categorized for easy shopping.',
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: 'A unique short id (e.g., "g1", "g2")' },
                  name: { type: Type.STRING, description: 'Name of the ingredient' },
                  category: { type: Type.STRING, description: 'Produce, Protein, Dairy, Pantry, Bakery, or Grains' },
                  quantity: { type: Type.STRING, description: 'Exact quantity needed (e.g. "2 cups", "500g", "1/2 head")' },
                  estimatedCost: { type: Type.NUMBER, description: 'Estimated cost in INR (e.g. 150)' },
                  substitution: { type: Type.STRING, description: 'Excellent common alternative' }
                },
                required: ['id', 'name', 'category', 'quantity', 'estimatedCost', 'substitution']
              }
            },
            budgetFeasibility: {
              type: Type.OBJECT,
              properties: {
                totalEstimatedCost: { type: Type.NUMBER, description: 'Sum of all grocery item estimatedCosts' },
                feasibilityScore: { type: Type.INTEGER, description: 'Value from 0 to 100 on how realistic/affordable this is' },
                verdict: { type: Type.STRING, description: 'Summary analysis comparing budget to total estimated costs' },
                tips: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Cost-saving tips specifically tailored to these recipes'
                }
              },
              required: ['totalEstimatedCost', 'feasibilityScore', 'verdict', 'tips']
            }
          },
          required: ['meals', 'schedule', 'groceryList', 'budgetFeasibility']
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error('Received empty response from Gemini API.');
    }

    const parsedPlan = JSON.parse(text.trim());
    res.json(parsedPlan);
  } catch (error: any) {
    console.error('Error generating cooking plan:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate plan. Please try again.' });
  }
});

// Configure Vite middleware in development or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
