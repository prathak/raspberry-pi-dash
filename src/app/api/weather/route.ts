import { NextResponse } from "next/server";

interface WeatherData {
  temperature: number;
  feelsLike: number;
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

// Mock data - replace with actual weather API integration
// Options: OpenWeatherMap, Met Office UK, WeatherAPI, Open-Meteo (free, no API key)
const getMockWeather = (location: string): WeatherData => ({
  temperature: 12,
  feelsLike: 10,
  condition: "Cloudy",
  location: location || "Stratford, London",
  humidity: 73,
  windSpeed: 10,
  rainChance: 90,
  sunrise: "5:43",
  sunset: "20:08",
  forecast: [
    { day: "Today", high: 14, low: 8, condition: "Cloudy" },
    { day: "Wed", high: 15, low: 9, condition: "Partly Cloudy" },
    { day: "Thu", high: 13, low: 7, condition: "Rain" },
    { day: "Fri", high: 16, low: 10, condition: "Sunny" },
    { day: "Sat", high: 14, low: 8, condition: "Cloudy" },
    { day: "Sun", high: 12, low: 6, condition: "Rain" },
    { day: "Mon", high: 15, low: 9, condition: "Partly Cloudy" },
  ],
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get("location") || "Stratford, London";

  // TODO: Implement actual weather API integration
  // Open-Meteo (free, no API key): https://api.open-meteo.com/v1/forecast?latitude=51.54&longitude=-0.00&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code,sunrise,sunset&timezone=auto
  // OpenWeatherMap: https://api.openweathermap.org/data/2.5/weather?q=London&appid={API_KEY}
  // Met Office UK: https://api-metoffice.apigee.net/

  return NextResponse.json(getMockWeather(location));
}
