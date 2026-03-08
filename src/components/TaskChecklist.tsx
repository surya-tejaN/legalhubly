import { useState } from "react";
import { CheckCircle2, Circle, Clock, AlertCircle, Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: "high" | "medium" | "low";
  completed: boolean;
  assignedBy: string;
  caseName: string;
}

const priorityStyles = {
  high: "border-l-destructive",
  medium: "border-l-warning",
  low: "border-l-success",
};

export default function TaskChecklist({ tasks: initialTasks }: { tasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks);

  const toggle = (id: string) => {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const pending = tasks.filter((t) => !t.completed);
  const completed = tasks.filter((t) => t.completed);

  return (
    <div className="space-y-3">
      {pending.length > 0 && (
        <div className="space-y-2">
          {pending.map((task) => (
            <motion.div
              key={task.id}
              layout
              className={cn(
                "p-3.5 rounded-lg bg-card border border-l-[3px] cursor-pointer hover:bg-muted/20 transition-colors",
                priorityStyles[task.priority]
              )}
              onClick={() => toggle(task.id)}
            >
              <div className="flex items-start gap-3">
                <Circle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground">{task.title}</div>
                  {task.description && <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>}
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Scale className="h-2.5 w-2.5" />{task.caseName}</span>
                    {task.dueDate && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" /> Due {task.dueDate}
                      </span>
                    )}
                    <span>From: {task.assignedBy}</span>
                  </div>
                </div>
                {task.priority === "high" && <AlertCircle className="h-4 w-4 text-destructive shrink-0" />}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {completed.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-4 mb-2">
            Completed ({completed.length})
          </div>
          {completed.map((task) => (
            <motion.div
              key={task.id}
              layout
              className="p-3 rounded-lg bg-muted/30 border border-border/50 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => toggle(task.id)}
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                <span className="text-sm text-muted-foreground line-through">{task.title}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
