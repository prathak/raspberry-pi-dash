"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface GroceryItem {
  id: string;
  content: string;
  completed: boolean;
  dueDate?: string;
  priority?: "high" | "medium" | "low";
}

async function fetchGroceryItems(): Promise<GroceryItem[]> {
  const res = await fetch("/api/todos");
  if (!res.ok) throw new Error("Failed to fetch todos");
  return res.json();
}

export default function GroceryList() {
  const { data: groceryItems = [], error, isLoading } = useQuery({
    queryKey: ["groceries"],
    queryFn: fetchGroceryItems,
  });

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high": return "text-red-400";
      case "medium": return "text-yellow-400";
      case "low": return "text-green-400";
      default: return "text-white/60";
    }
  };

  return (
    <div className="glass-card p-3 h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 mb-2 flex-shrink-0">
        <CheckCircle2 className="w-4 h-4 text-white/80" />
        <h2 className="text-base font-semibold text-white">Grocery List</h2>
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
        <div className="overflow-y-auto custom-scrollbar space-y-1">
          {groceryItems.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-2 p-1.5 rounded-lg bg-white/5 ${
                item.completed ? "opacity-50" : ""
              }`}
            >
              <div className="flex-shrink-0">
                {item.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-white/40" />
                )}
              </div>
              <span
                className={`flex-1 text-white text-sm ${
                  item.completed ? "line-through text-white/50" : ""
                }`}
              >
                {item.content}
              </span>
              {item.priority && (
                <span className={`text-xs ${getPriorityColor(item.priority)} flex-shrink-0`}>
                  {item.priority.toUpperCase()}
                </span>
              )}
            </div>
          ))}
          {groceryItems.length === 0 && (
            <div className="text-white/60 text-center py-4 text-sm">No groceries</div>
          )}
        </div>
      )}
    </div>
  );
}
