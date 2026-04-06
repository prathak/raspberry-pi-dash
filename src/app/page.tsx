"use client";

import { QueryProviders } from "@/components/QueryProviders";
import Clock from "@/components/Clock";
import Calendar from "@/components/Calendar";
import GroceryList from "@/components/GroceryList";
import TubeSchedule from "@/components/TubeSchedule";
import MealPlan from "@/components/MealPlan";
import Weather from "@/components/Weather";
import PhotoSlideshow from "@/components/PhotoSlideshow";

export default function Dashboard() {
  return (
    <QueryProviders>
      <div className="relative h-screen overflow-hidden bg-black">
        {/* Full screen photo background */}
        <div className="fixed inset-0 z-0">
          <PhotoSlideshow showTime={false} />
        </div>

        {/* Clock at top, 10% height */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 z-20 w-full px-4">
          <Clock showDate={false} />
        </div>

        {/* Content - starts after clock */}
        <div className="relative z-10 pt-[10vh] px-4 h-[90vh] flex flex-col">
          {/* Weather row - 50% of available space */}
          <div className="flex-1 mb-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 h-full">
              <div className="h-full"><Weather /></div>
              <div className="h-full"><GroceryList /></div>
              <div className="h-full"><TubeSchedule /></div>
              <div className="h-full"><MealPlan /></div>
            </div>
          </div>

          {/* Calendar - 40% of 90vh */}
          <div className="h-[36vh]">
            <Calendar />
          </div>
        </div>
      </div>
    </QueryProviders>
  );
}
