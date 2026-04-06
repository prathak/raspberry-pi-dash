import { NextResponse } from "next/server";

interface TubeDeparture {
  station: string;
  line: string;
  destination: string;
  time: string;
  isDelayed?: boolean;
}

// Mock data - replace with actual TfL API integration
// TfL API: https://api.tfl.gov.uk/
const mockDepartures: TubeDeparture[] = [
  // Stratford Station
  { station: "Stratford", line: "Central", destination: "Liverpool Street", time: "2 min" },
  { station: "Stratford", line: "Central", destination: "Ealing Broadway", time: "5 min" },
  { station: "Stratford", line: "Jubilee", destination: "Canary Wharf", time: "4 min" },
  { station: "Stratford", line: "Jubilee", destination: "Stanmore", time: "8 min" },
  { station: "Stratford", line: "Elizabeth", destination: "Liverpool Street", time: "3 min" },
  { station: "Stratford", line: "Elizabeth", destination: "Paddington", time: "7 min" },
  { station: "Stratford", line: "DLR", destination: "Canary Wharf", time: "6 min" },
  { station: "Stratford", line: "DLR", destination: "Lewisham", time: "10 min" },
  { station: "Stratford", line: "Overground", destination: "Highbury & Islington", time: "9 min" },
  // Stratford International
  { station: "Stratford Int'l", line: "DLR", destination: "Canary Wharf", time: "5 min" },
  { station: "Stratford Int'l", line: "DLR", destination: "Woolwich", time: "12 min" },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const stationsParam = searchParams.get("stations");

  let filteredStations = ["Stratford", "Stratford Int'l"];
  if (stationsParam) {
    filteredStations = stationsParam.split(",").map(s => s.trim());
  }

  // TODO: Implement actual TfL API integration
  // Stratford: https://api.tfl.gov.uk/Stop/940GZZSTSTD/Arrivals
  // Stratford International: https://api.tfl.gov.uk/Stop/940GZZSTSTI/Arrivals

  const filtered = mockDepartures.filter(d =>
    filteredStations.some(s => d.station.includes(s.replace(" Int'l", " International")) || d.station.includes(s))
  );

  return NextResponse.json(filtered);
}
