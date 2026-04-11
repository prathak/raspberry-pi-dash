"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Droplets, Wind } from "lucide-react";

interface WeatherData {
  temperature: number;
  condition: string;
  location: string;
  humidity: number;
  windSpeed: number;
  rainChance: number;
  sunrise: string;
  sunset: string;
  forecast: Array<{
    day: string;
    high: number;
    low: number;
    condition: string;
  }>;
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
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  const getWeatherIcon = (condition: string) => {
    const lower = condition.toLowerCase();
    if (lower.includes("sun") || lower.includes("clear")) return "☀️";
    if (lower.includes("cloud")) return "⛅";
    if (lower.includes("rain")) return "🌧️";
    if (lower.includes("snow")) return "❄️";
    if (lower.includes("thunder")) return "⛈️";
    if (lower.includes("fog") || lower.includes("mist")) return "🌫️";
    return "🌤️";
  };

  // Calculate day length
  const getDayLength = () => {
    const sunrise = weather?.sunrise || "5:43";
    const sunset = weather?.sunset || "20:08";
    const [sunriseH, sunriseM] = sunrise.split(":").map(Number);
    const [sunsetH, sunsetM] = sunset.split(":").map(Number);
    const sunriseMin = sunriseH * 60 + sunriseM;
    const sunsetMin = sunsetH * 60 + sunsetM;
    const diff = sunsetMin - sunriseMin;
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="glass-card p-3 h-full pointer-events-none flex flex-col">
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
        <div className="space-y-2 flex flex-col">
          {/* Header - Current Weather */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-5xl font-light text-white leading-tight">{Math.round(weather.temperature)}°</p>
              <p className="text-base text-white/90 font-medium">{weather.condition}</p>
              <p className="text-sm text-white/60">{weather.location}</p>
            </div>
            <span className="text-5xl">{getWeatherIcon(weather.condition)}</span>
          </div>

          {/* Sunrise/Sunset */}
          <div className="flex items-center gap-2 bg-white/5 rounded-full px-3 py-1 text-xs text-white/80 justify-center">
            <span>{weather.sunrise || "5:43"}</span>
            <span className="text-white/30">—</span>
            <span>{getDayLength()}</span>
            <span className="text-white/30">—</span>
            <span>{weather.sunset || "20:08"}</span>
          </div>

          {/* Humidity, Wind, Rain in one row */}
          <div className="flex justify-between text-xs">
            <div className="flex items-center gap-1 text-white/70">
              <Droplets className="w-3 h-3" />
              <span>{weather.humidity || 65}%</span>
            </div>
            <div className="flex items-center gap-1 text-white/70">
              <Wind className="w-3 h-3" />
              <span>{weather.windSpeed || 12} km/h</span>
            </div>
            <div className="flex items-center gap-1 text-white/70">
              <span>🌧️</span>
              <span>{weather.rainChance || 20}%</span>
            </div>
          </div>

          {/* 7-Day Forecast */}
          <div className="grid grid-cols-7 gap-1 pt-1">
            {weather.forecast?.slice(0, 7).map((day, index) => (
              <div
                key={index}
                className={`flex flex-col items-center gap-0.5 p-1 rounded-lg ${
                  index === 0 ? "bg-white/15" : "bg-white/5"
                }`}
              >
                <span className="text-[10px] text-white/50 uppercase">{day.day}</span>
                <span className="text-lg">{getWeatherIcon(day.condition)}</span>
                <div className="flex gap-0.5 text-[10px]">
                  <span className="text-white font-medium">{Math.round(day.high)}°</span>
                  <span className="text-white/50">{Math.round(day.low)}°</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
