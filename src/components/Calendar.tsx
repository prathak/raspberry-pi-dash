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
    refetchInterval: 5 * 60 * 1000,
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

  const getWeeklyEvents = () => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    const days = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      return day;
    });

    return days.map((day) => {
      const dayStr = day.toDateString();
      return {
        date: day,
        dayName: getDayName(dayStr),
        dayNumber: day.getDate(),
        monthName: getMonthName(dayStr),
        isToday: day.toDateString() === today.toDateString(),
        events: events
          .filter((e) => new Date(e.start).toDateString() === dayStr)
          .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()),
      };
    });
  };

  const weeklyEvents = getWeeklyEvents();

  return (
    <div className="glass-card p-4 h-full">
      <div className="flex items-center gap-2 mb-3">
        <CalendarIcon className="w-5 h-5 text-white/80" />
        <h2 className="text-lg font-semibold text-white">This Week</h2>
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
        <div className="grid grid-cols-7 gap-2 h-[calc(100%-2rem)]">
          {weeklyEvents.map((day) => (
            <div
              key={day.date.toISOString()}
              className={`flex flex-col ${
                day.isToday ? "bg-white/15" : "bg-white/5"
              } rounded-lg overflow-hidden`}
            >
              {/* Day Header */}
              <div className="text-center py-2 px-1 border-b border-white/10 flex-shrink-0">
                <span className="text-xs text-white/50 uppercase">{day.dayName}</span>
                <p className={`text-lg font-semibold ${day.isToday ? "text-white" : "text-white/70"}`}>
                  {day.dayNumber}
                </p>
                <span className="text-xs text-white/40">{day.monthName}</span>
              </div>

              {/* Events - fills remaining space */}
              <div className="flex-1 overflow-hidden p-1 space-y-1">
                {day.events.map((event) => (
                  <div
                    key={event.id}
                    className={`p-1.5 rounded border text-xs ${getCalendarColor(event.calendar)}`}
                  >
                    <p className="font-medium text-white leading-tight break-words line-clamp-2">
                      {event.title}
                    </p>
                    <p className="text-white/50 mt-0.5 text-[10px]">
                      {formatTime(event.start)}
                    </p>
                    {event.location && (
                      <p className="text-white/40 mt-0.5 text-[9px] truncate">
                        {event.location}
                      </p>
                    )}
                  </div>
                ))}
                {day.events.length === 0 && (
                  <div className="text-white/20 text-xs text-center py-2">-</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
