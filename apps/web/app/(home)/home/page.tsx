"use client";

import { createWait } from "./actions";
import IPhoneMockups from "./iphone-mockups";
import { zodResolver } from "@hookform/resolvers/zod";
import { AutosizeTextarea } from "@workspace/ui/components/autosize-textarea";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Form,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { lazy, Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const LazyGlobe = lazy(() =>
  import("@workspace/ui/components/cobe").then((mod) => ({
    default: mod.Globe,
  })),
);

const formSchema = z.object({
  email: z.string().email("請輸入有效的電子郵件地址"),
  name: z.string().min(2, "姓名至少需要 2 個字元"),
  message: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function WaitlistPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      name: "",
      message: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
      const { error } = await createWait(values);
      if (error) {
        toast.error("加入候補名單時發生錯誤，請稍後再試。");
        return;
      }
      form.reset({ email: "", name: "", message: "" });
      toast.success("成功加入候補名單！我們會盡快通知您。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="from-background via-background to-muted min-h-screen w-full bg-gradient-to-b">
      <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto grid w-full grid-cols-1 place-content-center gap-8 whitespace-normal text-wrap text-center sm:grid-cols-2 gap-x-16">
          <div className="flex w-full flex-col flex-wrap items-center justify-center space-y-4">
            <h1 className="text-2xl font-bold tracking-tight sm:text-5xl">
              Lio：你的專屬 AI 待辦助理
            </h1>
            <p className="text-muted-foreground mt-4 text-wrap text-center text-base sm:text-lg">
              透過 LINE 與 Lio
              對話，用語音或文字輕鬆管理任務，並利用心理模型快速決策。
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-center">
              <Badge variant="secondary">🧠 心智模型快速決策</Badge>
              <Badge variant="secondary">🎙️ 語音快速新增任務</Badge>
              <Badge variant="secondary">🤖 LINE 即時 AI 助理</Badge>
              <Badge variant="secondary">🌿 極簡設計好上手</Badge>
              <Badge variant="secondary">🔔 智慧提醒功能</Badge>
            </div>
          </div>
          <IPhoneMockups />
        </div>

        <div className="mt-16 grid gap-x-12 gap-y-16 grid-cols-1 sm:grid-cols-6 w-full place-content-center">
          <div className="relative col-span-1 sm:col-span-3 shadow">
            <div className="bg-card/50 rounded-xl border p-6 backdrop-blur-sm sm:p-8">
              <h3 className="text-md text-center font-medium">
                📢 限量早鳥體驗名額！立即加入候補名單
              </h3>
              <p className="text-muted-foreground mt-1 text-center text-sm">
                馬上搶先體驗 Lio，填寫 10 秒表單即可加入！
              </p>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          姓名
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="請輸入您的姓名"
                            {...field}
                            className="h-11"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          電子郵件
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="you@example.com"
                            type="email"
                            {...field}
                            className="h-11"
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          我們絕不會與他人分享您的電子郵件。
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          還有什麼想告訴我們的？
                        </FormLabel>
                        <FormControl>
                          <AutosizeTextarea
                            minHeight={56}
                            maxHeight={96}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          說說你對 SamGPT 的期待或想法！
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "處理中..."
                    ) : (
                      <>
                        立即加入候補名單
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          </div>

          <div className="col-span-1 space-y-8 sm:col-span-3 flex flex-col justify-center">
            <div className="space-y-6">
              {[
                { title: "搶先使用 ✅", description: "優先體驗 Lio 最新功能" },
                { title: "免費體驗 🎁", description: "早期用戶免費試用特權" },
                { title: "即時回饋 ⚡", description: "你的意見馬上被聽見" },
              ].map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="text-primary mt-1 h-5 w-5 shrink-0" />
                  <div>
                    <h3 className="font-medium leading-6">{benefit.title}</h3>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features 和 Globe 區塊原有結構不變，僅將標題與描述內容改為 Lio 專屬 */}
      </div>
    </div>
  );
}
