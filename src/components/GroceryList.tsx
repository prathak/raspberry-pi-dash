"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Circle, CheckCircle2, AlertCircle } from "lucide-react";

interface Task {
  id: string;
  content: string;
  completed: boolean;
  priority: number;
  sectionId: string | null;
  sectionName: string | null;
  dueDate: string | null;
}

interface Section {
  id: string;
  name: string;
}

interface TodosData {
  sections: Section[];
  tasks: Task[];
}

async function fetchTodos(): Promise<TodosData> {
  const res = await fetch("/api/todos");
  if (!res.ok) throw new Error("Failed to fetch todos");
  return res.json();
}

async function toggleTask({ id, completed }: { id: string; completed: boolean }) {
  const res = await fetch("/api/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, completed }),
  });
  if (!res.ok) throw new Error("Failed to toggle task");
  return res.json();
}

export default function GroceryList() {
  const queryClient = useQueryClient();
  const { data, error, isLoading } = useQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos,
    refetchInterval: 30000,
  });

  const toggleMutation = useMutation({
    mutationFn: toggleTask,
    onMutate: async ({ id, completed }) => {
      await queryClient.cancelQueries({ queryKey: ["todos"] });
      const previous = queryClient.getQueryData<TodosData>(["todos"]);
      queryClient.setQueryData<TodosData>(["todos"], (old) => {
        if (!old) return old;
        return {
          ...old,
          tasks: old.tasks.map((t) =>
            t.id === id ? { ...t, completed } : t
          ),
        };
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["todos"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const tasks = data?.tasks ?? [];
  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div className="glass-card p-3 h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 mb-2 flex-shrink-0">
        <span className="text-lg">🛒</span>
        <h2 className="text-base font-bold bg-gradient-to-r from-emerald-300 to-teal-400 bg-clip-text text-transparent">Grocery List</h2>
        {activeTasks.length > 0 && (
          <span className="text-xs text-white/40 ml-auto">{activeTasks.length} left</span>
        )}
      </div>

      {isLoading && (
        <div className="text-white/60 text-center py-4 text-sm">Loading...</div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-400 py-2">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">Failed to load</span>
        </div>
      )}

      {!isLoading && !error && (
        <div className="overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 gap-x-3">
            {activeTasks.map((item) => (
              <button
                key={item.id}
                onClick={() =>
                  toggleMutation.mutate({ id: item.id, completed: true })
                }
                className="flex items-center gap-1.5 py-0.5 text-left hover:bg-white/10 rounded transition-colors"
              >
                <Circle className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
                <span className="text-white text-[15px] truncate">{item.content}</span>
              </button>
            ))}
            {completedTasks.map((item) => (
              <button
                key={item.id}
                onClick={() =>
                  toggleMutation.mutate({ id: item.id, completed: false })
                }
                className="flex items-center gap-1.5 py-0.5 text-left hover:bg-white/10 rounded transition-colors opacity-40"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                <span className="text-white/50 text-[15px] truncate line-through">{item.content}</span>
              </button>
            ))}
          </div>
          {tasks.length === 0 && (
            <div className="text-white/60 text-center py-4 text-sm">No groceries</div>
          )}
        </div>
      )}
    </div>
  );
}