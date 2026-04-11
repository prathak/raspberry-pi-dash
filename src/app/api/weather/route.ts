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
  hourly: Array<{
    time: string;
    temp: number;
    condition: string;
    rainChance: number;
  }>;
}

// Weather API - Using Open-Meteo (free, no API key required)
// Stratford, London coordinates
const LATITUDE = 51.547859655580545;
const LONGITUDE = -0.008267337809205917;

// WMO weather codes
const CONDITIONS: Record<number, string> = {
  0: "Clear Sky",
  1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast",
  45: "Fog", 48: "Rime Fog",
  51: "Light Drizzle", 53: "Moderate Drizzle", 55: "Dense Drizzle",
  56: "Freezing Drizzle", 57: "Freezing Drizzle",
  61: "Light Rain", 63: "Moderate Rain", 65: "Heavy Rain",
  66: "Freezing Rain", 67: "Freezing Rain",
  71: "Light Snow", 73: "Moderate Snow", 75: "Heavy Snow",
  77: "Snow Grains",
  80: "Light Rain Showers", 81: "Moderate Rain Showers", 82: "Heavy Rain Showers",
  85: "Light Snow Showers", 86: "Heavy Snow Showers",
  95: "Thunderstorm", 96: "Thunderstorm with Hail", 99: "Thunderstorm with Heavy Hail",
};

function getWeatherCondition(code: number): string {
  return CONDITIONS[code] || "Unknown";
}

export async function GET() {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code,sunrise,sunset&hourly=temperature_2m,weather_code,precipitation_probability&timezone=auto`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch weather");

    const data = await res.json();
    const current = data.current;
    const daily = data.daily;

    // Convert sunrise/sunset to 12-hour format
    const parseTime = (isoTime: string) => {
      const date = new Date(isoTime);
      return date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    // Get 7-day forecast with conditions
    const forecast = Array.from({ length: 7 }, (_, i) => ({
      day: new Date(daily.time[i]).toLocaleDateString("en-GB", { weekday: "short" }),
      high: daily.temperature_2m_max[i],
      low: daily.temperature_2m_min[i],
      condition: getWeatherCondition(daily.weather_code[i]),
    }));

    // Hourly: every 2 hours for today, starting from next even hour
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const nextEvenHour = Math.ceil((now.getHours() + 1) / 2) * 2;
    const hourly: WeatherData["hourly"] = [];
    for (let h = nextEvenHour; h <= 22; h += 2) {
      const idx = data.hourly.time.findIndex((t: string) => t === `${todayStr}T${String(h).padStart(2, "0")}:00`);
      if (idx !== -1) {
        hourly.push({
          time: `${h > 12 ? h - 12 : h}${h >= 12 ? "pm" : "am"}`,
          temp: Math.round(data.hourly.temperature_2m[idx]),
          condition: getWeatherCondition(data.hourly.weather_code[idx]),
          rainChance: data.hourly.precipitation_probability[idx] ?? 0,
        });
      }
    }

    return NextResponse.json<WeatherData>({
      temperature: current.temperature_2m,
      feelsLike: current.temperature_2m,
      condition: getWeatherCondition(current.weather_code),
      location: "Stratford, London",
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      rainChance: 0,
      sunrise: parseTime(data.daily.sunrise[0]),
      sunset: parseTime(data.daily.sunset[0]),
      forecast,
      hourly,
    });
  } catch (error) {
    console.error("Weather API error:", error);
    return NextResponse.json<WeatherData>({
      temperature: 12,
      feelsLike: 10,
      condition: "Cloudy",
      location: "Stratford, London",
      humidity: 73,
      windSpeed: 10,
      rainChance: 0,
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
      hourly: [
        { time: "12pm", temp: 14, condition: "Partly Cloudy", rainChance: 10 },
        { time: "2pm", temp: 15, condition: "Partly Cloudy", rainChance: 15 },
        { time: "4pm", temp: 14, condition: "Cloudy", rainChance: 30 },
        { time: "6pm", temp: 13, condition: "Light Rain", rainChance: 55 },
        { time: "8pm", temp: 11, condition: "Cloudy", rainChance: 20 },
        { time: "10pm", temp: 9, condition: "Clear Sky", rainChance: 5 },
      ],
    });
  }
}
