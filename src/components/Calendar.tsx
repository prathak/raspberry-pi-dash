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

  const getTwoWeekEvents = () => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    const days = Array.from({ length: 14 }, (_, i) => {
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

  const twoWeekEvents = getTwoWeekEvents();

  return (
    <div className="glass-card p-4 h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 mb-3 flex-shrink-0">
        <CalendarIcon className="w-5 h-5 text-white/80" />
        <h2 className="text-lg font-semibold text-white">Calendar</h2>
      </div>

      {isLoading && (
        <div className="text-white/60 text-center py-4">Loading events...</div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-400 py-4">
          <AlertCircle className="w-5 h-5" />
          <span>Failed to load calendar events</span>
        </div>
      )}

      {!isLoading && !error && (
        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
          {/* Two equal height rows */}
          <div className="flex flex-col h-full">
            {/* Week 1 */}
            <div className="flex-1 min-h-0">
              <div className="grid grid-cols-7 gap-1 h-full">
                {twoWeekEvents.slice(0, 7).map((day) => (
                  <div
                    key={`week1-${day.date.toISOString()}`}
                    className={`flex flex-col h-full ${
                      day.isToday ? "bg-white/15" : "bg-white/5"
                    } rounded overflow-hidden`}
                  >
                    {/* Day Header */}
                    <div className="text-center py-1 px-1 border-b border-white/10 flex-shrink-0">
                      <span className="text-[10px] text-white/50 uppercase">{day.dayName}</span>
                      <p className={`text-sm font-semibold ${day.isToday ? "text-white" : "text-white/70"}`}>
                        {day.dayNumber}
                      </p>
                    </div>

                    {/* Events */}
                    <div className="flex-1 overflow-y-auto p-0.5 space-y-0.5 min-h-0">
                      {day.events.map((event) => (
                        <div
                          key={event.id}
                          className={`p-0.5 rounded border text-[9px] ${getCalendarColor(event.calendar)}`}
                        >
                          <p className="font-medium text-white truncate">{event.title}</p>
                          <p className="text-white/50 text-[9px]">{formatTime(event.start)}</p>
                          {event.location && (
                            <p className="text-white/40 truncate text-[9px]">{event.location}</p>
                          )}
                        </div>
                      ))}
                      {day.events.length === 0 && (
                        <div className="text-white/20 text-[9px] text-center py-0.5">-</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Week 2 */}
            <div className="flex-1 min-h-0">
              <div className="grid grid-cols-7 gap-1 h-full">
                {twoWeekEvents.slice(7, 14).map((day) => (
                  <div
                    key={`week2-${day.date.toISOString()}`}
                    className={`flex flex-col h-full ${
                      day.isToday ? "bg-white/15" : "bg-white/5"
                    } rounded overflow-hidden`}
                  >
                    {/* Day Header */}
                    <div className="text-center py-1 px-1 border-b border-white/10 flex-shrink-0">
                      <span className="text-[10px] text-white/50 uppercase">{day.dayName}</span>
                      <p className={`text-sm font-semibold ${day.isToday ? "text-white" : "text-white/70"}`}>
                        {day.dayNumber}
                      </p>
                    </div>

                    {/* Events */}
                    <div className="flex-1 overflow-y-auto p-0.5 space-y-0.5 min-h-0">
                      {day.events.map((event) => (
                        <div
                          key={event.id}
                          className={`p-0.5 rounded border text-[9px] ${getCalendarColor(event.calendar)}`}
                        >
                          <p className="font-medium text-white truncate">{event.title}</p>
                          <p className="text-white/50 text-[9px]">{formatTime(event.start)}</p>
                          {event.location && (
                            <p className="text-white/40 truncate text-[9px]">{event.location}</p>
                          )}
                        </div>
                      ))}
                      {day.events.length === 0 && (
                        <div className="text-white/20 text-[9px] text-center py-0.5">-</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
