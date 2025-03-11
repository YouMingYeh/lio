import { Button } from "@workspace/ui/components/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

export const dynamic = "force-static";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container mx-auto flex h-screen w-full flex-col items-center justify-center">
      <Link href="/" passHref>
        <Button variant="linkHover1" className="absolute left-4 top-4">
          <ArrowLeft size={16} className="mr-1" />
          返回首頁
        </Button>
      </Link>
      {children}
    </div>
  );
}
