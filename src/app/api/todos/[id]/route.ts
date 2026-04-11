import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

const TODOIST_API_KEY = process.env.TODOIST_API_KEY;
const TODOIST_BASE = "https://api.todoist.com/api/v1";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  try {
    const endpoint = body.completed
      ? `${TODOIST_BASE}/tasks/${id}/close`
      : `${TODOIST_BASE}/tasks/${id}/reopen`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TODOIST_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`Todoist API error: ${res.status}`);
    }

    return NextResponse.json({ id, completed: body.completed });
  } catch (error) {
    console.error("Failed to toggle task:", error);
    return NextResponse.json(
      { error: "Failed to toggle task" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const res = await fetch(`${TODOIST_BASE}/tasks/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${TODOIST_API_KEY}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Todoist API error: ${res.status}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}