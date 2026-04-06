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
      <div className="dashboard-bg min-h-screen p-6">
        {/* Header with Clock */}
        <header className="mb-6">
          <Clock />
        </header>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Weather - Compact */}
          <div className="lg:col-span-1">
            <Weather />
          </div>

          {/* Grocery List */}
          <div className="lg:col-span-1">
            <GroceryList />
          </div>

          {/* Calendar - Full width on mobile, spans both rows on larger */}
          <div className="lg:col-span-2 xl:col-span-2 row-span-2">
            <Calendar />
          </div>

          {/* Tube Schedule */}
          <div className="xl:col-span-1">
            <TubeSchedule />
          </div>

          {/* Meal Plan */}
          <div className="xl:col-span-1">
            <MealPlan />
          </div>

          {/* Photo Slideshow - Full width */}
          <div className="lg:col-span-4">
            <PhotoSlideshow />
          </div>
        </div>
      </div>
    </QueryProviders>
  );
}
