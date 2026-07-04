import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';

const app = express();
app.use(express.json());

let aiClient = null;

function getAiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });
  }
  return aiClient;
}

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
          Ensure all quantities and cooking times match the user's schedule constraints.
          You must output STRICT, valid JSON according to the schema provided.
        `,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            meals: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ['breakfast', 'lunch', 'dinner'] },
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  prepTime: { type: Type.INTEGER },
                  cookTime: { type: Type.INTEGER },
                  calories: { type: Type.INTEGER },
                  protein: { type: Type.INTEGER },
                  carbs: { type: Type.INTEGER },
                  fat: { type: Type.INTEGER },
                  instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
                  keyIngredients: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['type', 'name', 'description', 'prepTime', 'cookTime', 'calories', 'protein', 'carbs', 'fat', 'instructions', 'keyIngredients']
              }
            },
            schedule: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.STRING },
                  activity: { type: Type.STRING },
                  mealType: { type: Type.STRING, enum: ['breakfast', 'lunch', 'dinner', 'general'] },
                  duration: { type: Type.INTEGER },
                  details: { type: Type.STRING }
                },
                required: ['time', 'activity', 'mealType', 'duration', 'details']
              }
            },
            groceryList: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  category: { type: Type.STRING },
                  quantity: { type: Type.STRING },
                  estimatedCost: { type: Type.NUMBER },
                  substitution: { type: Type.STRING }
                },
                required: ['id', 'name', 'category', 'quantity', 'estimatedCost', 'substitution']
              }
            },
            budgetFeasibility: {
              type: Type.OBJECT,
              properties: {
                totalEstimatedCost: { type: Type.NUMBER },
                feasibilityScore: { type: Type.INTEGER },
                verdict: { type: Type.STRING },
                tips: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ['totalEstimatedCost', 'feasibilityScore', 'verdict', 'tips']
            }
          },
          required: ['meals', 'schedule', 'groceryList', 'budgetFeasibility']
        }
      }
    });

    const text = response.text;
    const parsedPlan = JSON.parse(text.trim());
    res.json(parsedPlan);
  } catch (error) {
    console.error('Error generating cooking plan:', error);
    res.status(500).json({ error: error.message || 'Failed to generate plan.' });
  }
});

export default app;
