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
        {/* Full-bleed background slideshow — image visible on top */}
        <div className="absolute inset-0 z-0">
          <PhotoSlideshow />
        </div>

        {/* Gradient overlay: transparent on top (image visible), dark on bottom (widgets) */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-transparent via-black/50 to-black/80" />

        {/* Clock at very top */}
        <div className="relative z-[2] px-4 pt-4">
          <Clock showDate={true} />
        </div>

        {/* Widgets and calendar — pushed down so image shows through top */}
        <div className="relative z-[2] px-4 h-[calc(100vh-4rem)] flex flex-col pt-[6vh]">
          {/* Widgets — 4-column grid */}
          <div className="mb-2">
            <div className="grid grid-cols-4 gap-2" style={{ minHeight: "34vh" }}>
              <Weather />
              <GroceryList />
              <TubeSchedule />
              <MealPlan />
            </div>
          </div>

          {/* Calendar — fills remaining space */}
          <div className="flex-1 min-h-0 pb-2">
            <Calendar />
          </div>
        </div>
      </div>
    </QueryProviders>
  );
}
