"use client";

import { Task } from "@/types/database";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Separator } from "@workspace/ui/components/separator";
import { cn } from "@workspace/ui/lib/utils";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Pencil, Trash2, Clock, Flag, MoreHorizontal } from "lucide-react";
import { useState, useEffect } from "react";

interface TaskItemProps {
  task: Task;
  onToggleCompletion: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  index: number;
}

export default function TaskItem({
  task,
  onToggleCompletion,
  onEdit,
  onDelete,
  index,
}: TaskItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const priorityColors = {
    low: { text: "text-green-600", bg: "bg-green-100 dark:bg-green-950" },
    medium: { text: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-950" },
    high: { text: "text-yellow-600", bg: "bg-yellow-100 dark:bg-yellow-950" },
    urgent: { text: "text-red-600", bg: "bg-red-100 dark:bg-red-950" },
  };

  const priorityLabels = {
    low: "Low",
    medium: "Medium",
    high: "High",
    urgent: "Urgent",
  };

  const handleToggleCompletion = () => {
    onToggleCompletion(task.id);
  };

  return (
    <motion.div
      className={cn(
        "group flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-accent/30 bg-card",
        task.completed ? "border-muted" : "border-border",
      )}
      whileHover={{ scale: 1.005 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
        opacity: { duration: 0.2 },
        layout: { type: "spring", stiffness: 300, damping: 30 },
      }}
    >
      <div className="flex items-center h-6 mt-0.5">
        <Checkbox
          checked={task.completed}
          onCheckedChange={handleToggleCompletion}
          className="w-6 h-6 rounded-md transition-all duration-300 border-2"
        />
      </div>
      <div className="flex-1 space-y-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <motion.h3
              className={cn(
                "font-medium leading-none transition-all duration-300",
                task.completed && "text-muted-foreground",
              )}
              layout
            >
              <motion.span
                initial={false}
                animate={{
                  textDecoration: task.completed ? "line-through" : "none",
                  opacity: task.completed ? 0.7 : 1,
                }}
                transition={{ duration: 0.3 }}
              >
                {task.title}
              </motion.span>
            </motion.h3>
          </div>
          <div className="text-sm text-muted-foreground whitespace-nowrap">
            {format(currentTime, "h:mm a")}
          </div>
        </div>
        {task.description && (
          <motion.p
            className={cn(
              "text-sm text-muted-foreground transition-all duration-300",
              task.completed && "line-through opacity-70",
            )}
            layout
          >
            {task.description}
          </motion.p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "flex items-center gap-1 text-xs px-2 py-1",
                priorityColors[task.priority as keyof typeof priorityColors]
                  .text,
                priorityColors[task.priority as keyof typeof priorityColors].bg,
                "border-none",
              )}
            >
              <Flag className="h-3 w-3" />
              <span>
                {priorityLabels[task.priority as keyof typeof priorityLabels]}
              </span>
            </Badge>

            {task.dueAt && (
              <Badge
                variant="outline"
                className={cn(
                  "flex items-center gap-1 text-xs px-2 py-1",
                  new Date(task.dueAt) < new Date() && !task.completed
                    ? "text-destructive bg-destructive/10"
                    : "text-muted-foreground bg-muted",
                  "border-none",
                )}
              >
                <Clock className="h-3 w-3" />
                <span>{format(new Date(task.dueAt), "MMM d")}</span>
              </Badge>
            )}
          </div>

          <div className="flex items-center border rounded-full overflow-hidden">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-none"
              onClick={() => onEdit(task)}
            >
              <Pencil className="h-3 w-3" />
              <span className="sr-only">Edit</span>
            </Button>

            <Separator orientation="vertical" className="h-5" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-none"
                >
                  <MoreHorizontal className="h-3 w-3" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuItem
                  onClick={() => onDelete(task.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-3 w-3" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
