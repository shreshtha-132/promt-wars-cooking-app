import React from 'react';
import { IndianRupee, AlertCircle, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';
import { BudgetFeasibility as BudgetFeasibilityType } from '../types';

interface BudgetFeasibilityProps {
  feasibility: BudgetFeasibilityType;
  targetBudget: number;
}

export const BudgetFeasibility: React.FC<BudgetFeasibilityProps> = ({ feasibility, targetBudget }) => {
  const { totalEstimatedCost, feasibilityScore, verdict, tips } = feasibility;
  const isOverBudget = totalEstimatedCost > targetBudget;
  const difference = Math.abs(totalEstimatedCost - targetBudget);

  // Score color determinations
  const getScoreColor = (score: number) => {
    if (score >= 80) return { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', fill: '#059669' };
    if (score >= 50) return { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', fill: '#d97706' };
    return { text: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', fill: '#dc2626' };
  };

  const colors = getScoreColor(feasibilityScore);

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6" id="budget-feasibility-section">
      <div>
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <IndianRupee className="w-5 h-5 text-indigo-600" />
          Budget Feasibility & Cost Assessment
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Detailed analysis comparing your target budget against estimated actual ingredient prices.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cost comparison card */}
        <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-2">Cost Comparison</span>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Target Budget:</span>
                <span className="font-bold text-slate-700">₹{targetBudget.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Estimated Cost:</span>
                <span className="font-bold text-slate-900">₹{totalEstimatedCost.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 mt-4 pt-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Status:</span>
            {isOverBudget ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
                <AlertCircle className="w-3.5 h-3.5" />
                Over by ₹{difference.toFixed(2)}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Under by ₹{difference.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Score Card */}
        <div className={`border p-5 rounded-2xl flex flex-col items-center justify-center text-center gap-3 ${colors.bg} ${colors.border}`}>
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Feasibility Score</span>
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-20 h-20 transform -rotate-90">
              <circle cx="40" cy="40" r="34" stroke="rgba(0,0,0,0.04)" strokeWidth="6" fill="transparent" />
              <circle cx="40" cy="40" r="34" stroke={colors.fill} strokeWidth="6" fill="transparent"
                strokeDasharray={`${2 * Math.PI * 34}`}
                strokeDashoffset={`${2 * Math.PI * 34 * (1 - feasibilityScore / 100)}`}
                className="transition-all duration-500"
              />
            </svg>
            <span className={`absolute text-2xl font-extrabold ${colors.text}`}>{feasibilityScore}</span>
          </div>
          <span className={`text-xs font-bold uppercase tracking-wider ${colors.text}`}>
            {feasibilityScore >= 80 ? 'Highly Feasible' : feasibilityScore >= 50 ? 'Moderate Feasibility' : 'Low Feasibility'}
          </span>
        </div>

        {/* Dynamic Verdict Text Card */}
        <div className="bg-indigo-50/30 border border-indigo-100/50 p-5 rounded-2xl flex flex-col justify-center">
          <span className="text-[10px] uppercase font-bold text-indigo-400 block tracking-wider mb-2">AI Chef Verdict</span>
          <p className="text-sm text-slate-700 leading-relaxed italic">
            "{verdict}"
          </p>
        </div>
      </div>

      {/* Cost-saving tips list */}
      {tips.length > 0 && (
        <div className="space-y-3 bg-slate-50 border border-slate-100 p-5 rounded-2xl">
          <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-slate-400" />
            Chef's Budget-Optimizing Advice
          </h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed bg-white border border-slate-100 p-3 rounded-xl">
                <ChevronRight className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
