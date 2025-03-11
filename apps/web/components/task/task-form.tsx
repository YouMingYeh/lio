"use client";

import { useUser } from "@/hooks/use-user";
import { Task, TaskInsert, TaskUpdate } from "@/types/database";
import { Button } from "@workspace/ui/components/button";
import { Calendar } from "@workspace/ui/components/calendar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Textarea } from "@workspace/ui/components/textarea";
import { TimePicker } from "@workspace/ui/components/time-picker";
import { cn } from "@workspace/ui/lib/utils";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { motion } from "framer-motion";
import { CalendarIcon, X } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

interface TaskFormProps {
  onUpdate: (id: string, task: TaskUpdate) => Promise<void>;
  onInsert: (task: TaskInsert) => Promise<void>;
  onClose: () => void;
  initialData?: Task | null;
}

export default function TaskForm({
  onUpdate,
  onInsert,
  onClose,
  initialData,
}: TaskFormProps) {
  const { user } = useUser();
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [priority, setPriority] = useState<string>(
    initialData?.priority.toString() || "medium",
  );
  const [dueDate, setDueDate] = useState<Date | undefined>(
    initialData?.dueAt ? new Date(initialData.dueAt) : undefined,
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Focus the title input when the form opens
    const timer = setTimeout(() => {
      document.getElementById("task-title")?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (!user) return;
    setIsLoading(true);

    const task: Task = {
      userId: user.id,
      id: initialData?.id || uuidv4(),
      title: title.trim(),
      description: description.trim(),
      priority: priority,
      completed: initialData?.completed || false,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      dueAt: dueDate?.toISOString() || null,
    };
    if (initialData) {
      await onUpdate(task.id, task);
    } else {
      await onInsert(task);
    }
    onClose();
    setIsLoading(false);
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const formVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        margin: 0,
      }}
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={overlayVariants}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-md"
        variants={formVariants}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="border shadow-lg">
          <form onSubmit={handleSubmit}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl">
                {initialData ? "編輯任務" : "新增任務"}
              </CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full hover:bg-muted"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">關閉</span>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="task-title"
                  className="text-sm font-normal text-muted-foreground"
                >
                  標題
                </Label>
                <Input
                  id="task-title"
                  placeholder="輸入任務標題"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="border-none bg-muted focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="task-description"
                  className="text-sm font-normal text-muted-foreground"
                >
                  描述 (選填)
                </Label>
                <Textarea
                  id="task-description"
                  placeholder="新增任務細節"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="border-none bg-muted resize-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
                />
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="task-priority"
                    className="text-sm font-normal text-muted-foreground"
                  >
                    優先級
                  </Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger
                      id="task-priority"
                      className="border-none bg-muted focus:ring-0"
                    >
                      <SelectValue placeholder="選擇優先級" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">🟢 低</SelectItem>
                      <SelectItem value="medium">🔵 中</SelectItem>
                      <SelectItem value="high">🟡 高</SelectItem>
                      <SelectItem value="urgent">🔴 緊急</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-normal text-muted-foreground">
                    截止日期 (選填)
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal border-none bg-muted",
                          !dueDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dueDate
                          ? format(dueDate, "PPP p", { locale: zhTW })
                          : "選擇日期"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 flex flex-col items-center justify-center">
                      <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={setDueDate}
                        initialFocus
                      />
                      {/* 時間選擇器 */}
                      <TimePicker
                        date={dueDate || new Date()}
                        setDate={setDueDate}
                        className="p-4 pt-2"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                className="rounded-full"
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={!title.trim()}
                className="rounded-full"
                loading={isLoading}
              >
                {initialData ? "更新任務" : "建立任務"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </motion.div>
  );
}
