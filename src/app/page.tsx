"use client";

import { QueryProviders } from "@/components/QueryProviders";
import Clock from "@/components/Clock";
import Calendar from "@/components/Calendar";
import GroceryList from "@/components/GroceryList";
import TubeSchedule from "@/components/TubeSchedule";
import MealPlan from "@/components/MealPlan";
import Weather from "@/components/Weather";

export default function Dashboard() {
  return (
    <QueryProviders>
      <div className="relative h-screen overflow-hidden bg-black">
        {/* Content container */}
        <div className="px-4 h-full flex flex-col">
          {/* Clock at top */}
          <div className="pt-4 pb-2">
            <Clock showDate={true} />
          </div>

          {/* Widgets row */}
          <div className="mb-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <Weather />
              <GroceryList />
              <TubeSchedule />
              <MealPlan />
            </div>
          </div>

          {/* Calendar */}
          <div className="h-[35vh]">
            <Calendar />
          </div>
        </div>
      </div>
    </QueryProviders>
  );
}
