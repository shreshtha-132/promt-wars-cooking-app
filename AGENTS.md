# Project Architecture & Developer Hand-off Specification

**Project Name:** Cooking To-Do List
**Aesthetic Theme:** Cool Tech-Slate (Off-whites, Indigo accents, Slate grays, clean negative space, responsive design)
**Runtime Stack:** Full-Stack Node.js (Express + Vite + React 19 + TypeScript + Tailwind CSS v4)

---

## 1. File Architecture & Directory Mapping
The project is built as an interactive, fully integrated full-stack web application. The files are organized as follows:

```
├── .env.example               # Template for secrets (GEMINI_API_KEY, APP_URL)
├── .gitignore                 # Standard build and cache exclusions
├── index.html                 # Main HTML mount point
├── metadata.json              # Applet metadata (Name, description, capabilities)
├── package.json               # Scripts (tsx dev server, esbuild-bundled server for prod)
├── server.ts                  # Full-stack backend Express server with Gemini 3.5 API
├── tsconfig.json              # TypeScript compilation rules
├── vite.config.ts             # Vite bundler configuration (disables HMR in preview)
└── src/
    ├── main.tsx               # Client entry point
    ├── index.css              # Tailwind CSS imports
    ├── App.tsx                # Coordinates page state, loading intervals, and screens
    ├── types.ts               # Core shared TypeScript declarations
    └── components/
        ├── ScheduleSelector.tsx # User input screen (presets, budget slider, servings)
        ├── MealPlanDisplay.tsx  # Interactive collapsible recipes, calories, and instructions
        ├── TodoTimeline.tsx     # Chronological daily todo schedule with interactive checks
        ├── GroceryList.tsx      # Shopping checklist with filters and smart substitutions
        └── BudgetFeasibility.tsx# Feasibility gauge, comparison cards, and saving tips
```

---

## 2. Core Data Schemas (`/src/types.ts`)
The application operates on a strict, strongly-typed domain model to guarantee type-safety between the Express server's AI outputs and the React frontend.

```typescript
export interface Meal {
  type: 'breakfast' | 'lunch' | 'dinner';
  name: string;
  description: string;
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  calories: number;
  protein: number; // in grams
  carbs: number; // in grams
  fat: number; // in grams
  instructions: string[];
  keyIngredients: string[];
}

export interface ScheduleItem {
  time: string; // e.g., "08:00 AM"
  activity: string; // e.g., "Prep Breakfast"
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'general';
  duration: number; // in minutes
  details: string; // Actionable description
}

export interface GroceryItem {
  id: string;
  name: string;
  category: string; // e.g., "Produce", "Pantry", "Protein", "Dairy", "Grains"
  quantity: string; // e.g., "200g", "2 units"
  estimatedCost: number; // in USD
  substitution: string; // Alternative ingredient suggestion
}

export interface BudgetFeasibility {
  totalEstimatedCost: number;
  feasibilityScore: number; // 0 to 100
  verdict: string; // Summary analysis
  tips: string[]; // Saving suggestions
}

export interface CookingPlan {
  meals: Meal[];
  schedule: ScheduleItem[];
  groceryList: GroceryItem[];
  budgetFeasibility: BudgetFeasibility;
}

export interface UserPreferences {
  dayDescription: string;
  diet: 'anything' | 'vegetarian' | 'vegan' | 'keto' | 'gluten-free' | 'low-carb';
  budget: number; // Target budget in USD
  servings: number;
}
```

---

## 3. Server Endpoint Specifications (`/server.ts`)
The backend exposes a single API route that interfaces with Google Gemini.

### `POST /api/generate-plan`
* **Request Headers:** `Content-Type: application/json`
* **Request Payload Type:** `UserPreferences`
* **Response Payload Type:** `CookingPlan`
* **Underlying Model:** `gemini-3.5-flash` with a strict `application/json` schema constraint to guarantee structural alignment.
* **API Key Handling:** The SDK is initialized lazily using the `GEMINI_API_KEY` system environment variable to prevent application start crashes in environments where keys are not yet bound.

---

## 4. UI Styles & Design Systems
* **Framework:** Tailwind CSS (configured using modern CSS `@import "tailwindcss";` specs).
* **Typography:** `Inter` for general reading, clean, high-contrast, robust letter spacing.
* **Icons:** Powered entirely by `lucide-react`. No custom inline SVGs are used.
* **Micro-Animations:** Implemented using `motion/react` (e.g., page-level transitions, loading state staggers, collapsible accordion expand/collapse).
* **Visual Hierarchy:** Centered around an off-white workspace (`#F8FAFC`) with deep slate headers (`#0F172A`) and sharp modern interactive elements colored in elegant Indigo (`#4F46E5`).

---

## 5. Local Agent/Developer Instructions

To run, develop, and test this project locally, execute the following steps:

### Setup & Local Execution
1. **Clone & Unzip:** Ensure the codebase is extracted to a clean directory.
2. **Install Dependencies:**
   ```bash
   npm install
   ```
3. **Environment Variables:** Create a `.env` file in the root folder based on `.env.example`:
   ```env
   GEMINI_API_KEY="your_actual_google_gemini_api_key"
   APP_URL="http://localhost:3000"
   ```
4. **Boot Development Server:**
   ```bash
   npm run dev
   ```
   *Note: This starts the Express server (`server.ts`) via `tsx` on port 3000, mounting the Vite development middleware for real-time asset compilation.*

### Testing & Compilation
* **Run Linter (TypeScript Verification):**
  ```bash
  npm run lint
  ```
* **Build for Production:**
  ```bash
  npm run build
  ```
  *This compiles the React assets into the `/dist` directory and bundles the Express `server.ts` server into a single, optimized CJS file (`/dist/server.cjs`) using esbuild to guarantee runtime fast-boots.*
* **Start Production Server:**
  ```bash
  npm run start
  ```
