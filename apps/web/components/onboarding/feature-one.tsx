"use client";

import { motion } from "framer-motion";

export default function FeatureOne() {
  const features = [
    { icon: "💬", text: "用熟悉的 LINE，與 AI 隨時聊天" },
    { icon: "🧠", text: "用 AI 理清雜亂，讓任務自動排序" },
    { icon: "🔥", text: "用心智模型，做更聰明的選擇" },
    { icon: "🌿", text: "極簡設計體驗，更專注於重要的事" },
  ];

  return (
    <div className="flex flex-col items-center justify-center text-center mx-auto max-w-md">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8 rounded-full bg-red-100 p-6 dark:bg-red-900"
      >
        <span className="text-5xl">🤔</span>
      </motion.div>

      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-xl font-bold mb-6"
      >
        為什麼選擇 Lio？
      </motion.h2>

      <div className="w-full space-y-2">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
            className="flex items-start bg-muted/70 p-3 rounded-lg text-start"
          >
            <span className=" mr-3 ">{feature.icon}</span>
            <span className="text-muted-foreground">{feature.text}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
