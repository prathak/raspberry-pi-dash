import { NextResponse } from "next/server";

const TODOIST_API_KEY = process.env.TODOIST_API_KEY;
const PROJECT_ID = process.env.TODOIST_PROJECT_ID || "6gMWR4RHWxq5c78j";
const TODOIST_BASE = "https://api.todoist.com/api/v1";

async function todoistFetch(endpoint: string, options?: RequestInit) {
  const res = await fetch(`${TODOIST_BASE}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${TODOIST_API_KEY}`,
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    throw new Error(`Todoist API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function GET() {
  try {
    const [tasksData, sectionsData] = await Promise.all([
      todoistFetch(`/tasks?project_id=${PROJECT_ID}`),
      todoistFetch(`/sections?project_id=${PROJECT_ID}`),
    ]);

    const sections = sectionsData.results.map((s: { id: string; name: string }) => ({
      id: s.id,
      name: s.name,
    }));

    const sectionMap = new Map(sections.map((s: { id: string; name: string }) => [s.id, s.name]));

    const tasks = tasksData.results.map((t: {
      id: string;
      content: string;
      checked: boolean;
      priority: number;
      section_id: string | null;
      due: { date: string } | null;
    }) => ({
      id: t.id,
      content: t.content,
      completed: t.checked,
      priority: t.priority,
      sectionId: t.section_id,
      sectionName: t.section_id ? sectionMap.get(t.section_id) ?? null : null,
      dueDate: t.due?.date ?? null,
    }));

    return NextResponse.json({ sections, tasks });
  } catch (error) {
    console.error("Failed to fetch Todoist data:", error);
    return NextResponse.json(
      { error: "Failed to fetch todos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { id, completed } = await request.json();

    if (!id || typeof completed !== "boolean") {
      return NextResponse.json(
        { error: "Missing id or completed field" },
        { status: 400 }
      );
    }

    const endpoint = completed ? `/tasks/${id}/close` : `/tasks/${id}/reopen`;
    await todoistFetch(endpoint, { method: "POST" });

    return NextResponse.json({ id, completed });
  } catch (error) {
    console.error("Failed to toggle Todoist task:", error);
    return NextResponse.json(
      { error: "Failed to toggle task" },
      { status: 500 }
    );
  }
}