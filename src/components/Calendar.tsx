"use client";

import { useQuery } from "@tanstack/react-query";
import { Calendar as CalendarIcon, AlertCircle } from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  calendar: string;
  location?: string;
}

async function fetchCalendarEvents(): Promise<CalendarEvent[]> {
  const res = await fetch("/api/calendar");
  if (!res.ok) throw new Error("Failed to fetch calendar events");
  return res.json();
}

export default function Calendar() {
  const { data: events = [], error, isLoading } = useQuery({
    queryKey: ["calendar"],
    queryFn: fetchCalendarEvents,
  });

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDayName = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", { weekday: "short" });
  };

  const getDayNumber = (dateString: string) => {
    return new Date(dateString).getDate();
  };

  const getMonthName = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", { month: "short" });
  };

  const isToday = (dateString: string) => {
    const today = new Date();
    const date = new Date(dateString);
    return date.toDateString() === today.toDateString();
  };

  const getCalendarColor = (calendar: string) => {
    if (calendar.includes("Google")) return "border-blue-400/50 bg-blue-500/20";
    if (calendar.includes("Apple") || calendar.includes("iCloud")) return "border-red-400/50 bg-red-500/20";
    return "border-purple-400/50 bg-purple-500/20";
  };

  // Group events by day for the week
  const getWeeklyEvents = () => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Start from Sunday

    const days = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      return day;
    });

    const eventsByDay = days.map((day) => {
      const dayStr = day.toDateString();
      return {
        date: day,
        dayName: day.toLocaleDateString("en-GB", { weekday: "short" }),
        dayNumber: day.getDate(),
        monthName: day.toLocaleDateString("en-GB", { month: "short" }),
        isToday: day.toDateString() === today.toDateString(),
        events: events.filter((e) => new Date(e.start).toDateString() === dayStr),
      };
    });

    return eventsByDay;
  };

  const weeklyEvents = getWeeklyEvents();

  return (
    <div className="glass-card p-6 h-full">
      <div className="flex items-center gap-3 mb-4">
        <CalendarIcon className="w-6 h-6 text-white/80" />
        <h2 className="text-xl font-semibold text-white">This Week</h2>
      </div>

      {isLoading && (
        <div className="text-white/60 text-center py-8">Loading events...</div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-400 py-8">
          <AlertCircle className="w-5 h-5" />
          <span>Failed to load calendar events</span>
        </div>
      )}

      {!isLoading && !error && (
        <div className="grid grid-cols-7 gap-2">
          {weeklyEvents.map((day) => (
            <div
              key={day.date.toISOString()}
              className={`flex flex-col items-center p-2 rounded-lg ${
                day.isToday ? "bg-white/15" : "bg-white/5"
              }`}
            >
              <span className="text-xs text-white/50 uppercase">{day.dayName}</span>
              <span className={`text-lg font-semibold ${day.isToday ? "text-white" : "text-white/70"}`}>
                {day.dayNumber}
              </span>
              <span className="text-xs text-white/40">{day.monthName}</span>

              <div className="w-full mt-2 space-y-1">
                {day.events.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className={`p-1.5 rounded border ${getCalendarColor(event.calendar)} cursor-pointer hover:bg-white/10 transition-glass`}
                    title={`${event.title}\n${formatTime(event.start)} - ${formatTime(event.end)}`}
                  >
                    <p className="text-xs text-white font-medium truncate">{event.title}</p>
                    <p className="text-xs text-white/50">{formatTime(event.start)}</p>
                  </div>
                ))}
                {day.events.length > 3 && (
                  <p className="text-xs text-white/40 text-center">+{day.events.length - 3} more</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
