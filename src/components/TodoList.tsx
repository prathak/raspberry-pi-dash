"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Circle, AlertCircle, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface Todo {
  id: string;
  content: string;
  completed: boolean;
  dueDate?: string;
  priority?: "high" | "medium" | "low";
}

async function fetchTodos(): Promise<Todo[]> {
  const res = await fetch("/api/todos");
  if (!res.ok) throw new Error("Failed to fetch todos");
  return res.json();
}

async function toggleTodo(id: string, completed: boolean): Promise<void> {
  const res = await fetch(`/api/todos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed }),
  });
  if (!res.ok) throw new Error("Failed to update todo");
}

async function addTodo(content: string): Promise<void> {
  const res = await fetch("/api/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error("Failed to add todo");
}

async function deleteTodo(id: string): Promise<void> {
  const res = await fetch(`/api/todos/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete todo");
}

export default function TodoList() {
  const [newTodo, setNewTodo] = useState("");
  const queryClient = useQueryClient();

  const { data: todos = [], error, isLoading } = useQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      toggleTodo(id, completed),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
  });

  const addMutation = useMutation({
    mutationFn: addTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      setNewTodo("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTodo,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
  });

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      addMutation.mutate(newTodo.trim());
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high": return "text-red-400";
      case "medium": return "text-yellow-400";
      case "low": return "text-green-400";
      default: return "text-white/60";
    }
  };

  return (
    <div className="glass-card p-6 h-full">
      <div className="flex items-center gap-3 mb-4">
        <CheckCircle2 className="w-6 h-6 text-white/80" />
        <h2 className="text-xl font-semibold text-white">Todo List</h2>
      </div>

      {isLoading && (
        <div className="text-white/60 text-center py-8">Loading todos...</div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-400 py-8">
          <AlertCircle className="w-5 h-5" />
          <span>Failed to load todos</span>
        </div>
      )}

      <form onSubmit={handleAddTodo} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a task..."
            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-white/40"
          />
          <button
            type="submit"
            disabled={addMutation.isPending}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>
      </form>

      {!isLoading && !error && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className={`flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-glass group ${
                todo.completed ? "opacity-60" : ""
              }`}
            >
              <button
                onClick={() => toggleMutation.mutate({ id: todo.id, completed: !todo.completed })}
                className="flex-shrink-0"
              >
                {todo.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                ) : (
                  <Circle className="w-5 h-5 text-white/40 hover:text-white/80" />
                )}
              </button>
              <span
                className={`flex-1 text-white ${
                  todo.completed ? "line-through text-white/50" : ""
                }`}
              >
                {todo.content}
              </span>
              {todo.priority && (
                <span className={`text-xs ${getPriorityColor(todo.priority)}`}>
                  {todo.priority}
                </span>
              )}
              <button
                onClick={() => deleteMutation.mutate(todo.id)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-opacity"
              >
                <Trash2 className="w-4 h-4 text-white/40 hover:text-red-400" />
              </button>
            </div>
          ))}
          {todos.length === 0 && (
            <div className="text-white/60 text-center py-4">No tasks yet</div>
          )}
        </div>
      )}
    </div>
  );
}
