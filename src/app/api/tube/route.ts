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
  times: number[]; // timeToStation in seconds for next 4 trains
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

function cleanDestination(name: string): string {
  return name
    .replace(/\s*(DLR|Underground|Rail|London Overground)\s*Station/gi, "")
    .replace(/\s*Terminal\s*\d+/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeLineName(lineName: string): string {
  const lineMap: Record<string, string> = {
    "central": "Central",
    "district": "District",
    "hammersmith-city": "Hammersmith & City",
    "jubilee": "Jubilee",
    "elizabeth": "Elizabeth line",
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

  const allArrivals = [
    // Stratford International: DLR only
    ...stratfordIntlArrivals
      .filter((arrival) => arrival.lineName.toLowerCase() === "dlr")
      .map((arrival) => ({
        station: "Stratford Int'l",
        line: normalizeLineName(arrival.lineName),
        destination: cleanDestination(arrival.destinationName),
        timeToStationSecs: arrival.timeToStation,
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
        destination: cleanDestination(arrival.destinationName),
        timeToStationSecs: arrival.timeToStation,
      })),
  ];

  // Sort by time within each group
  allArrivals.sort((a, b) => a.timeToStationSecs - b.timeToStationSecs);

  // Group by (station, line, destination) and collect up to 4 times
  // For Elizabeth line, only include times > 10 min (600s)
  const ELIZABETH_MIN_SECS = 600;
  const groupMap = new Map<string, TubeDeparture>();
  for (const arrival of allArrivals) {
    const key = `${arrival.station}|${arrival.line}|${arrival.destination}`;
    // Skip Elizabeth line times under 10 min
    if (arrival.line === "Elizabeth line" && arrival.timeToStationSecs < ELIZABETH_MIN_SECS) continue;
    const existing = groupMap.get(key);
    if (existing) {
      if (existing.times.length < 4) {
        existing.times.push(arrival.timeToStationSecs);
      }
    } else {
      groupMap.set(key, {
        station: arrival.station,
        line: arrival.line,
        destination: arrival.destination,
        times: [arrival.timeToStationSecs],
      });
    }
  }

  // Sort groups: Stratford Int'l first, then by soonest time
  const departures = Array.from(groupMap.values()).sort((a, b) => {
    if (a.station !== b.station) {
      return a.station === "Stratford Int'l" ? -1 : 1;
    }
    return a.times[0] - b.times[0];
  });

  return NextResponse.json(departures.slice(0, 6));
}
