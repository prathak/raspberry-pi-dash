import { NextResponse } from "next/server";

interface TfLArrival {
  line: string;
  lineName: string;
  destination: string;
  destinationName: string;
  expectedArrival: string;
  timeToStation: number;
  platformName: string;
  stationName: string;
  towards: string;
  direction: string;
}

interface TubeDeparture {
  station: string;
  line: string;
  destination: string;
  time: string;
  timeToStationSecs: number;
  isDelayed?: boolean;
}

// TfL API endpoints
const STRATFORD_API = "https://api.tfl.gov.uk/StopPoint/910GSTFD/Arrivals"; // Elizabeth line at Stratford
const STRATFORD_INTL_API = "https://api.tfl.gov.uk/StopPoint/940GZZDLSIT/Arrivals"; // DLR at Stratford Int'l

async function fetchTfLData(url: string): Promise<TfLArrival[]> {
  try {
    const res = await fetch(url, {
      headers: {
        "Accept": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`TfL API error: ${res.status}`);
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`Failed to fetch from TfL: ${url}`, error);
    return [];
  }
}

function parseTimeToStation(seconds: number): string {
  if (seconds === 0) return "Due";
  if (seconds < 30) return "Due";
  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.round(seconds / 60);
  if (minutes === 1) return "1 min";
  return `${minutes} min`;
}

function normalizeLineName(lineName: string): string {
  const lineMap: Record<string, string> = {
    "central": "Central",
    "district": "District",
    "hammersmith-city": "Hammersmith & City",
    "jubilee": "Jubilee",
    "elizabeth": "Elizabeth",
    "dlr": "DLR",
    "london-overground": "Overground",
  };
  return lineMap[lineName.toLowerCase()] || lineName;
}

export async function GET(request: Request) {
  const [stratfordArrivals, stratfordIntlArrivals] = await Promise.all([
    fetchTfLData(STRATFORD_API),
    fetchTfLData(STRATFORD_INTL_API),
  ]);

  const departures: TubeDeparture[] = [
    // Stratford International: DLR only - show first 2
    ...stratfordIntlArrivals
      .filter((arrival) => arrival.lineName.toLowerCase() === "dlr")
      .slice(0, 2)
      .map((arrival) => ({
        station: "Stratford Int'l",
        line: normalizeLineName(arrival.lineName),
        destination: arrival.destinationName,
        time: parseTimeToStation(arrival.timeToStation),
        timeToStationSecs: arrival.timeToStation,
        isDelayed: arrival.timeToStation > 120,
      })),
    // Stratford: Elizabeth line towards Paddington or Heathrow only (outbound)
    ...stratfordArrivals
      .filter((arrival) => {
        const line = arrival.lineName.toLowerCase();
        const direction = arrival.direction.toLowerCase();
        const destination = arrival.destinationName.toLowerCase();
        return line.includes("elizabeth") && direction === "outbound" && (destination.includes("paddington") || destination.includes("heathrow"));
      })
      .map((arrival) => ({
        station: "Stratford",
        line: normalizeLineName(arrival.lineName),
        destination: arrival.destinationName,
        time: parseTimeToStation(arrival.timeToStation),
        timeToStationSecs: arrival.timeToStation,
        isDelayed: arrival.timeToStation > 120,
      })),
  ];

  // Sort: Stratford Int'l first, then by time
  departures.sort((a, b) => {
    if (a.station !== b.station) {
      return a.station === "Stratford Int'l" ? -1 : 1;
    }
    return a.timeToStationSecs - b.timeToStationSecs;
  });

  return NextResponse.json(departures.slice(0, 10));
}
