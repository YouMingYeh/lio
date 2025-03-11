"use client";

import { useLiff } from "@/hooks/use-liff";
import { Button } from "@workspace/ui/components/button";
import { LogIn } from "lucide-react";

export const HeroSection = () => {
  const { login } = useLiff();
  return (
    <section className="relative h-full w-full p-4">
      <Button
        onClick={login}
        size="sm"
        className="w-full bg-green-500 hover:bg-green-500/80"
        type="button"
      >
        <LogIn size={16} className="mr-1" />
        使用 LINE 登入
      </Button>
    </section>
  );
};
