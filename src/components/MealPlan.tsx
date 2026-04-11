"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle, UtensilsCrossed } from "lucide-react";

interface MealPlan {
  day: string;
  breakfast?: string;
  lunch?: string;
  dinner?: string;
}

async function fetchMealPlan(): Promise<MealPlan[]> {
  const res = await fetch("/api/meals");
  if (!res.ok) throw new Error("Failed to fetch meal plan");
  return res.json();
}

export default function MealPlan() {
  const { data: meals = [], error, isLoading } = useQuery({
    queryKey: ["meals"],
    queryFn: fetchMealPlan,
  });

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const today = new Date().getDay();
  const currentDayIndex = today === 0 ? 6 : today - 1; // Convert to Monday=0
  const tomorrowIndex = (currentDayIndex + 1) % 7;

  const todayMeal = meals[currentDayIndex] || { day: days[currentDayIndex] };
  const tomorrowMeal = meals[tomorrowIndex] || { day: days[tomorrowIndex] };

  const MealItem = ({ label, meal }: { label: string; meal?: string }) => (
    meal ? (
      <div className="flex justify-between items-center py-1 border-b border-white/10 last:border-0">
        <span className="text-[11px] text-white/50 uppercase tracking-wide">{label}</span>
        <span className="text-white text-[15px] truncate">{meal}</span>
      </div>
    ) : null
  );

  return (
    <div className="glass-card p-3 h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 mb-2 flex-shrink-0">
        <UtensilsCrossed className="w-5 h-5 text-orange-300" />
        <h2 className="text-base font-bold bg-gradient-to-r from-orange-300 to-rose-400 bg-clip-text text-transparent">Meal Plan</h2>
      </div>

      {isLoading && (
        <div className="text-white/60 text-center py-4 text-xs">Loading...</div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-400 py-2">
          <AlertCircle className="w-3 h-3" />
          <span className="text-xs">Failed to load</span>
        </div>
      )}

      {!isLoading && !error && meals.length === 0 && (
        <div className="text-white/60 text-center py-4 text-xs">No meal plan</div>
      )}

      {!isLoading && !error && meals.length > 0 && (
        <div className="space-y-2 overflow-y-auto custom-scrollbar">
          {/* Today */}
          <div className="rounded-lg bg-white/5 p-2.5">
            <p className="text-sm text-white/80 font-semibold mb-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              Today ({days[currentDayIndex]})
            </p>
            <MealItem label="Breakfast" meal={todayMeal.breakfast} />
            <MealItem label="Lunch" meal={todayMeal.lunch} />
            <MealItem label="Dinner" meal={todayMeal.dinner} />
            {!todayMeal.breakfast && !todayMeal.lunch && !todayMeal.dinner && (
              <p className="text-white/40 text-sm">No meals planned</p>
            )}
          </div>

          {/* Tomorrow */}
          <div className="rounded-lg bg-white/5 p-2.5">
            <p className="text-sm text-white/80 font-semibold mb-1">
              Tomorrow ({days[tomorrowIndex]})
            </p>
            <MealItem label="Breakfast" meal={tomorrowMeal.breakfast} />
            <MealItem label="Lunch" meal={tomorrowMeal.lunch} />
            <MealItem label="Dinner" meal={tomorrowMeal.dinner} />
            {!tomorrowMeal.breakfast && !tomorrowMeal.lunch && !tomorrowMeal.dinner && (
              <p className="text-white/40 text-sm">No meals planned</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
