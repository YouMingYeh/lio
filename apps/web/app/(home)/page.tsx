"use client";

import { OnboardingFlow } from "./onboarding-flow";
import SimpleFeedback from "./simple-feedback";
import FeedbackDialog from "@/components/home/feedback-dialog";
import { FooterSection } from "@/components/home/footer";
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
    <div className="bg-[#FCFDFE] w-screen" vaul-drawer-wrapper="true">
      <div className="w-full flex items-center justify-center">
        <OnboardingFlow />
      </div>
      <div className="container mx-auto min-h-[100svh] w-full max-w-xl space-y-6 py-4 pb-64">
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
  "👋 歡迎使用 Lio 🤓！這裡是你的單字庫 📚",
  "💁 有任何問題或建議❓請點擊右下角的按鈕回報給我們！",
  "🤔 想不到要學什麼單字嗎？點擊下方的按鈕來生成吧！",
  "偷偷跟你說 🫢，你可以傳送語音訊息喔！🎤",
  "不知道怎麼念嗎？點開單字，點擊播放按鈕聽發音！👂",
  "📈 這裡還有你的學習進度統計，快來看看吧！",
  "使用者每天最多可以傳送 💯 則訊息，用完後有彩蛋！🤫",
  "Lio 可以聽聽你的發音，然後幫你糾正！🎧",
  "覺得 Lio 回答不好？試著到進階設定重置他吧！🔧",
];

const FAQData = [
  {
    id: 1,
    question: "如何使用 Lio？",
    answer:
      "直接與 Lio 用最自然的方式聊天，Lio 會在過程中自動幫你記錄單字到單字庫，提供練習、發音、解釋，推薦你最適合複習、學習的單字，並追蹤你的學習進度。",
    icon: "🤓",
  },
  {
    id: 2,
    question: "Lio 有哪些功能？",
    answer:
      "Lio 的單字庫 📚 中，有你的單字清單、學習進度統計 📊、單字生成器等功能。而在「聊天選單」中，有「學習回顧」功能幫你回顧學習狀況與英文能力檢驗並提供建議、「小測驗」功能幫你複習單字，而「翻譯」功能則可以在你需要中文解釋時提供幫助。",
    icon: " ",
  },
  {
    id: 3,
    question: "我可以和他用語音講話嗎？",
    answer:
      "可以的！使用 LINE 輸入匡右下角錄製並傳送語音，Lio 可以聽聽你的發音、表達，然後幫你糾正！🎧（AI 是直接聽你的聲音喔！所以他還可以聽出你的語氣、口音！）",
    icon: "✨",
  },
  {
    id: 4,
    question: "我想知道某些英文單字、語句怎麼用英文說出來？",
    answer:
      "你可以直接問 Lio 要怎麼說，Lio 就會錄製一段語音給你聽！🎤 你也可以點開單字，播放單字發音、解釋給你聽",
    icon: " ",
  },
  {
    id: 5,
    question: "我可以和 Lio 玩角色扮演嗎？",
    answer:
      "哈哈當然沒問題！你只要告訴他你想要他扮演的角色、個性、講話方式，Lio 就會幫你扮演角色！",
    icon: " ",
  },
  {
    id: 6,
    question: "還有什麼進階功能？",
    answer:
      "偷偷告訴你，Lio 除了可以記憶你的喜好、學習模式，用你最喜歡的方式與你聊天、學習，甚至你還可以給 Lio 各種無理取鬧的要求，無論是看 YouTube、找迷因、講故事，Lio 都有相應的工具可以幫你！",
    icon: "🫢",
  },
];
