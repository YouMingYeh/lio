import { buttonVariants } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { ArrowLeft, Home } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

/**
 * The NotFound component displays a 404 error page when a user navigates to a page that does not exist. The component includes a message indicating that the page could not be found and provides links to return to the previous page or the home page
 *
 * For more information on the 404 error page, refer to the Next.js documentation:
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/not-found
 */
export default function NotFound() {
  return (
    <div className="from-background to-secondary/10 flex h-screen w-full flex-col items-center justify-center bg-gradient-to-b">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mb-4 flex items-center justify-center">
            <Image
              src="/logo.png"
              width={96}
              height={96}
              className="rounded"
              alt="Adastra"
            />
          </div>
          <CardTitle className="text-3xl font-bold">404</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-2 text-xl font-semibold">哎呀！找不到頁面</p>
          <p className="text-muted-foreground">
            很抱歉，我們找不到您要尋找的頁面。它可能已被移動或不存在。
          </p>
        </CardContent>
        <CardFooter className="flex justify-center space-x-4">
          <Link className={buttonVariants({ variant: "outline" })} href="/">
            <Home className="mr-2 h-4 w-4" />
            回到首頁
          </Link>
          <Link className={buttonVariants({})} href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            回到工作空間
          </Link>
        </CardFooter>
      </Card>
      <p className="text-muted-foreground mt-8 text-center text-sm">
        如果您認為這是一個錯誤，請{" "}
        <Link
          href="/#contact"
          className="hover:text-primary font-medium underline underline-offset-4"
        >
          聯繫我們的支援團隊
        </Link>
        。
      </p>
    </div>
  );
}
