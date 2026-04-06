import { NextResponse } from "next/server";

// Mock data - replace with actual Todoist/Google Tasks API integration
let mockTodos = [
  {
    id: "1",
    content: "Buy groceries",
    completed: false,
    priority: "medium",
  },
  {
    id: "2",
    content: "Finish project report",
    completed: false,
    priority: "high",
    dueDate: new Date().toISOString(),
  },
  {
    id: "3",
    content: "Call mum",
    completed: false,
    priority: "medium",
  },
  {
    id: "4",
    content: "Water plants",
    completed: true,
    priority: "low",
  },
];

export async function GET() {
  return NextResponse.json(mockTodos);
}

export async function POST(request: Request) {
  const body = await request.json();
  const newTodo = {
    id: String(Date.now()),
    content: body.content,
    completed: false,
    priority: body.priority || "medium",
  };
  mockTodos.push(newTodo);
  return NextResponse.json(newTodo);
}

