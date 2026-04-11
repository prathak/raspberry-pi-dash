"use client";

import { useQuery } from "@tanstack/react-query";
import { TrainFront } from "lucide-react";

interface TubeDeparture {
  station: string;
  line: string;
  destination: string;
  times: number[];
}

async function fetchTubeDepartures(): Promise<TubeDeparture[]> {
  const res = await fetch("/api/tube");
  if (!res.ok) throw new Error("Failed to fetch tube departures");
  return res.json();
}

const LINE_COLORS: Record<string, string> = {
  "Central": "#DC241F",
  "District": "#00782A",
  "Hammersmith & City": "#F3A3BB",
  "Jubilee": "#A0A5A9",
  "Elizabeth line": "#4A0080",
  "DLR": "#00A4A7",
  "Overground": "#EE7C0E",
};

const LINE_DOT: Record<string, string> = {
  "Central": "bg-red-600",
  "District": "bg-green-600",
  "Hammersmith & City": "bg-pink-300",
  "Jubilee": "bg-gray-500",
  "Elizabeth line": "bg-purple-800",
  "DLR": "bg-teal-400",
  "Overground": "bg-orange-500",
};

function TimeBubble({ secs, color }: { secs: number; color: string }) {
  const label = secs <= 30 ? "Due" : `${Math.round(secs / 60)}`;
  return (
    <span
      className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold tabular-nums"
      style={{ backgroundColor: color, color: "#fff" }}
    >
      {label}
    </span>
  );
}

export default function TubeSchedule() {
  const { data: departures = [], error, isLoading } = useQuery({
    queryKey: ["tube"],
    queryFn: fetchTubeDepartures,
    refetchInterval: 20 * 1000,
  });

  return (
    <div className="glass-card p-3 h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 mb-2 flex-shrink-0">
        <TrainFront className="w-5 h-5 text-blue-300" />
        <h2 className="text-base font-bold bg-gradient-to-r from-blue-300 to-violet-400 bg-clip-text text-transparent">Tube Departures</h2>
      </div>

      {isLoading && (
        <div className="text-white/60 text-center py-4 text-sm">Loading...</div>
      )}

      {error && (
        <div className="text-red-400 text-center py-4 text-sm">Failed to load</div>
      )}

      {!isLoading && !error && departures.length === 0 && (
        <div className="text-white/60 text-center py-4 text-sm">No departures</div>
      )}

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
        {departures.map((dep) => {
          const color = LINE_COLORS[dep.line] || "#A0A5A9";
          const dot = LINE_DOT[dep.line] || "bg-gray-500";
          return (
            <div
              key={`${dep.station}-${dep.line}-${dep.destination}`}
              className="flex items-start gap-2 py-1.5"
            >
              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5 ${dot}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-sm text-white font-semibold truncate">
                      {dep.line}
                    </span>
                    <p className="text-xs text-white/40 truncate">
                      {dep.destination}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {dep.times.map((secs, i) => (
                      <TimeBubble key={i} secs={secs} color={color} />
                    ))}
                    <span className="text-xs text-white/50 ml-0.5">min</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}