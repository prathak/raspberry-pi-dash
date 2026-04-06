"use client";

import { useQuery } from "@tanstack/react-query";
import { Utensils, AlertCircle } from "lucide-react";

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
      <div className="flex justify-between items-center py-2 border-b border-white/10 last:border-0">
        <span className="text-xs text-white/50 uppercase">{label}</span>
        <span className="text-white font-medium text-sm">{meal}</span>
      </div>
    ) : null
  );

  return (
    <div className="glass-card p-6 h-full">
      <div className="flex items-center gap-3 mb-4">
        <Utensils className="w-6 h-6 text-white/80" />
        <h2 className="text-xl font-semibold text-white">Meal Plan</h2>
      </div>

      {isLoading && (
        <div className="text-white/60 text-center py-8">Loading meal plan...</div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-400 py-8">
          <AlertCircle className="w-5 h-5" />
          <span>Failed to load meal plan</span>
        </div>
      )}

      {!isLoading && !error && meals.length === 0 && (
        <div className="text-white/60 text-center py-8">No meal plan set</div>
      )}

      {!isLoading && !error && meals.length > 0 && (
        <div className="space-y-4">
          {/* Today */}
          <div className="p-4 rounded-lg bg-white/5">
            <p className="text-sm text-white/80 font-semibold mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400" />
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
          <div className="p-4 rounded-lg bg-white/5">
            <p className="text-sm text-white/80 font-semibold mb-2">
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
