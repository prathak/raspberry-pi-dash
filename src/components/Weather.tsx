"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";

interface WeatherData {
  temperature: number;
  condition: string;
  location: string;
}

async function fetchWeather(): Promise<WeatherData> {
  const res = await fetch("/api/weather?location=Stratford,London");
  if (!res.ok) throw new Error("Failed to fetch weather");
  return res.json();
}

export default function Weather() {
  const { data: weather, error, isLoading } = useQuery({
    queryKey: ["weather"],
    queryFn: fetchWeather,
  });

  const getWeatherIcon = (condition: string) => {
    const lower = condition.toLowerCase();
    if (lower.includes("sun") || lower.includes("clear")) return "☀️";
    if (lower.includes("cloud")) return "☁️";
    if (lower.includes("rain")) return "🌧️";
    if (lower.includes("snow")) return "❄️";
    if (lower.includes("thunder")) return "️";
    if (lower.includes("fog") || lower.includes("mist")) return "🌫️";
    return "🌤️";
  };

  return (
    <div className="glass-card p-4 h-full">
      {isLoading && (
        <div className="text-white/60 text-center py-4">Loading...</div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-400 py-4">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">Failed to load weather</span>
        </div>
      )}

      {weather && (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-4xl font-light text-white">{Math.round(weather.temperature)}°</p>
            <p className="text-sm text-white/70 mt-1">{weather.condition}</p>
            <p className="text-xs text-white/50 mt-1">{weather.location}</p>
          </div>
          <span className="text-5xl">{getWeatherIcon(weather.condition)}</span>
        </div>
      )}
    </div>
  );
}
