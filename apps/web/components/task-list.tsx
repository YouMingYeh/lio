"use client";

import TaskItem from "@/components/task-item";
import { Task } from "@/types/database";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
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

  // Handle manual reordering (drag and drop)
  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
    index: number,
  ) => {
    // Safely access the drag information
    if (!info || typeof info.offset?.y !== "number") {
      return; // Exit if we don't have valid drag info
    }

    const offsetY = info.offset.y;
    const velocityY = info.velocity?.y || 0;

    // Only reorder if there was significant drag
    if (Math.abs(offsetY) > 50 || Math.abs(velocityY) > 500) {
      const newIndex = calculateNewIndex(index, offsetY);
      if (newIndex !== index) {
        const newTasks = [...localTasks];
        const [movedItem] = newTasks.splice(index, 1);
        if (movedItem) {
          newTasks.splice(newIndex, 0, movedItem);
          setLocalTasks(newTasks);
          onReorder(newTasks);
        }
      }
    }
  };

  // Calculate new index based on drag distance
  const calculateNewIndex = (currentIndex: number, offsetY: number) => {
    // Estimate how many items to move based on offset
    const itemHeight = 100; // Approximate height of an item in pixels
    const moveCount = Math.round(offsetY / itemHeight);

    let newIndex = currentIndex + moveCount;
    // Ensure new index is within bounds
    newIndex = Math.max(0, Math.min(localTasks.length - 1, newIndex));

    return newIndex;
  };

  if (tasks.length === 0) {
    return (
      <Alert variant="default" className="bg-muted/20 border-dashed">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No tasks yet. Click the &quot;New Task&quot; button to add one.
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
          <motion.li
            key={task.id}
            variants={item}
            layout
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.1}
            onDragEnd={(_, info) => handleDragEnd(_, info, index)}
            whileDrag={{
              scale: 1.02,
              boxShadow:
                "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
              zIndex: 50,
            }}
          >
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
