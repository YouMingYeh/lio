"use client";

import {
  signInWithEmailAndPassword,
  signInWithGoogle,
  signUpWithEmailAndPassword,
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
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

const registerSchema = z
  .object({
    email: z.string().email({ message: "無效的電子郵件地址" }),
    password: z.string().min(8, { message: "密碼至少需要 8 個字元" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "密碼不相符",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterForm({
  defaultEmail,
}: {
  defaultEmail?: string;
}) {
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: defaultEmail ?? "",
      password: "",
      confirmPassword: "",
    },
  });

  const { push } = useRouter();
  const { toast } = useToast();
  async function onRegisterSubmit(values: RegisterFormValues) {
    const { error } = await signUpWithEmailAndPassword(
      values.email,
      values.password,
    );
    if (error) {
      registerForm.setError("email", {
        type: "manual",
        message: "此電子郵件可能已被註冊",
      });
      return;
    }
    // Sign up successfully, sing in and redirect to dashboard
    await signInWithEmailAndPassword(values.email, values.password);
    toast({
      title: "註冊成功",
      description: "請先至您的電子郵件信箱驗證您的帳號",
    });
    push("/dashboard");
  }
  return (
    <>
      <Form {...registerForm}>
        <form
          onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
          className="space-y-4"
        >
          <FormField
            control={registerForm.control}
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
            control={registerForm.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>密碼</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="創建密碼" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={registerForm.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>確認密碼</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="確認您的密碼"
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
            loading={registerForm.formState.isSubmitting}
          >
            註冊
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
