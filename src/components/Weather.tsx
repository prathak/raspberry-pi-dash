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
  hourly: Array<{
    time: string;
    temp: number;
    condition: string;
    rainChance: number;
  }>;
}

async function fetchWeather(): Promise<WeatherData> {
  const res = await fetch("/api/weather?location=Stratford,London");
  if (!res.ok) throw new Error("Failed to fetch weather");
  return res.json();
}

const getWeatherIcon = (condition: string) => {
  const lower = condition.toLowerCase();
  if (lower.includes("sun") || lower.includes("clear")) return "☀️";
  if (lower.includes("cloud")) return "⛅";
  if (lower.includes("rain") || lower.includes("drizzle") || lower.includes("shower")) return "🌧️";
  if (lower.includes("snow")) return "❄️";
  if (lower.includes("thunder")) return "⛈️";
  if (lower.includes("fog") || lower.includes("mist") || lower.includes("rime")) return "🌫️";
  return "🌤️";
};

export default function Weather() {
  const { data: weather, error, isLoading } = useQuery({
    queryKey: ["weather"],
    queryFn: fetchWeather,
    refetchInterval: 5 * 60 * 1000,
  });

  const getDayLength = () => {
    const sunrise = weather?.sunrise || "5:43";
    const sunset = weather?.sunset || "20:08";
    const [sunriseH, sunriseM] = sunrise.split(":").map(Number);
    const [sunsetH, sunsetM] = sunset.split(":").map(Number);
    const diff = (sunsetH * 60 + sunsetM) - (sunriseH * 60 + sunriseM);
    return `${Math.floor(diff / 60)}h ${diff % 60}m`;
  };

  return (
    <div className="glass-card p-4 h-full pointer-events-none flex flex-col">
      {isLoading && (
        <div className="text-white/60 text-center py-4">Loading...</div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-400 py-4">
          <AlertCircle className="w-5 h-5" />
          <span className="text-base">Failed to load weather</span>
        </div>
      )}

      {weather && (
        <div className="flex flex-col gap-3">
          {/* Current */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-6xl font-semibold text-white leading-tight drop-shadow-md">{Math.round(weather.temperature)}°</p>
              <p className="text-lg text-white/90 font-semibold">{weather.condition}</p>
              <p className="text-base text-white/70 font-medium">{weather.location}</p>
            </div>
            <span className="text-6xl">{getWeatherIcon(weather.condition)}</span>
          </div>

          {/* Sunrise/Sunset */}
          <div className="flex items-center gap-2 bg-white/5 rounded-full px-3 py-1.5 text-sm text-white/80 font-medium justify-center">
            <span>{weather.sunrise || "5:43"}</span>
            <span className="text-white/30">—</span>
            <span>{getDayLength()}</span>
            <span className="text-white/30">—</span>
            <span>{weather.sunset || "20:08"}</span>
          </div>

          {/* Humidity, Wind, Rain */}
          <div className="flex justify-between text-sm font-semibold">
            <div className="flex items-center gap-1.5 text-white/80">
              <Droplets className="w-4 h-4" />
              <span>{weather.humidity || 65}%</span>
            </div>
            <div className="flex items-center gap-1.5 text-white/80">
              <Wind className="w-4 h-4" />
              <span>{weather.windSpeed || 12} km/h</span>
            </div>
            <div className="flex items-center gap-1.5 text-white/80">
              <span>🌧️</span>
              <span>{weather.rainChance || 20}%</span>
            </div>
          </div>

          {/* Hourly strip — every 2 hours */}
          {weather.hourly && weather.hourly.length > 0 && (
            <div className="flex justify-between bg-white/5 rounded-xl px-2 py-2">
              {weather.hourly.map((h, i) => (
                <div key={i} className="flex flex-col items-center gap-0.5 min-w-[40px]">
                  <span className="text-xs text-white/60 font-semibold">{h.time}</span>
                  <span className="text-xl leading-none">{getWeatherIcon(h.condition)}</span>
                  <span className="text-sm text-white font-bold tabular-nums">{h.temp}°</span>
                  {h.rainChance > 20 && (
                    <span className="text-[10px] text-blue-300/80 font-medium">{h.rainChance}%</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 7-Day Forecast */}
          <div className="grid grid-cols-7 gap-1">
            {weather.forecast?.slice(0, 7).map((day, index) => (
              <div
                key={index}
                className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg ${
                  index === 0 ? "bg-white/15" : "bg-white/5"
                }`}
              >
                <span className="text-xs text-white/60 font-semibold uppercase">{day.day}</span>
                <span className="text-2xl">{getWeatherIcon(day.condition)}</span>
                <div className="flex gap-0.5 text-xs font-semibold">
                  <span className="text-white">{Math.round(day.high)}°</span>
                  <span className="text-white/60">{Math.round(day.low)}°</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}