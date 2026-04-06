import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

// Mock data - should be imported from a shared store
let mockTodos: Array<{
  id: string;
  content: string;
  completed: boolean;
  priority?: string;
  dueDate?: string;
}> = [];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  // In production, fetch from database
  // For now, use a simple in-memory store simulation
  const todo = mockTodos.find((t) => t.id === id) || {
    id,
    content: "Todo item",
    completed: false,
  };

  todo.completed = body.completed;

  return NextResponse.json(todo);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // In production, delete from database
  return NextResponse.json({ success: true });
}
