"use client";

import { QueryProviders } from "@/components/QueryProviders";
import Clock from "@/components/Clock";
import Calendar from "@/components/Calendar";
import TodoList from "@/components/TodoList";
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Weather - Compact */}
          <div className="lg:col-span-1">
            <Weather />
          </div>

          {/* Todo List */}
          <div className="lg:col-span-1">
            <TodoList />
          </div>

          {/* Calendar - Full width on mobile, 2 cols on larger */}
          <div className="md:col-span-2 lg:col-span-2">
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
          <div className="md:col-span-2 lg:col-span-3 xl:col-span-2">
            <PhotoSlideshow />
          </div>
        </div>
      </div>
    </QueryProviders>
  );
}
