import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChefHat, Sparkles, RefreshCw, AlertCircle, ArrowLeft, BookOpen, Clock, Play } from 'lucide-react';
import { ScheduleSelector } from './components/ScheduleSelector';
import { MealPlanDisplay } from './components/MealPlanDisplay';
import { TodoTimeline } from './components/TodoTimeline';
import { GroceryList } from './components/GroceryList';
import { BudgetFeasibility } from './components/BudgetFeasibility';
import { CookingPlan, UserPreferences } from './types';

// Delightful tips displayed during AI generation loading states
const LOADING_CHEF_TIPS = [
  "Sharpening the chef's knife for clean cuts...",
  "Browsing the virtual pantry for seasonal ingredients...",
  "Consulting the nutrition ledger for balanced macros...",
  "Drafting a timestamped active cooking timeline...",
  "Calculating realistic grocery store item costs...",
  "Swapping out expensive items to fit your budget constraint...",
  "Writing smart ingredient alternatives for unavailable items...",
  "Balancing prep-ahead steps to fit your busy schedule blocks..."
];

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cookingPlan, setCookingPlan] = useState<CookingPlan | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loadingTipIndex, setLoadingTipIndex] = useState(0);

  // Stagger loading tips during AI generation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingTipIndex((prev) => (prev + 1) % LOADING_CHEF_TIPS.length);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleGeneratePlan = async (prefs: UserPreferences) => {
    setIsLoading(true);
    setError(null);
    setPreferences(prefs);
    setLoadingTipIndex(0);

    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prefs),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Server error occurred while crafting plan.');
      }

      const data = await response.json();
      setCookingPlan(data);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to connect to the culinary engine. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCookingPlan(null);
    setPreferences(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans antialiased pb-20">
      {/* Decorative ambient top bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-12 space-y-8">
        {/* Elegant Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600 rounded-2xl shadow-indigo-600/15 shadow-lg text-white" id="app-logo-box">
              <ChefHat className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900" id="main-title">
                Cooking To-Do List
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Your AI-Powered Daily Kitchen Planner & Interactive Schedule Coordinator
              </p>
            </div>
          </div>

          {cookingPlan && (
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-all border border-slate-200/50"
              id="start-over-btn"
            >
              <ArrowLeft className="w-4 h-4" />
              Adjust Schedule & Preferences
            </button>
          )}
        </header>

        {/* Global error message */}
        {error && (
          <div className="bg-rose-50 border border-rose-200/50 rounded-2xl p-4 flex items-start gap-3 text-rose-800 text-sm shadow-sm" id="global-error-box">
            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold block">Culinary Engine Interrupted</span>
              <p>{error}</p>
              <button
                onClick={() => handleGeneratePlan(preferences!)}
                className="mt-2 text-xs font-semibold underline text-rose-900 hover:text-rose-950 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Retry Generation
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Screens */}
        <AnimatePresence mode="wait">
          {/* SCREEN 1: Input state (Form) */}
          {!cookingPlan && !isLoading && (
            <motion.div
              key="input-screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <ScheduleSelector onGenerate={handleGeneratePlan} isLoading={isLoading} />
            </motion.div>
          )}

          {/* SCREEN 2: Loading State */}
          {isLoading && (
            <motion.div
              key="loading-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-6"
              id="loading-container"
            >
              <div className="relative">
                <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
                  <ChefHat className="w-8 h-8 animate-pulse" />
                </div>
              </div>

              <div className="space-y-2 max-w-md">
                <h3 className="text-lg font-bold text-slate-800">Drafting Your Cooking Masterplan</h3>
                <p className="text-sm text-slate-500">
                  Our advanced AI chef is analyzing your constraints to maximize health, respect budget limits, and eliminate prep stress.
                </p>
              </div>

              {/* Animated Rotating Cooking Tips */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={loadingTipIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-4 py-3 rounded-xl border border-indigo-100 max-w-sm"
                >
                  Chef's Activity: {LOADING_CHEF_TIPS[loadingTipIndex]}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}

          {/* SCREEN 3: Display Results Dashboard */}
          {cookingPlan && !isLoading && (
            <motion.div
              key="results-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
              id="cooking-plan-results"
            >
              {/* Day Constraint Context Banner */}
              <div className="bg-indigo-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl relative overflow-hidden" id="plan-banner">
                <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-800/40 rounded-full blur-2xl" />
                <div className="space-y-2 relative z-10">
                  <span className="inline-flex items-center gap-1 text-xs font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-500/40 px-3 py-1 rounded-full">
                    <Sparkles className="w-3 h-3" /> Custom AI Masterplan Generated
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Today's Cooking Blueprint</h2>
                  <p className="text-sm text-indigo-200 max-w-2xl leading-relaxed">
                    Custom-fit to your day: <span className="italic text-white">"{preferences?.dayDescription}"</span>
                  </p>
                </div>

                <div className="flex flex-wrap gap-4 relative z-10">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2.5 border border-white/10">
                    <span className="text-[10px] uppercase font-bold text-indigo-300 block">Diet Limit</span>
                    <span className="text-sm font-bold capitalize">{preferences?.diet === 'anything' ? 'Anything' : preferences?.diet}</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2.5 border border-white/10">
                    <span className="text-[10px] uppercase font-bold text-indigo-300 block">Daily Budget</span>
                    <span className="text-sm font-bold">₹{preferences?.budget} INR</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2.5 border border-white/10">
                    <span className="text-[10px] uppercase font-bold text-indigo-300 block">Servings</span>
                    <span className="text-sm font-bold">{preferences?.servings} {preferences?.servings === 1 ? 'Person' : 'People'}</span>
                  </div>
                </div>
              </div>

              {/* Main Dashboard Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Side: Recipes & Meal Plan */}
                <div className="lg:col-span-7 space-y-8">
                  <MealPlanDisplay meals={cookingPlan.meals} />
                  <BudgetFeasibility feasibility={cookingPlan.budgetFeasibility} targetBudget={preferences?.budget || 25} />
                </div>

                {/* Right Side: Timeline & Grocery checklist */}
                <div className="lg:col-span-5 space-y-8">
                  <TodoTimeline schedule={cookingPlan.schedule} />
                  <GroceryList items={cookingPlan.groceryList} />
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-center pt-4">
                <button
                  onClick={handleReset}
                  className="px-6 py-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-2xl shadow-sm transition-all flex items-center gap-2 text-sm"
                  id="bottom-back-btn"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Create Another Cooking To-Do List
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
