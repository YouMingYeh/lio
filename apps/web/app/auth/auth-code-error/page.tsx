import { Button } from "@workspace/ui/components/button";
import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-4">
      <h1 className="text-3xl font-bold">錯誤！</h1>
      <p className="text-lg">請重新登入。</p>
      <Link href="/auth/login" passHref>
        <Button variant="linkHover1">返回登入頁</Button>
      </Link>
    </div>
  );
}
