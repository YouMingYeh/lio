"use client";

import { changePassword } from "@/lib/auth/actions";
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
import { Input } from "@workspace/ui/components/input";
import { useToast } from "@workspace/ui/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

const registerSchema = z
  .object({
    password: z.string().min(8, { message: "密碼至少需要 8 個字元" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "密碼不相符",
    path: ["confirmPassword"],
  });

type ResetFormValues = z.infer<typeof registerSchema>;

export default function ResetForm() {
  const searchParam = useSearchParams();
  const code = searchParam.get("code") || "";
  const resetForm = useForm<ResetFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const { push } = useRouter();
  const { toast } = useToast();
  async function onResetSubmit(values: ResetFormValues) {
    const { error } = await changePassword(values.password, code);
    if (error && error == "AuthApiError") {
      console.log(error);
      resetForm.setError("password", {
        type: "manual",
        message: "新密碼需要與舊密碼不同",
      });
      return;
    }
    if (error) {
      resetForm.setError("password", {
        type: "manual",
        message: "出現未知錯誤，請聯絡我們",
      });
    }
    // reset successful
    toast({
      title: "重設成功",
    });
    push("/dashboard");
  }
  return (
    <>
      <Form {...resetForm}>
        <form
          onSubmit={resetForm.handleSubmit(onResetSubmit)}
          className="space-y-4"
        >
          <FormField
            control={resetForm.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>新密碼</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="重建密碼" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={resetForm.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>確認新密碼</FormLabel>
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
            loading={resetForm.formState.isSubmitting}
          >
            重設密碼
          </Button>
        </form>
      </Form>
    </>
  );
}
