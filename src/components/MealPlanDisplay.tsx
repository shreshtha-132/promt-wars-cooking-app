import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, CheckSquare, Square, ChevronDown, ChevronUp, Flame, Dumbbell, Zap, Sparkles } from 'lucide-react';
import { Meal } from '../types';

interface MealPlanDisplayProps {
  meals: Meal[];
}

export const MealPlanDisplay: React.FC<MealPlanDisplayProps> = ({ meals }) => {
  const [expandedMeal, setExpandedMeal] = useState<string | null>('dinner'); // Default expand dinner
  // Keep track of instruction checkbox state: { [mealName_index]: boolean }
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  const toggleExpand = (mealType: string) => {
    setExpandedMeal(expandedMeal === mealType ? null : mealType);
  };

  const toggleStep = (mealName: string, stepIndex: number) => {
    const key = `${mealName}_${stepIndex}`;
    setCompletedSteps(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getMealTypeEmoji = (type: Meal['type']) => {
    switch (type) {
      case 'breakfast': return '🍳';
      case 'lunch': return '🥗';
      case 'dinner': return '🍽️';
    }
  };

  const getMealTypeLabel = (type: Meal['type']) => {
    switch (type) {
      case 'breakfast': return 'Breakfast';
      case 'lunch': return 'Lunch';
      case 'dinner': return 'Dinner';
    }
  };

  return (
    <div className="space-y-4" id="meal-plan-section">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <span>Meal Plan & Recipes</span>
        </h3>
        <span className="text-xs text-slate-500">Click a card to expand recipe & cooking steps</span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {meals.map((meal) => {
          const isExpanded = expandedMeal === meal.type;
          const totalSteps = meal.instructions.length;
          const completedCount = meal.instructions.filter((_, idx) => completedSteps[`${meal.name}_${idx}`]).length;
          const progressPercentage = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

          return (
            <div
              key={meal.type}
              className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all duration-300 ${
                isExpanded ? 'border-indigo-200 ring-4 ring-indigo-500/5' : 'border-slate-100 hover:border-slate-300'
              }`}
              id={`meal-card-${meal.type}`}
            >
              {/* Card Header (Clickable) */}
              <button
                type="button"
                onClick={() => toggleExpand(meal.type)}
                className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between p-5 text-left transition-colors hover:bg-slate-50"
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl p-2 bg-slate-50 rounded-xl" role="img" aria-label={meal.type}>
                    {getMealTypeEmoji(meal.type)}
                  </span>
                  <div>
                    <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 mb-1">
                      {getMealTypeLabel(meal.type)}
                    </span>
                    <h4 className="text-base font-bold text-slate-800 leading-tight">{meal.name}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1 sm:line-clamp-none">{meal.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 mt-4 sm:mt-0 pt-3 sm:pt-0 border-t border-slate-100 sm:border-0">
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {meal.prepTime + meal.cookTime} mins
                    </span>
                    <span className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      {meal.calories} kcal
                    </span>
                  </div>

                  {/* Circle progress or step bar */}
                  {totalSteps > 0 && (
                    <div className="hidden md:flex items-center gap-2">
                      <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full transition-all duration-300"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-emerald-600 w-10 text-right">
                        {completedCount}/{totalSteps}
                      </span>
                    </div>
                  )}

                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Recipe Body */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="px-5 pb-6 border-t border-slate-50 pt-5 space-y-6">
                      {/* Macros Metrics */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl">
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Calories</span>
                          <div className="flex items-center gap-1 text-slate-800 font-bold">
                            <Flame className="w-4 h-4 text-orange-500" />
                            <span>{meal.calories} kcal</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Protein</span>
                          <div className="flex items-center gap-1 text-slate-800 font-bold">
                            <Dumbbell className="w-4 h-4 text-sky-500" />
                            <span>{meal.protein}g</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Carbs</span>
                          <div className="flex items-center gap-1 text-slate-800 font-bold">
                            <Zap className="w-4 h-4 text-amber-500" />
                            <span>{meal.carbs}g</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Fat</span>
                          <div className="flex items-center gap-1 text-slate-800 font-bold">
                            <Sparkles className="w-4 h-4 text-indigo-500" />
                            <span>{meal.fat}g</span>
                          </div>
                        </div>
                      </div>

                      {/* Info & Ingredients Row */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1 space-y-3">
                          <h5 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Details</h5>
                          <div className="space-y-2 text-sm text-slate-600">
                            <div className="flex justify-between border-b border-slate-100 pb-1">
                              <span>Prep Time</span>
                              <span className="font-semibold text-slate-800">{meal.prepTime} mins</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 pb-1">
                              <span>Cook Time</span>
                              <span className="font-semibold text-slate-800">{meal.cookTime} mins</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Total Time</span>
                              <span className="font-semibold text-slate-800">{meal.prepTime + meal.cookTime} mins</span>
                            </div>
                          </div>
                        </div>

                        <div className="md:col-span-2 space-y-3">
                          <h5 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Key Ingredients</h5>
                          <div className="flex flex-wrap gap-2">
                            {meal.keyIngredients.map((ing) => (
                              <span
                                key={ing}
                                className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100"
                              >
                                {ing}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Instructions with checklist */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Step-by-Step Cooking Guide</h5>
                          <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            Progress: {progressPercentage}%
                          </span>
                        </div>
                        <ol className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                          {meal.instructions.map((step, index) => {
                            const isStepChecked = !!completedSteps[`${meal.name}_${index}`];
                            return (
                              <li
                                key={index}
                                onClick={() => toggleStep(meal.name, index)}
                                className={`flex items-start gap-4 p-4 cursor-pointer text-sm transition-all select-none ${
                                  isStepChecked ? 'bg-slate-50/70 text-slate-400' : 'bg-white hover:bg-slate-50 text-slate-700'
                                }`}
                                id={`step-item-${meal.type}-${index}`}
                              >
                                <span className="pt-0.5 text-slate-400 flex-shrink-0">
                                  {isStepChecked ? (
                                    <CheckSquare className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                                  ) : (
                                    <Square className="w-5 h-5" />
                                  )}
                                </span>
                                <div className="space-y-0.5">
                                  <span className={`text-[10px] font-bold ${isStepChecked ? 'text-slate-400' : 'text-indigo-600'}`}>
                                    Step {index + 1}
                                  </span>
                                  <p className={`leading-relaxed ${isStepChecked ? 'line-through' : ''}`}>
                                    {step}
                                  </p>
                                </div>
                              </li>
                            );
                          })}
                        </ol>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};
