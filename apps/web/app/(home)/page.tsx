"use client";

import { OnboardingFlow } from "./onboarding-flow";
import SimpleFeedback from "./simple-feedback";
import FeedbackDialog from "@/components/home/feedback-dialog";
import { FooterSection } from "@/components/home/footer";
import TaskDashboard from "@/components/task-dashboard";
import { useLiff } from "@/hooks/use-liff";
import { useUser } from "@/hooks/use-user";
import { Button } from "@workspace/ui/components/button";
import { FAQ } from "@workspace/ui/components/faq";
import { LogIn, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const { login } = useLiff();
  const { user, isFetching: isFetchingUser } = useUser();

  const [randomMessage, setRandomMessage] = useState("");

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * randomMessages.length);
    setRandomMessage(randomMessages[randomIndex] || "");
  }, []);

  if (!randomMessage) {
    return <div className="bg-muted/20 w-full"></div>;
  }

  if (isFetchingUser) {
    return (
      <div className="bg-muted/20 w-full">
        <div
          className="container flex flex-col justify-center items-center mx-auto h-[100svh] w-full max-w-xl py-8"
          onClick={() => {
            setRandomMessage(
              randomMessages[
                Math.floor(Math.random() * randomMessages.length)
              ] || "",
            );
          }}
        >
          <p className="text-center text-md">
            📝 開啟管理介面中...{" "}
            <Loader2
              className="animate-spin inline-flex items-center"
              size={20}
            />
          </p>
          <p className="text-center text-muted-foreground text-sm mt-2">
            {randomMessage || "..."}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-muted/20 flex items-center justify-center w-full min-h-[100svh]">
        <div className="container mx-auto w-full max-w-lg py-8 px-4 flex flex-col items-center">
          <Button
            onClick={login}
            size="lg"
            className="w-full bg-green-500 hover:bg-green-500/80"
            type="button"
          >
            <LogIn size={20} className="mr-2" />
            請先點我使用 LINE 登入
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-[#FCFDFE] dark:bg-background w-screen"
      vaul-drawer-wrapper="true"
    >
      <div className="w-full flex items-center justify-center">
        <OnboardingFlow />
      </div>
      <div className="container mx-auto min-h-[100svh] w-full max-w-xl space-y-6 py-4 pb-64">
        <TaskDashboard />
        <div>
          <FAQ data={FAQData} />
        </div>

        <p className="text-center text-muted-foreground text-xs w-full">
          💁 有任何問題或建議❓請點擊右下角的按鈕或下方回饋給我們❕
        </p>
        <SimpleFeedback
          data={["👍 體驗良好", "👎 體驗不好", "✏️ 直接告訴我..."]}
        />
      </div>

      <p className="text-center text-muted-foreground text-xs fixed bottom-1 w-full">
        © 2025 Lio. All rights reserved.
      </p>

      <FeedbackDialog />
      <FooterSection />
    </div>
  );
}

const randomMessages = [
  "👋 歡迎使用 Lio 🤓！這裡是你的待辦清單 📝",
  "💁 有任何問題或建議❓請點擊右下角的按鈕回報給我們！",
  "偷偷跟你說 🫢，你可以傳送語音訊息喔！🎤",
];

const FAQData = [
  {
    id: 1,
    question: "如何使用 Lio？",
    answer:
      "直接與 Lio 用最自然的方式聊天，Lio 會幫你記錄任務到待辦事項清單，如果需要 Lio 提醒你，你可以告訴 Lio 時間，Lio 會在時間到時提醒你。",
    icon: "✅",
  },
  {
    id: 2,
    question: "Lio 有哪些功能？",
    answer:
      "Lio 可以紀錄你的待辦事項，並且提醒你，也可以幫你記錄重要的事情，只要簡單地跟他說就可以了。",
    icon: " ",
  },
];
