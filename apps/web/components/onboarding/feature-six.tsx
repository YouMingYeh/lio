"use client";

import { createWord, generateNewWords } from "@/app/(home)/actions";
import { useUser } from "@/hooks/use-user";
import { AutosizeTextarea } from "@workspace/ui/components/autosize-textarea";
import { Button } from "@workspace/ui/components/button";
import { Label } from "@workspace/ui/components/label";
import { cn } from "@workspace/ui/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function FeatureSix() {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8 rounded-full bg-indigo-100 p-6 dark:bg-indigo-900"
      >
        <span className="text-5xl">📚</span>
      </motion.div>

      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-xl font-bold"
      >
        現在，我們來學一些新單字吧！
      </motion.h2>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="w-full max-w-md mt-6"
      >
        <WordGenerator />
      </motion.div>
    </div>
  );
}

type Word = {
  type: string;
  text: string;
  meaning: string;
  description: string;
  examples: string[];
};

interface WordCardProps {
  word: {
    type: string;
    text: string;
    meaning: string;
    description: string;
    examples: string[];
  };
  onKeep: () => void;
  onSkip: () => void;
}

function WordCard({ word, onKeep, onSkip }: WordCardProps) {
  const [dragX, setDragX] = useState(0);

  const handleDragEnd = (e: any, info: any) => {
    if (info.offset.x > 100) {
      onKeep();
    } else if (info.offset.x < -100) {
      onSkip();
    }
  };

  // Calculate opacity for the action indicators
  const keepOpacity = Math.min(dragX / 100, 1);
  const skipOpacity = Math.min(-dragX / 100, 1);

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative w-full max-w-xs">
        {/* Keep indicator */}
        <div
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10"
          style={{ opacity: keepOpacity }}
        >
          <div className="bg-green-500 text-white rounded-full p-3">
            <Check className="h-6 w-6" />
          </div>
        </div>

        {/* Skip indicator */}
        <div
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10"
          style={{ opacity: skipOpacity }}
        >
          <div className="bg-red-500 text-white rounded-full p-3">
            <X className="h-6 w-6" />
          </div>
        </div>

        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDrag={(e, info) => setDragX(info.offset.x)}
          onDragEnd={handleDragEnd}
          animate={{
            rotate: dragX * 0.05,
            x: dragX * 0.2,
          }}
          className="bg-card text-card-foreground rounded-xl shadow-lg p-8 cursor-grab active:cursor-grabbing border"
          whileTap={{ scale: 1.05 }}
        >
          <div className="flex flex-col items-center">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              今天來學學...
            </div>
            <h2 className="text-4xl font-bold text-center text-foreground mb-2">
              {word.text}
            </h2>
            <p className="text-lg text-center text-muted-foreground mb-4">
              {word.type} {word.meaning}
            </p>
            <div className="flex justify-center space-x-8 text-sm text-muted-foreground">
              <div className="flex items-center">
                <X className="h-4 w-4 mr-1 text-red-500" />
                左滑跳過
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 mr-1 text-green-500" />
                右滑加入
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function WordGenerator() {
  const { user } = useUser();
  const [topic, setTopic] = useState("");
  const [words, setWords] = useState<Word[]>([]);
  const [keptWords, setKeptWords] = useState<Word[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const generateWords = async () => {
    try {
      setIsGenerating(true);
      setCurrentIndex(0);
      setWords([]);
      const { words: newWords } = await generateNewWords(topic, []);

      setWords(newWords || []);
    } catch (error) {
      console.error("Error generating words:", error);
      toast.error("生成單字時發生錯誤！");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeep = async (word: Word) => {
    try {
      setKeptWords((prev) => [...prev, word]);

      // Move to next word
      setCurrentIndex((prev) => prev + 1);

      if (!user) {
        console.warn("No user found, word not saved to database");
        return;
      }

      const { error } = await createWord({
        text: word.text,
        meaning: word.meaning,
        description: word.description,
        examples: word.examples,
        type: word.type,
        userId: user.id,
        repetition: 0,
        level: "still-new",
      });

      if (error) {
        console.error("Failed to create word", error);
        toast.error("單字加入失敗！");
      } else {
        toast.success(`已將 "${word.text}" 加入單字庫！`);
      }
    } catch (error) {
      console.error("Error keeping word:", error);
      toast.error("儲存單字時發生錯誤！");
    }
  };

  const handleSkip = () => {
    // Just move to next word
    setCurrentIndex((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col items-center justify-start py-4 space-y-4">
      <div
        className={cn(
          "w-full relative",
          words.length > 0 ? "h-[240px]" : "h-auto",
        )}
      >
        {isGenerating ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center"
            >
              <Loader2 className="h-12 w-12 animate-spin text-primary my-4" />
              <p className="text-muted-foreground text-nowrap">
                正在生成單字...
              </p>
            </motion.div>
          </div>
        ) : words.length > 0 && currentIndex < words.length ? (
          <AnimatePresence mode="wait">
            {words[currentIndex] && (
              <WordCard
                key={`${words[currentIndex].text}-${currentIndex}`}
                word={words[currentIndex]}
                onKeep={() =>
                  words[currentIndex] && handleKeep(words[currentIndex])
                }
                onSkip={handleSkip}
              />
            )}
          </AnimatePresence>
        ) : words.length > 0 ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center text-center px-4"
            >
              <p className="text-xl font-medium mb-2 text-foreground">
                所有單字已檢閱完畢！
              </p>
              {keptWords.length > 0 ? (
                <>
                  <p className="text-muted-foreground mb-4">
                    你加入了 {keptWords.length} 個單字：
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    {keptWords.map((word, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                      >
                        {word.text}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground mb-4">
                  你沒有加入任何單字。
                </p>
              )}

              <Button
                onClick={() => {
                  setWords([]);
                  setKeptWords([]);
                }}
                className="mt-4"
              >
                再生成一次
              </Button>
            </motion.div>
          </div>
        ) : (
          <div className="w-full">
            <div className="flex flex-col items-start text-start w-full space-y-4">
              <div className="w-full">
                <Label htmlFor="topic" className="mb-2 block">
                  今天我想來點...
                </Label>
                <AutosizeTextarea
                  id="topic"
                  placeholder="告訴我你想學什麼類型、主題的單字？（雅思、托福、生活、旅遊...）"
                  value={topic}
                  minHeight={56}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  輸入你想加入的單字類型或主題（也可以留空！），點擊下方按鈕生成隨機單字。
                </p>
              </div>

              <Button
                onClick={generateWords}
                disabled={isGenerating}
                size="lg"
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>生成單字 ✨</>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
