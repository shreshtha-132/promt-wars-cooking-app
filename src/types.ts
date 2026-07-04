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
  details: string; // Actionable step
}

export interface GroceryItem {
  id: string;
  name: string;
  category: string; // e.g., "Produce", "Pantry", "Protein", "Dairy", "Grains", "Bakery"
  quantity: string; // e.g., "200g", "2 units"
  estimatedCost: number; // in INR
  substitution: string; // Suggested substitution if unavailable
}

export interface BudgetFeasibility {
  totalEstimatedCost: number;
  feasibilityScore: number; // 0 to 100
  verdict: string; // Summary of why it's feasible or not
  tips: string[]; // List of ways to save money or optimize
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
  budget: number; // Target budget in INR
  servings: number;
}
