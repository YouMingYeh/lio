"use client";

import TaskItem from "@/components/task/task-item";
import { Task } from "@/types/database";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

interface TaskListProps {
  tasks: Task[];
  onToggleCompletion: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onReorder: (tasks: Task[]) => void;
}

export default function TaskList({
  tasks,
  onToggleCompletion,
  onEdit,
  onDelete,
  onReorder,
}: TaskListProps) {
  const [localTasks, setLocalTasks] = useState(tasks);

  // Update local state when tasks prop changes
  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  if (tasks.length === 0) {
    return (
      <Alert variant="default" className="bg-muted border-dashed">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          暫無任務。請點擊「新增任務」按鈕來添加一個。
        </AlertDescription>
      </Alert>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // Increased stagger effect
        delayChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  };

  return (
    <motion.ul
      className="space-y-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <AnimatePresence initial={false}>
        {localTasks.map((task, index) => (
          <motion.li key={task.id} variants={item} layout>
            <TaskItem
              task={task}
              onToggleCompletion={onToggleCompletion}
              onEdit={onEdit}
              onDelete={onDelete}
              index={index}
            />
          </motion.li>
        ))}
      </AnimatePresence>
    </motion.ul>
  );
}
