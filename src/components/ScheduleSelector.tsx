import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, DollarSign, Users, Sparkles, ChefHat, Dumbbell, Coffee, Heart } from 'lucide-react';
import { UserPreferences } from '../types';

interface ScheduleSelectorProps {
  onGenerate: (prefs: UserPreferences) => void;
  isLoading: boolean;
}

const PRESETS = [
  {
    name: 'Workday Rush',
    description: 'Quick breakfast/lunch, easy hands-off dinner',
    dayDescription: 'Busy day of meetings 9 AM - 6 PM. Only have 15 mins for breakfast, 20 mins for lunch, and want a simple 30 min dinner after a tiring workday.',
    diet: 'anything' as const,
    budget: 800,
    servings: 1,
    icon: Coffee,
    color: 'border-amber-500/30 text-amber-500 bg-amber-500/5 hover:bg-amber-500/10'
  },
  {
    name: 'Cozy Sunday',
    description: 'Leisurely brunch, slow-cooked comforting meal',
    dayDescription: 'A completely relaxing Sunday at home. I want to spend some quality time cooking a delicious warm lunch and a comforting slow-cooked dinner for the family.',
    diet: 'anything' as const,
    budget: 1500,
    servings: 4,
    icon: ChefHat,
    color: 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10'
  },
  {
    name: 'Post-Workout Fuel',
    description: 'High-protein diet to power through leg day',
    dayDescription: 'Going to the gym for a heavy lifting session at 5 PM. Need muscle recovery meals: high protein, low sugar, nutrient-dense breakfast, lunch, and dinner.',
    diet: 'keto' as const,
    budget: 1000,
    servings: 1,
    icon: Dumbbell,
    color: 'border-blue-500/30 text-blue-500 bg-blue-500/5 hover:bg-blue-500/10'
  },
  {
    name: 'Budget Cleanse',
    description: 'Healthy, ultra-cheap plant-based day',
    dayDescription: 'Looking to save money and eat cleanly. Whole foods, fresh vegetables, minimal processed ingredients, keeping costs as absolute lowest as possible.',
    diet: 'vegan' as const,
    budget: 500,
    servings: 2,
    icon: Heart,
    color: 'border-rose-500/30 text-rose-500 bg-rose-500/5 hover:bg-rose-500/10'
  },
];

export const ScheduleSelector: React.FC<ScheduleSelectorProps> = ({ onGenerate, isLoading }) => {
  const [dayDescription, setDayDescription] = useState('');
  const [diet, setDiet] = useState<UserPreferences['diet']>('anything');
  const [budget, setBudget] = useState(1000);
  const [servings, setServings] = useState(2);

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setDayDescription(preset.dayDescription);
    setDiet(preset.diet);
    setBudget(preset.budget);
    setServings(preset.servings);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dayDescription.trim()) return;
    onGenerate({ dayDescription, diet, budget, servings });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden" id="schedule-selector-card">
      <div className="p-6 sm:p-8 bg-slate-50 border-b border-slate-100">
        <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-600" />
          Plan Your Culinary Day
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Tell us about your schedule, diet, and budget constraints, and our AI chef will curate a perfect day-long cooking blueprint.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
        {/* Presets Grid */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Quick Presets
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PRESETS.map((preset) => {
              const IconComp = preset.icon;
              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={`flex flex-col items-start text-left p-4 rounded-xl border border-slate-100 hover:border-slate-300 transition-all ${preset.color}`}
                  id={`preset-btn-${preset.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <IconComp className="w-4 h-4" />
                    <span className="font-semibold text-sm text-slate-800">{preset.name}</span>
                  </div>
                  <span className="text-xs text-slate-500 leading-normal">{preset.description}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Day Description */}
        <div className="space-y-2">
          <label htmlFor="dayDescription" className="text-sm font-semibold text-slate-700 flex items-center justify-between">
            <span>Describe Your Day & Cooking Constraints</span>
            <span className="text-xs text-slate-400 font-normal">Include schedules, leftovers, or appliances you want to use</span>
          </label>
          <div className="relative">
            <textarea
              id="dayDescription"
              rows={4}
              value={dayDescription}
              onChange={(e) => setDayDescription(e.target.value)}
              placeholder="e.g., I am working from home, have a very busy morning with Zoom calls but a completely free afternoon. I want a 10-minute high protein breakfast, and have some leftover chicken breast I want to use for lunch..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
              required
            />
          </div>
        </div>

        {/* Preferences Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Diet Selection */}
          <div className="space-y-2">
            <label htmlFor="diet-select" className="text-sm font-semibold text-slate-700 block">
              Dietary Preference
            </label>
            <select
              id="diet-select"
              value={diet}
              onChange={(e) => setDiet(e.target.value as UserPreferences['diet'])}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
            >
              <option value="anything">Anything / Standard</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="keto">Keto (Low Carb, High Fat)</option>
              <option value="gluten-free">Gluten-Free</option>
              <option value="low-carb">Low-Carb</option>
            </select>
          </div>

          {/* Budget Limit Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="budget-input" className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-slate-400" />
                Target Daily Budget
              </label>
              <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">₹{budget} INR</span>
            </div>
            <div className="flex items-center gap-3 py-1">
              <input
                id="budget-input"
                type="range"
                min="100"
                max="5000"
                step="100"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>₹100 (Budget-friendly)</span>
              <span>₹5000 (Premium)</span>
            </div>
          </div>

          {/* Servings Counter */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-slate-400" />
              Servings Count
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setServings(Math.max(1, servings - 1))}
                className="w-12 h-11 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300 rounded-xl font-bold flex items-center justify-center transition-all"
                id="servings-decrement-btn"
              >
                -
              </button>
              <div className="flex-1 text-center bg-slate-100 border border-slate-200 py-2.5 rounded-xl text-slate-800 font-bold text-sm">
                {servings} {servings === 1 ? 'Person' : 'People'}
              </div>
              <button
                type="button"
                onClick={() => setServings(servings + 1)}
                className="w-12 h-11 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300 rounded-xl font-bold flex items-center justify-center transition-all"
                id="servings-increment-btn"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <button
          type="submit"
          disabled={isLoading || !dayDescription.trim()}
          className={`w-full py-4 px-6 rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-sm transition-all ${
            isLoading || !dayDescription.trim()
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-100'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.98]'
          }`}
          id="generate-plan-submit-btn"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              AI Chef is drafting your custom cooking plan...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-indigo-200" />
              Generate Cooking To-Do List
            </>
          )}
        </button>
      </form>
    </div>
  );
};
