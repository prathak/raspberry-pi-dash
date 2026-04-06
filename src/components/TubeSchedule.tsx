"use client";

import { useQuery } from "@tanstack/react-query";
import { TrainFront, AlertCircle, Clock } from "lucide-react";

interface TubeDeparture {
  station: string;
  line: string;
  destination: string;
  time: string;
  isDelayed?: boolean;
}

async function fetchTubeDepartures(): Promise<TubeDeparture[]> {
  const res = await fetch("/api/tube?stations=Stratford,Stratford+International");
  if (!res.ok) throw new Error("Failed to fetch tube departures");
  return res.json();
}

export default function TubeSchedule() {
  const { data: departures = [], error, isLoading } = useQuery({
    queryKey: ["tube"],
    queryFn: fetchTubeDepartures,
  });

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
    <div className="glass-card p-6 h-full">
      <div className="flex items-center gap-3 mb-4">
        <TrainFront className="w-6 h-6 text-white/80" />
        <h2 className="text-xl font-semibold text-white">Tube Departures</h2>
      </div>

      {isLoading && (
        <div className="text-white/60 text-center py-8">Loading departures...</div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-400 py-8">
          <AlertCircle className="w-5 h-5" />
          <span>Failed to load tube data</span>
        </div>
      )}

      {!isLoading && !error && departures.length === 0 && (
        <div className="text-white/60 text-center py-8">No departures found</div>
      )}

      <div className="space-y-3">
        {departures.slice(0, 8).map((departure, index) => (
          <div
            key={`${departure.station}-${departure.line}-${departure.destination}-${index}`}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-glass"
          >
            <div className={`w-2.5 h-2.5 rounded-full ${getLineColor(departure.line)}`} />
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{departure.destination}</p>
              <p className="text-xs text-white/60">{departure.line} {departure.station && `from ${departure.station}`}</p>
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              departure.isDelayed
                ? "bg-red-500/30 text-red-300"
                : "bg-white/10 text-white"
            }`}>
              <Clock className="w-3 h-3" />
              {departure.time}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
