"use client";

import { motion } from "framer-motion";

export default function FeatureOne() {
  const features = [
    { icon: "📊", text: "單字庫與進度追蹤，隨時掌握學習狀況" },
    { icon: "🎯", text: "個人化學習體驗，依不同程度與興趣提供專屬內容" },
    { icon: "👨‍🏫", text: "依不同程度調整教學模式" },
    { icon: "🤫", text: "還有更多功能等著你發現！" },
  ];

  return (
    <div className="flex flex-col items-center justify-center text-center mx-auto max-w-md">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8 rounded-full bg-orange-100 p-6 dark:bg-orange-900"
      >
        <span className="text-5xl">🤩</span>
      </motion.div>

      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-xl font-bold mb-6"
      >
        還有什麼？
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
