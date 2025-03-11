"use client";

import { useLiff } from "@/hooks/use-liff";
import { Button } from "@workspace/ui/components/button";
import { LogIn } from "lucide-react";

export function LINELoginButton() {
  const { login, liff } = useLiff();
  if (liff?.isLoggedIn()) {
    return (
      <Button
        size="sm"
        className="w-full bg-green-500 hover:bg-green-500/80"
        type="button"
      >
        您好 👋！
      </Button>
    );
  }
  return (
    <Button
      onClick={login}
      size="sm"
      className="w-full bg-green-500 hover:bg-green-500/80"
      type="button"
    >
      <LogIn size={16} className="mr-1" />
      使用 LINE 登入
    </Button>
  );
}
