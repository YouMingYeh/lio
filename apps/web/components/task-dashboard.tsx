"use client";

import TaskForm from "@/components/task-form";
import TaskList from "@/components/task-list";
import TaskStats from "@/components/task-stats";
import { useUser } from "@/hooks/use-user";
import {
  createTask,
  deleteTaskById,
  getTasksByUserId,
  updateTaskById,
} from "@/lib/data/task/action";
import { Task, TaskInsert, TaskUpdate } from "@/types/database";
import { Button } from "@workspace/ui/components/button";
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { cn } from "@workspace/ui/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  Plus,
  BarChart2,
  List,
  Calendar,
  Filter,
  Sun,
  Moon,
  ArrowDownUp,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { toast } from "sonner";

type SortOption = "priority" | "dueDate" | "createdAt";

export default function TaskDashboard() {
  const { user } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>("priority");
  const [view, setView] = useState<"list" | "stats">("list");
  const [incompleteFirst, setIncompleteFirst] = useState(true);
  const [customOrder, setCustomOrder] = useState<string[]>([]);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) {
        toast.error("Failed to fetch tasks");
        return;
      }
      const { data } = await getTasksByUserId(user.id);
      if (!data) {
        toast.error("Failed to fetch tasks");
        return;
      }
      setTasks(data);
    };
    fetchTasks();
  }, [user]);

  useEffect(() => {
    // Load custom order from localStorage
    const savedOrder = localStorage.getItem("tasksOrder");
    if (savedOrder) {
      setCustomOrder(JSON.parse(savedOrder));
    }
  }, []);

  useEffect(() => {
    // Save custom order to localStorage whenever it changes
    localStorage.setItem("tasksOrder", JSON.stringify(customOrder));
  }, [customOrder]);

  const addTask = async (task: TaskInsert) => {
    const { data } = await createTask(task);
    if (!data) {
      toast.error("Failed to add task");
      return;
    }
    setTasks((prev) => [...prev, data]);
    setCustomOrder((prev) => [...prev, data.id]);
    toast.success("Task added");
  };

  const updateTask = async (id: string, updatedTask: TaskUpdate) => {
    const { data } = await updateTaskById(id, updatedTask);
    if (!data) {
      toast.error("Failed to update task");
      return;
    }
    const updatedTasks = tasks.map((task) =>
      task.id === updatedTask.id ? data : task,
    );
    setTasks(updatedTasks);
    toast.success("Task updated");
  };

  const deleteTask = async (id: string) => {
    const { error } = await deleteTaskById(id);
    if (error) {
      toast.error("Failed to delete task");
      return;
    }
    const updatedTasks = tasks.filter((task) => task.id !== id);
    setTasks(updatedTasks);
    setCustomOrder((prev) => prev.filter((taskId) => taskId !== id));
    toast.success("Task deleted");
  };

  const toggleTaskCompletion = (id: string) => {
    const taskToToggle = tasks.find((t) => t.id === id);
    if (taskToToggle) {
      const updatedTask = {
        ...taskToToggle,
        completed: !taskToToggle.completed,
      };
      const newTasks = tasks.map((task) =>
        task.id === id ? updatedTask : task,
      );
      setTasks(newTasks);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingTask(null);
  };

  const handleReorderTasks = (reorderedTasks: Task[]) => {
    // Update the custom order based on the reordered tasks
    const newOrder = reorderedTasks.map((task) => task.id);
    setCustomOrder(newOrder);
    setTasks(reorderedTasks);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const toggleIncompleteFirst = () => {
    setIncompleteFirst(!incompleteFirst);
  };

  const sortTasks = (tasksToSort: Task[]): Task[] => {
    // First separate completed and incomplete tasks if incompleteFirst is true
    let sortedTasks = [...tasksToSort];

    if (incompleteFirst) {
      // Sort by completion status first (incomplete tasks first)
      sortedTasks.sort((a, b) => {
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        return 0;
      });
    }

    // Then apply custom order within each group (completed/incomplete)
    if (customOrder.length > 0) {
      // Create a map for O(1) lookup of task position
      const orderMap = new Map(customOrder.map((id, index) => [id, index]));

      // If incompleteFirst is true, sort within each group
      if (incompleteFirst) {
        const incompleteTasks = sortedTasks.filter((task) => !task.completed);
        const completedTasks = sortedTasks.filter((task) => task.completed);

        // Sort incomplete tasks by custom order
        incompleteTasks.sort((a, b) => {
          const aPos = orderMap.has(a.id)
            ? orderMap.get(a.id)!
            : Number.MAX_SAFE_INTEGER;
          const bPos = orderMap.has(b.id)
            ? orderMap.get(b.id)!
            : Number.MAX_SAFE_INTEGER;
          return aPos - bPos;
        });

        // Sort completed tasks by custom order
        completedTasks.sort((a, b) => {
          const aPos = orderMap.has(a.id)
            ? orderMap.get(a.id)!
            : Number.MAX_SAFE_INTEGER;
          const bPos = orderMap.has(b.id)
            ? orderMap.get(b.id)!
            : Number.MAX_SAFE_INTEGER;
          return aPos - bPos;
        });

        // Combine the two sorted arrays
        sortedTasks = [...incompleteTasks, ...completedTasks];
      } else {
        // If not separating by completion status, just sort everything by custom order
        sortedTasks.sort((a, b) => {
          const aPos = orderMap.has(a.id)
            ? orderMap.get(a.id)!
            : Number.MAX_SAFE_INTEGER;
          const bPos = orderMap.has(b.id)
            ? orderMap.get(b.id)!
            : Number.MAX_SAFE_INTEGER;
          return aPos - bPos;
        });
      }

      return sortedTasks;
    }

    // Apply regular sorting within each group if no custom order
    // or if we're not separating by completion status
    if (!incompleteFirst || customOrder.length === 0) {
      // Get the groups
      const incompleteTasks = sortedTasks.filter((task) => !task.completed);
      const completedTasks = sortedTasks.filter((task) => task.completed);

      // Sort each group by the selected sort option
      const sortByOption = (tasks: Task[]) => {
        return tasks.sort((a, b) => {
          if (sortOption === "priority") {
            const priorityOrder = ["low", "medium", "high", "urgent"];
            return (
              priorityOrder.indexOf(a.priority) -
              priorityOrder.indexOf(b.priority)
            );
          } else if (sortOption === "dueDate") {
            if (!a.dueAt) return 1;
            if (!b.dueAt) return -1;
            return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
          } else {
            // Sort by creation date (newest first)
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          }
        });
      };

      const sortedIncomplete = sortByOption(incompleteTasks);
      const sortedComplete = sortByOption(completedTasks);

      // Combine the sorted groups
      return incompleteFirst
        ? [...sortedIncomplete, ...sortedComplete]
        : sortByOption(sortedTasks);
    }

    return sortedTasks;
  };

  const sortedTasks = sortTasks(tasks);

  return (
    <div className="container max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col gap-4">
        <Tabs
          defaultValue="list"
          value={view}
          onValueChange={(v) => setView(v as "list" | "stats")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 ">
            <TabsTrigger value="list" className="gap-1 ">
              <List className="h-4 w-4" />
              <span>List</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-1 ">
              <BarChart2 className="h-4 w-4" />
              <span>Stats</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-nowrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "gap-1 rounded-full",
                sortOption === "priority" && "bg-primary/10",
              )}
              onClick={() => setSortOption("priority")}
            >
              <Filter className="h-3.5 w-3.5" />
              <span>Priority</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className={cn(
                "gap-1 rounded-full",
                sortOption === "dueDate" && "bg-primary/10",
              )}
              onClick={() => setSortOption("dueDate")}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Due Date</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className={cn(
                "gap-1 rounded-full",
                incompleteFirst && "bg-primary/10",
              )}
              onClick={toggleIncompleteFirst}
            >
              <ArrowDownUp className="h-3.5 w-3.5" />
              <span>
                {incompleteFirst ? "Incomplete First" : "Custom Order"}
              </span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={toggleTheme}
              title={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>

            <Button
              onClick={() => setIsFormOpen(true)}
              className="gap-1 rounded-full h-10 w-10"
              size="sm"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === "list" ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <TaskList
              tasks={sortedTasks}
              onToggleCompletion={toggleTaskCompletion}
              onEdit={handleEditTask}
              onDelete={deleteTask}
              onReorder={handleReorderTasks}
            />
          </motion.div>
        ) : (
          <motion.div
            key="stats"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <TaskStats tasks={tasks} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isFormOpen && (
          <TaskForm
            onUpdate={updateTask}
            onInsert={addTask}
            onClose={handleFormClose}
            initialData={editingTask}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
