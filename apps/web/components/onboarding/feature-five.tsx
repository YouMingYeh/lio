"use client";

import { updateUserByUserId } from "./actions";
import { useUser } from "@/hooks/use-user";
import { Button } from "@workspace/ui/components/button";
import { motion } from "framer-motion";
import { Fragment, useState } from "react";

interface FeatureFiveProps {
  data: {
    display_name: string;
    age: number;
    gender: string;
    objective: string;
  };
}

export default function FeatureFive({ data }: FeatureFiveProps) {
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    if (!user) return;
    if (loading) return;
    setLoading(true);
    const { error } = await updateUserByUserId(user.id, {
      displayName: data.display_name,
      age: data.age > 0 ? data.age : undefined,
      gender: data.gender.length > 0 ? data.gender : undefined,
      objective: data.objective.length > 0 ? data.objective : undefined,
      onboarded: true,
    });
    if (error) {
      console.error(error);
      return;
    }
    setUser({ ...user, ...data, onboarded: true });
    setLoading(false);
  }

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8 rounded-full bg-blue-100 p-6"
      >
        <span className="text-5xl">🤩</span>
      </motion.div>

      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-2xl font-bold"
      >
        很高興認識你，{data.display_name}!
      </motion.h2>

      {user?.onboarded ? (
        <Fragment>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-4 text-muted-foreground"
          >
            完成了！接著，點擊下一步來學習一些基本的單字吧
          </motion.p>
        </Fragment>
      ) : (
        <Fragment>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-4 text-muted-foreground"
          >
            現在來讓我來生成您的學習計畫
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-8"
          >
            <Button size="lg" onClick={handleGenerate} loading={loading}>
              開始 🪄
            </Button>
          </motion.div>
        </Fragment>
      )}
    </div>
  );
}
