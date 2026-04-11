"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";

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

const EVENT_COLORS: Record<string, { border: string; bg: string; text: string; dot: string }> = {
  "Apple - Calendar": { border: "border-red-500", bg: "bg-red-500/10", text: "text-red-400", dot: "#ef4444" },
  "Apple - Home": { border: "border-emerald-500", bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "#10b981" },
  "Apple - Work": { border: "border-blue-500", bg: "bg-blue-500/10", text: "text-blue-400", dot: "#3b82f6" },
  "Apple - UK Holidays": { border: "border-green-500", bg: "bg-green-500/10", text: "text-green-400", dot: "#22c55e" },
  "Apple - India Holidays": { border: "border-orange-500", bg: "bg-orange-500/10", text: "text-orange-400", dot: "#f97316" },
};

const DEFAULT_COLOR = { border: "border-purple-500", bg: "bg-purple-500/10", text: "text-purple-400", dot: "#a855f7" };

function getEventColor(calendar: string) {
  return EVENT_COLORS[calendar] || DEFAULT_COLOR;
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

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getTwoWeekDays = () => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    return Array.from({ length: 14 }, (_, i) => {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      return day;
    });
  };

  const days = getTwoWeekDays();
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="glass-card p-3 h-full flex flex-col overflow-hidden">
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
        <div className="flex-1 flex flex-col min-h-0">
          {/* Month header */}
          <div className="flex items-center gap-2 mb-2 flex-shrink-0">
            <span className="text-sm font-semibold text-white">
              {days[0].toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
            </span>
            {days[0].getMonth() !== days[13].getMonth() && (
              <span className="text-sm font-semibold text-white/40">
                / {days[13].toLocaleDateString("en-GB", { month: "long" })}
              </span>
            )}
          </div>

          {/* Day header row */}
          <div className="grid grid-cols-7 divide-x divide-white/10 border-b border-white/15">
            {dayNames.map((name) => (
              <div key={name} className="py-1.5 text-center text-xs font-medium text-white/50">
                {name}
              </div>
            ))}
          </div>

          {/* Two week rows */}
          <div className="flex-1 grid grid-rows-2 min-h-0">
            {[0, 7].map((weekOffset) => (
              <div key={weekOffset} className="grid grid-cols-7 divide-x divide-white/10 border-b border-white/15 last:border-b-0">
                {days.slice(weekOffset, weekOffset + 7).map((day) => {
                  const dayStr = day.toDateString();
                  const dayEvents = events
                    .filter((e) => new Date(e.start).toDateString() === dayStr)
                    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
                    .slice(0, 3);
                  const moreCount = events.filter((e) => new Date(e.start).toDateString() === dayStr).length - 3;
                  const today = isToday(day);

                  return (
                    <div
                      key={day.toISOString()}
                      className={`flex flex-col p-1.5 ${today ? "bg-white/[0.06]" : ""}`}
                    >
                      {/* Date number */}
                      <div className="flex items-center justify-center mb-1">
                        <span className={`text-xs font-medium flex items-center justify-center rounded-full w-6 h-6 ${today ? "bg-white text-black" : "text-white/60"}`}>
                          {day.getDate()}
                        </span>
                      </div>

                      {/* Events */}
                      <div className="flex-1 flex flex-col gap-0.5 overflow-hidden">
                        {dayEvents.map((event) => {
                          const color = getEventColor(event.calendar);
                          const isAllDay = event.start.endsWith("T00:00:00");
                          return (
                            <div
                              key={event.id}
                              className={`${color.border} ${color.bg} border rounded px-1.5 py-0.5 truncate cursor-default`}
                            >
                              <span className={`text-[10px] font-medium ${color.text} truncate block`}>
                                {isAllDay ? event.title : `${formatTime(event.start)} ${event.title}`}
                              </span>
                            </div>
                          );
                        })}
                        {moreCount > 0 && (
                          <span className="text-[10px] text-white/40">+{moreCount} more</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}