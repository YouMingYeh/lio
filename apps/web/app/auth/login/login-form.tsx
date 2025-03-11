"use client";

import {
  signInWithEmailAndPassword,
  signInWithGoogle,
} from "@/lib/auth/actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { GoogleIcon } from "@workspace/ui/components/icon";
import { Input } from "@workspace/ui/components/input";
import { Separator } from "@workspace/ui/components/separator";
import { useToast } from "@workspace/ui/hooks/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email({ message: "無效的電子郵件地址" }),
  password: z.string().min(8, { message: "密碼至少需要 8 個字元" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
export default function LoginForm() {
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const { push } = useRouter();
  const { toast } = useToast();
  async function onLoginSubmit(values: LoginFormValues) {
    const { error } = await signInWithEmailAndPassword(
      values.email,
      values.password,
    );
    if (error) {
      loginForm.setError("email", {
        type: "manual",
        message: "電子郵件或密碼錯誤",
      });
      loginForm.resetField("password");
      return;
    }
    toast({
      title: "登入成功",
      description: "歡迎回來！",
    });
    push("/dashboard");
  }
  return (
    <>
      <Form {...loginForm}>
        <form
          onSubmit={loginForm.handleSubmit(onLoginSubmit)}
          className="space-y-4"
        >
          <FormField
            control={loginForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>電子郵件</FormLabel>
                <FormControl>
                  <Input placeholder="輸入您的電子郵件" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={loginForm.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-0">
                <FormLabel className="flex w-full items-center justify-between">
                  密碼
                  <Link href="/auth/reset/send-reset-password-link" prefetch>
                    <Button variant="linkHover1" size="sm" type={"button"}>
                      忘記密碼？
                    </Button>
                  </Link>
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="輸入您的密碼"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full"
            loading={loginForm.formState.isSubmitting}
          >
            登入
          </Button>
        </form>
      </Form>
      <div className="my-4 flex items-center gap-4">
        <Separator className="flex-1" />
        <span className="text-muted-foreground">或使用</span>
        <Separator className="flex-1" />
      </div>
      <Button
        variant="outline"
        className="w-full"
        onClick={async () => {
          await signInWithGoogle();
        }}
      >
        <GoogleIcon className="mr-2" size={24} /> 使用 Google 登入
      </Button>
    </>
  );
}
