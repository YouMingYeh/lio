"use client";

import { createOtp } from "./actions";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { ArrowRight, Check, Copy } from "lucide-react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    createOtp().then(({ data }) => {
      setCode(data?.code || null);
      setLoading(false);
    });
  }, []);

  return (
    <div className="bg-gradient-to-b from-muted/30 to-background min-h-[100dvh] w-full flex items-center justify-center p-4 sm:p-6">
      <Card className="w-full max-w-md mx-auto shadow-lg animate-in fade-in duration-500">
        <CardHeader className="space-y-2 text-center pb-2">
          <CardTitle className="text-2xl font-bold tracking-tight">
            恭喜！您受邀成為我們{" "}
            <span className="text-primary">Lio AI 英文家教</span> 測試使用者
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            以下您的驗證碼。請複製後，點擊以下按鈕將我們的 Lio LINE
            官方帳號加入好友，並輸入此驗證碼以開始和 Lio 聊天，一起學習英文！
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full rounded-lg" />
              <div className="flex justify-center">
                <Skeleton className="h-10 w-3/4 rounded-md" />
              </div>
              <div className="flex justify-center">
                <Skeleton className="h-40 w-40 rounded-md" />
              </div>
            </div>
          ) : (
            <>
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Card className="bg-muted/50 border-2 border-primary/10">
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="font-mono text-3xl tracking-wider font-semibold text-primary">
                      {code}
                    </div>
                    <CopyButton code={code || ""} />
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-center pt-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                <Link href="https://lin.ee/MTtKauR" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full gap-2 bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 border-green-200 hover:border-green-300 transition-all duration-300 font-medium"
                    size="lg"
                  >
                    點我前往 LINE 官方帳號
                    <ArrowRight size={18} className="animate-pulse" />
                  </Button>
                </Link>
              </div>

              <div className="flex flex-col items-center justify-center gap-3 pt-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  <QRCodeSVG value="https://lin.ee/MTtKauR" size={150} />
                </div>
                <p className="text-muted-foreground text-sm flex items-center gap-1">
                  <span className="inline-block w-4 h-0.5 bg-muted-foreground/50"></span>
                  或掃描 QR Code 加入 LINE 官方帳號
                  <span className="inline-block w-4 h-0.5 bg-muted-foreground/50"></span>
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("複製成功！趕快加入 LINE 官方帳號好友並輸入吧！");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("複製失敗，請稍後再試。");
    }
  };

  return (
    <Button
      variant={copied ? "default" : "outline"}
      onClick={copyToClipboard}
      size="sm"
      className={`transition-all duration-300 ${
        copied
          ? "bg-green-500 text-white hover:bg-green-600"
          : "hover:bg-primary/10 border-primary/20"
      }`}
    >
      {copied ? "已複製" : "點我複製"}
      {copied ? (
        <Check className="h-4 w-4 ml-2" />
      ) : (
        <Copy className="h-4 w-4 ml-2" />
      )}
    </Button>
  );
}
