import EmailForm from "./email-for-reset-form";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="mx-auto">
          <Image
            src="/logo.png"
            width={128}
            height={128}
            className="rounded"
            alt="Adastra"
          />
        </CardTitle>
        <CardDescription className="mx-auto text-center">
          重設密碼 <br />
          請在下方填寫您註冊使用的電子郵件，我們將會寄送確認信件給您
        </CardDescription>
      </CardHeader>
      <CardContent>
        <EmailForm />
      </CardContent>
      <CardFooter>
        <p className="text-muted-foreground mx-auto text-center text-sm">
          <Link href="/auth/register" prefetch>
            <Button variant="link" className="text-primary">
              還沒有帳號？點此註冊
            </Button>
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
