import ResetForm from "./reset-form";
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

export default function ResetPage() {
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
        <CardDescription className="mx-auto">歡迎回來！</CardDescription>
      </CardHeader>
      <CardContent>
        <ResetForm />
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
