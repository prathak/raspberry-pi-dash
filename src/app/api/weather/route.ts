import { NextResponse } from "next/server";

interface WeatherData {
  temperature: number;
  condition: string;
  location: string;
}

// Mock data - replace with actual weather API integration
// Options: OpenWeatherMap, Met Office UK, WeatherAPI
const getMockWeather = (location: string): WeatherData => ({
  temperature: 16,
  condition: "Partly Cloudy",
  location: location || "Stratford, London",
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get("location") || "Stratford, London";

  // TODO: Implement actual weather API integration
  // OpenWeatherMap: https://api.openweathermap.org/data/2.5/weather?q=London&appid={API_KEY}
  // Met Office UK: https://api-metoffice.apigee.net/

  return NextResponse.json(getMockWeather(location));
}
