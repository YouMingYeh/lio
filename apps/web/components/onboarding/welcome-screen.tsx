"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function WelcomeScreen() {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8 rounded-full bg-primary/10 p-6"
      >
        <Image
          src="/logo.png"
          width={120}
          height={120}
          alt="App logo"
          className="h-24 w-24"
        />
      </motion.div>

      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-3xl font-bold tracking-tight"
      >
        Lio – Talk, Think, Do.
      </motion.h1>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-4 text-muted-foreground"
      >
        歡迎使用 Lio！Lio 是一個讓你透過與 AI
        聊天，設定目標、規劃任務、優化生活的工具。
      </motion.p>
    </div>
  );
}
