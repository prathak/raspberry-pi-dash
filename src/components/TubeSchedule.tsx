"use client";

import { useQuery } from "@tanstack/react-query";
import { TrainFront, AlertCircle, Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface TubeDeparture {
  station: string;
  line: string;
  destination: string;
  time: string;
  timeToStationSecs: number;
  isDelayed?: boolean;
}

async function fetchTubeDepartures(): Promise<TubeDeparture[]> {
  const res = await fetch("/api/tube");
  if (!res.ok) throw new Error("Failed to fetch tube departures");
  return res.json();
}

export default function TubeSchedule() {
  const { data: departures = [], error, isLoading } = useQuery({
    queryKey: ["tube"],
    queryFn: fetchTubeDepartures,
    refetchInterval: 20 * 1000,
  });

  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatLiveTime = (departure: TubeDeparture) => {
    const remainingSecs = Math.max(0, departure.timeToStationSecs - Math.floor((Date.now() - currentTime) / 1000));
    if (remainingSecs === 0) return "Due";
    if (remainingSecs < 30) return `${remainingSecs}s`;
    if (remainingSecs < 60) return `${remainingSecs}s`;
    const mins = Math.round(remainingSecs / 60);
    if (mins === 1) return "1 min";
    return `${mins} min`;
  };

  const getLineColor = (line: string) => {
    const colors: Record<string, string> = {
      "Central": "bg-red-600",
      "District": "bg-green-600",
      "Hammersmith & City": "bg-pink-300",
      "Jubilee": "bg-gray-500",
      "Elizabeth": "bg-purple-600",
      "DLR": "bg-teal-400",
      "Overground": "bg-orange-500",
    };
    return colors[line] || "bg-gray-500";
  };

  return (
    <div className="glass-card p-3 h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 mb-2 flex-shrink-0">
        <TrainFront className="w-4 h-4 text-white/80" />
        <h2 className="text-base font-semibold text-white">Tube Departures</h2>
      </div>

      {isLoading && (
        <div className="text-white/60 text-center py-4 text-sm">Loading...</div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-400 py-4">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">Failed to load</span>
        </div>
      )}

      {!isLoading && !error && departures.length === 0 && (
        <div className="text-white/60 text-center py-4 text-sm">No departures</div>
      )}

      <div className="space-y-1 overflow-y-auto custom-scrollbar">
        {departures.slice(0, 4).map((departure, index) => (
          <div
            key={`${departure.station}-${departure.line}-${departure.destination}-${index}`}
            className="flex items-center gap-2 p-1.5 rounded"
          >
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getLineColor(departure.line)}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium truncate">{departure.destination}</p>
              <p className="text-xs text-white/50">{departure.line}</p>
            </div>
            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
              departure.isDelayed
                ? "bg-red-500/30 text-red-300"
                : "bg-white/10 text-white"
            }`}>
              <Clock className="w-2.5 h-2.5" />
              <span className="text-xs">{formatLiveTime(departure)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
