import RegisterForm from "./register-form";
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
    <Card className="w-full max-w-lg border-none shadow-none">
      <CardHeader>
        <CardTitle className="mx-auto">
          <Image
            src="/logo.png"
            width={512}
            height={512}
            className="h-32 w-96 object-cover"
            alt="Adastra"
          />
        </CardTitle>
        <CardDescription className="mx-auto">歡迎加入！</CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
      </CardContent>
      <CardFooter>
        <p className="text-muted-foreground mx-auto text-center text-sm">
          <Link href="/auth/login" prefetch>
            <Button variant="link" className="text-primary">
              已經有帳號？點此登入
            </Button>
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
