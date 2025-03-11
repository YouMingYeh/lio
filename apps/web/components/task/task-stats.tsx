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
          <CardTitle className="text-sm font-medium">任務完成度</CardTitle>
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
              {stats.completed} / {stats.total} 個任務
            </div>
          </div>
          <Progress value={stats.completionRate} className="h-2 mt-2" />
          {stats.overdue > 0 && (
            <div className="flex items-center gap-2 mt-4 text-sm text-destructive">
              <Clock className="h-4 w-4" />
              <span>
                {stats.overdue} 個已逾期{stats.overdue === 1 ? "任務" : "任務"}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">任務狀態</CardTitle>
        </CardHeader>
        <CardContent className="h-[180px]">
          <div className="flex flex-col gap-2 mt-2">
            <div>進行中：{stats.total - stats.completed} 個任務</div>
            <div>已完成：{stats.completed} 個任務</div>
            <div>已逾期：{stats.overdue} 個任務</div>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            依優先度分類的任務
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[200px]">
          <div className="flex flex-col gap-2 mt-2">
            <div>低優先度：{stats.priorityCounts.low} 個任務</div>
            <div>中優先度：{stats.priorityCounts.medium} 個任務</div>
            <div>高優先度：{stats.priorityCounts.high} 個任務</div>
            <div>緊急：{stats.priorityCounts.urgent} 個任務</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
