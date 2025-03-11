"use client";

import { RainbowButton } from "@workspace/ui/components/rainbow-button";
import { motion } from "motion/react";

interface FinalScreenProps {
  onComplete: () => void;
}

export default function FinalScreen({ onComplete }: FinalScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8 rounded-full bg-violet-100 p-6"
      >
        <span className="text-5xl">🎉</span>
      </motion.div>

      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-2xl font-bold"
      >
        完成！開始學習吧！
      </motion.h2>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1, scale: 1.5 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mt-8"
      >
        <RainbowButton onClick={onComplete}>開始學習</RainbowButton>
      </motion.div>
    </div>
  );
}
