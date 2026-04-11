import { NextResponse } from "next/server";

// --- iCal parser ---
interface ParsedEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  calendar: string;
  location?: string;
}

function parseICalEvents(iCalData: string, calendarName: string): ParsedEvent[] {
  const events: ParsedEvent[] = [];
  const vevents = iCalData.split("BEGIN:VEVENT");

  for (const vevent of vevents.slice(1)) {
    const endIdx = vevent.indexOf("END:VEVENT");
    if (endIdx === -1) continue;
    const block = vevent.slice(0, endIdx);

    const getProp = (key: string): string | undefined => {
      const regex = new RegExp(`^${key}[^:]*:(.*)`, "m");
      const match = block.match(regex);
      return match ? match[1].trim() : undefined;
    };

    const uid = getProp("UID") || Math.random().toString(36).slice(2);
    const summary = getProp("SUMMARY") || "Untitled Event";
    const dtstart = getProp("DTSTART") || getProp("DTSTART;VALUE=DATE");
    const dtend = getProp("DTEND") || getProp("DTEND;VALUE=DATE");
    const rrule = getProp("RRULE");
    const location = getProp("LOCATION");
    const status = getProp("STATUS");

    // Skip cancelled events
    if (status?.toUpperCase() === "CANCELLED") continue;

    if (!dtstart) continue;

    const startDate = parseICalDate(dtstart);
    if (!startDate) continue;

    // Handle recurring events — expand RRULE for the visible window
    if (rrule) {
      const expanded = expandRecurrence(uid, summary, startDate, rrule, calendarName, location);
      events.push(...expanded);
      continue;
    }

    const endDate = dtend ? parseICalDate(dtend) : startDate;
    if (!endDate) continue;

    events.push({
      id: uid,
      title: summary,
      start: startDate,
      end: endDate,
      calendar: `Apple - ${calendarName}`,
      location: location || undefined,
    });
  }

  return events;
}

function parseICalDate(val: string): string | null {
  const clean = val.replace(/\s/g, "");

  const dtMatch = clean.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)/);
  if (dtMatch) {
    const [, y, mo, d, h, mi, s, z] = dtMatch;
    if (z === "Z") {
      return new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +s)).toISOString();
    }
    return `${y}-${mo}-${d}T${h}:${mi}:${s}`;
  }

  const dateMatch = clean.match(/^(\d{4})(\d{2})(\d{2})/);
  if (dateMatch) {
    const [, y, mo, d] = dateMatch;
    return `${y}-${mo}-${d}T00:00:00`;
  }

  return null;
}

// Expand a recurring event into individual occurrences within the display window
function expandRecurrence(
  uid: string,
  title: string,
  startDateStr: string,
  rrule: string,
  calendarName: string,
  location?: string
): ParsedEvent[] {
  const events: ParsedEvent[] = [];
  const start = new Date(startDateStr);
  const isAllDay = startDateStr.endsWith("T00:00:00");

  // Parse RRULE
  const freqMatch = rrule.match(/FREQ=(YEARLY|MONTHLY|WEEKLY|DAILY)/);
  const intervalMatch = rrule.match(/INTERVAL=(\d+)/);
  const countMatch = rrule.match(/COUNT=(\d+)/);
  const untilMatch = rrule.match(/UNTIL=(\d{8}T?\d{0,6}Z?)/);

  if (!freqMatch) return [];

  const freq = freqMatch[1];
  const interval = intervalMatch ? parseInt(intervalMatch[1]) : 1;
  const maxCount = countMatch ? parseInt(countMatch[1]) : 100;
  const untilDate = untilMatch ? new Date(parseICalDate(untilMatch[1]) || startDateStr) : null;

  // Parse BYDAY for weekly recurrence (e.g. BYDAY=MO,WE,FR)
  const byDayMatch = rrule.match(/BYDAY=([A-Z,]+)/);
  const byDays = byDayMatch
    ? byDayMatch[1].split(",").map((d) => {
        const dayMap: Record<string, number> = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };
        return dayMap[d] ?? -1;
      }).filter((d) => d >= 0)
    : null;

  // Window: today ± 30 days
  const now = new Date();
  const windowStart = new Date(now);
  windowStart.setDate(windowStart.getDate() - 30);
  const windowEnd = new Date(now);
  windowEnd.setDate(windowEnd.getDate() + 30);

  if (freq === "WEEKLY" && byDays && byDays.length > 0) {
    // For weekly with BYDAY, jump to the week containing windowStart
    // then emit events for each specified day within the window
    let weekStart = new Date(start);
    // Advance to the week containing windowStart
    while (weekStart < windowStart) {
      weekStart.setDate(weekStart.getDate() + 7 * interval);
    }
    // Go back one interval to not miss early days
    weekStart.setDate(weekStart.getDate() - 7 * interval);

    let count = 0;
    let currentWeek = new Date(weekStart);

    while (currentWeek <= windowEnd && count < maxCount) {
      for (const dayOfWeek of byDays) {
        const dayDate = new Date(currentWeek);
        dayDate.setDate(currentWeek.getDate() + ((dayOfWeek - currentWeek.getDay() + 7) % 7));

        if (dayDate >= windowStart && dayDate <= windowEnd && dayDate >= start) {
          if (untilDate && dayDate > untilDate) continue;

          const dateStr = isAllDay
            ? `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, "0")}-${String(dayDate.getDate()).padStart(2, "0")}T00:00:00`
            : `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, "0")}-${String(dayDate.getDate()).padStart(2, "0")}${startDateStr.slice(10)}`;

          events.push({
            id: `${uid}-${count}`,
            title,
            start: dateStr,
            end: dateStr,
            calendar: `Apple - ${calendarName}`,
            location: location || undefined,
          });
          count++;
        }
      }
      currentWeek.setDate(currentWeek.getDate() + 7 * interval);
    }
  } else {
    // Simple daily/weekly/monthly/yearly recurrence
    let current = new Date(start);
    let count = 0;

    while (count < maxCount) {
      if (untilDate && current > untilDate) break;
      if (current > windowEnd) break;

      if (current >= windowStart) {
        const dateStr = isAllDay
          ? `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}-${String(current.getDate()).padStart(2, "0")}T00:00:00`
          : current.toISOString();

        events.push({
          id: `${uid}-${count}`,
          title,
          start: dateStr,
          end: dateStr,
          calendar: `Apple - ${calendarName}`,
          location: location || undefined,
        });
      }

      count++;

      switch (freq) {
        case "DAILY":
          current.setDate(current.getDate() + interval);
          break;
        case "WEEKLY":
          current.setDate(current.getDate() + 7 * interval);
          break;
        case "MONTHLY":
          current.setMonth(current.getMonth() + interval);
          break;
        case "YEARLY":
          current.setFullYear(current.getFullYear() + interval);
          break;
      }
    }
  }

  return events;
}

// --- Filter events to the 2-week display window ---
function isInDisplayWindow(dateStr: string): boolean {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const windowEnd = new Date(weekStart);
  windowEnd.setDate(windowEnd.getDate() + 14);

  const eventDate = new Date(dateStr);
  return eventDate >= weekStart && eventDate < windowEnd;
}

// --- CalDAV client with caching ---
let clientPromise: Promise<any> | null = null;

async function getCaldavClient() {
  if (!process.env.ICLOUD_EMAIL || !process.env.ICLOUD_APP_PASSWORD) {
    return null;
  }

  if (!clientPromise) {
    const { createDAVClient } = await import("tsdav");
    clientPromise = createDAVClient({
      serverUrl: "https://caldav.icloud.com",
      credentials: {
        username: process.env.ICLOUD_EMAIL,
        password: process.env.ICLOUD_APP_PASSWORD,
      },
      authMethod: "Basic",
      defaultAccountType: "caldav",
    });
  }

  return clientPromise;
}

function resetClient() {
  clientPromise = null;
}

export async function GET() {
  const client = await getCaldavClient();

  if (!client) {
    return NextResponse.json([]);
  }

  try {
    const calendars = await client.fetchCalendars();
    const allEvents: ParsedEvent[] = [];

    for (const cal of calendars) {
      if (cal.components !== undefined && !cal.components.includes("VEVENT")) continue;

      try {
        const objects = await client.fetchCalendarObjects({ calendar: cal });

        const calName =
          typeof cal.displayName === "string"
            ? cal.displayName
            : cal.url?.split("/").filter(Boolean).pop() || "Calendar";

        for (const obj of objects) {
          if (obj.data && typeof obj.data === "string") {
            const parsed = parseICalEvents(obj.data, calName);
            allEvents.push(...parsed);
          }
        }
      } catch (err) {
        console.error(`Failed to fetch events for calendar ${cal.displayName || cal.url}:`, err);
      }
    }

    const filtered = allEvents.filter((e) => isInDisplayWindow(e.start));

    return NextResponse.json(filtered);
  } catch (error) {
    console.error("CalDAV error:", error);
    resetClient();
    return NextResponse.json(
      { error: "Failed to fetch calendar events" },
      { status: 502 }
    );
  }
}