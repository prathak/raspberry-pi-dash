import { NextResponse } from "next/server";

// Mock data - replace with actual Apple/Google Calendar API integration
const mockEvents = [
  {
    id: "1",
    title: "Team Standup",
    start: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    end: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    calendar: "Google - Work",
    location: "Zoom",
  },
  {
    id: "2",
    title: "Dentist Appointment",
    start: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    end: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    calendar: "Apple - Personal",
    location: "London Bridge",
  },
  {
    id: "3",
    title: "Lunch with Sarah",
    start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    end: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
    calendar: "Google - Personal",
  },
  {
    id: "4",
    title: "Project Review",
    start: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
    end: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
    calendar: "Apple - Work",
    location: "Office",
  },
  {
    id: "5",
    title: "Gym Session",
    start: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    end: new Date(Date.now() + 49 * 60 * 60 * 1000).toISOString(),
    calendar: "Google - Personal",
  },
];

export async function GET() {
  // TODO: Implement actual calendar API integration
  // - Google Calendar API: https://developers.google.com/calendar/api/v3/reference/events/list
  // - Apple Calendar: Use CalDAV or iCloud API

  return NextResponse.json(mockEvents);
}
