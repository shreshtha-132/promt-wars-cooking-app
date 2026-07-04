import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, CheckSquare, Square, RefreshCw, Sparkles, Filter } from 'lucide-react';
import { GroceryItem } from '../types';

interface GroceryListProps {
  items: GroceryItem[];
}

export const GroceryList: React.FC<GroceryListProps> = ({ items }) => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [showSubstitutions, setShowSubstitutions] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const toggleCheck = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSubstitution = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowSubstitutions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Group items by category
  const categories = ['All', ...Array.from(new Set(items.map(item => item.category)))];

  const filteredItems = activeCategory === 'All'
    ? items
    : items.filter(item => item.category === activeCategory);

  const completedCount = items.filter(item => checkedItems[item.id]).length;
  const totalCost = items.reduce((sum, item) => sum + (checkedItems[item.id] ? 0 : item.estimatedCost), 0);
  const fullCost = items.reduce((sum, item) => sum + item.estimatedCost, 0);

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'produce': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'protein': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'dairy': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'grains': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'pantry': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8" id="grocery-list-section">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-6 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-indigo-600" />
            Interactive Grocery Checklist
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Check off items you already have. Swap unavailable items using the Smart Substitution recommender.
          </p>
        </div>

        {/* Cost and Completion Summary Card */}
        <div className="flex items-center gap-6 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Checked Items</span>
            <span className="text-sm font-bold text-slate-800">{completedCount} of {items.length}</span>
          </div>
          <div className="w-px bg-slate-200 h-8" />
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Shopping Est.</span>
            <span className="text-sm font-bold text-indigo-600">₹{totalCost.toFixed(2)}</span>
            <span className="text-[10px] text-slate-400 block">of ₹{fullCost.toFixed(2)} total</span>
          </div>
        </div>
      </div>

      {/* Categories Filter Pills */}
      <div className="flex flex-wrap gap-1.5 mb-6" id="grocery-categories-filter">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              activeCategory === cat
                ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grocery Items list */}
      <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
        {filteredItems.map((item) => {
          const isChecked = !!checkedItems[item.id];
          const isSubVisible = !!showSubstitutions[item.id];

          return (
            <div
              key={item.id}
              onClick={(e) => toggleCheck(item.id, e)}
              className={`flex flex-col p-4 transition-all cursor-pointer ${
                isChecked ? 'bg-slate-50/70 text-slate-400' : 'bg-white hover:bg-slate-50/50'
              }`}
              id={`grocery-item-${item.id}`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 hover:text-indigo-600 transition-colors">
                    {isChecked ? (
                      <CheckSquare className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </span>

                  <div>
                    <span className={`text-xs font-semibold border px-2 py-0.5 rounded-full mr-2 inline-block ${
                      getCategoryColor(item.category)
                    }`}>
                      {item.category}
                    </span>
                    <span className={`text-sm font-bold ${isChecked ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {item.name}
                    </span>
                    <span className="text-xs text-slate-500 ml-2">({item.quantity})</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-xs font-mono font-bold ${isChecked ? 'text-slate-400' : 'text-slate-700'}`}>
                    ₹{item.estimatedCost.toFixed(2)}
                  </span>
                  
                  {item.substitution && (
                    <button
                      type="button"
                      onClick={(e) => toggleSubstitution(item.id, e)}
                      className={`p-1.5 rounded-lg border transition-all ${
                        isSubVisible
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                          : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                      title="Show substitution"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Substitution collapse drawer */}
              <AnimatePresence>
                {isSubVisible && item.substitution && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 ml-8 p-3 bg-indigo-50/50 border border-indigo-100/50 rounded-xl flex items-start gap-2.5 text-xs text-indigo-800">
                      <Sparkles className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">Smart Substitution Alternative</span>
                        <p className="mt-0.5 leading-relaxed text-indigo-600">{item.substitution}</p>
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
