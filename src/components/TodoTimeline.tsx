import React, { useState } from 'react';
import { Clock, CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import { ScheduleItem } from '../types';

interface TodoTimelineProps {
  schedule: ScheduleItem[];
}

export const TodoTimeline: React.FC<TodoTimelineProps> = ({ schedule }) => {
  // Checkbox states for each timeline item
  const [completedItems, setCompletedItems] = useState<Record<number, boolean>>({});

  const toggleItem = (index: number) => {
    setCompletedItems(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const completedCount = Object.values(completedItems).filter(Boolean).length;
  const progressPercent = schedule.length > 0 ? Math.round((completedCount / schedule.length) * 100) : 0;

  const getMealTypeBadge = (mealType: ScheduleItem['mealType']) => {
    switch (mealType) {
      case 'breakfast':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'lunch':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'dinner':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      default:
        return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8" id="todo-timeline-section">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-50 pb-6 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            Your Daily Culinary Schedule
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            An actionable, timestamped timeline integrated with your schedule. Check off items as you go!
          </p>
        </div>

        {/* Schedule progress card */}
        <div className="bg-indigo-50/50 border border-indigo-100/50 rounded-2xl px-4 py-3 flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Schedule Progress</span>
            <span className="text-sm font-bold text-indigo-700">{completedCount} of {schedule.length} done</span>
          </div>
          <div className="relative w-12 h-12 flex items-center justify-center">
            {/* Simple circular percentage */}
            <svg className="w-12 h-12 transform -rotate-90">
              <circle cx="24" cy="24" r="20" stroke="rgba(99, 102, 241, 0.1)" strokeWidth="4" fill="transparent" />
              <circle cx="24" cy="24" r="20" stroke="rgb(79, 70, 229)" strokeWidth="4" fill="transparent"
                strokeDasharray={`${2 * Math.PI * 20}`}
                strokeDashoffset={`${2 * Math.PI * 20 * (1 - progressPercent / 100)}`}
                className="transition-all duration-500"
              />
            </svg>
            <span className="absolute text-[10px] font-bold text-indigo-700">{progressPercent}%</span>
          </div>
        </div>
      </div>

      {/* Timeline entries */}
      <div className="relative border-l border-slate-100 pl-6 ml-3 space-y-6">
        {schedule.map((item, index) => {
          const isCompleted = !!completedItems[index];

          return (
            <div
              key={index}
              onClick={() => toggleItem(index)}
              className="relative cursor-pointer group"
              id={`timeline-item-${index}`}
            >
              {/* Connector Dot */}
              <div className="absolute -left-[31px] top-1.5 transition-all">
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 bg-white rounded-full border-2 border-indigo-600 fill-white" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300 bg-white rounded-full border-2 border-slate-300 group-hover:border-slate-400 group-hover:text-slate-400" />
                )}
              </div>

              {/* Box container */}
              <div
                className={`p-4 rounded-2xl border transition-all duration-200 ${
                  isCompleted
                    ? 'bg-slate-50/75 border-slate-100 text-slate-400'
                    : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm text-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                      isCompleted ? 'bg-slate-100 text-slate-400' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {item.time}
                    </span>
                    <span className={`inline-block text-[10px] uppercase font-bold px-2 py-0.5 border rounded-full ${
                      getMealTypeBadge(item.mealType)
                    }`}>
                      {item.mealType}
                    </span>
                  </div>

                  <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {item.duration} mins
                  </span>
                </div>

                <h4 className={`text-sm font-semibold mb-1 ${isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                  {item.activity}
                </h4>
                <p className="text-xs leading-relaxed text-slate-500">
                  {item.details}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
