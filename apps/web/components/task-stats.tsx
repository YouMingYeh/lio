"use client";

import { Task } from "@/types/database";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Progress } from "@workspace/ui/components/progress";
import { CheckCircle2, Clock } from "lucide-react";
import { useMemo } from "react";

interface TaskStatsProps {
  tasks: Task[];
}

export default function TaskStats({ tasks }: TaskStatsProps) {
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.completed).length;
    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    const overdue = tasks.filter(
      (task) =>
        task.dueAt && new Date(task.dueAt) < new Date() && !task.completed,
    ).length;

    const priorityCounts = {
      low: tasks.filter((task) => task.priority === "low").length,
      medium: tasks.filter((task) => task.priority === "medium").length,
      high: tasks.filter((task) => task.priority === "high").length,
      urgent: tasks.filter((task) => task.priority === "urgent").length,
    };

    return {
      total,
      completed,
      completionRate,
      overdue,
      priorityCounts,
    };
  }, [tasks]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Task Completion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-2xl font-bold">
                {stats.completionRate}%
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              {stats.completed} of {stats.total} tasks
            </div>
          </div>
          <Progress value={stats.completionRate} className="h-2 mt-2" />
          {stats.overdue > 0 && (
            <div className="flex items-center gap-2 mt-4 text-sm text-destructive">
              <Clock className="h-4 w-4" />
              <span>
                {stats.overdue} overdue {stats.overdue === 1 ? "task" : "tasks"}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Task Status</CardTitle>
        </CardHeader>
        <CardContent className="h-[180px]"></CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Tasks by Priority
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[200px]"></CardContent>
      </Card>
    </div>
  );
}
