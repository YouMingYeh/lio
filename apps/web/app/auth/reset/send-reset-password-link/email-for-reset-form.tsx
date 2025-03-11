"use client";

import { sendResetEmail } from "@/lib/auth/actions";
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
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

const emailSchema = z.object({
  email: z.string().email({ message: "無效的電子郵件地址" }),
});

type EmailFormValues = z.infer<typeof emailSchema>;
export default function ResetForm() {
  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });
  const { push } = useRouter();
  const { toast } = useToast();
  async function onEmailSubmit(values: EmailFormValues) {
    const { error } = await sendResetEmail(values.email);
    if (error) {
      emailForm.setError("email", {
        type: "manual",
        message: "電子郵件錯誤",
      });
      return;
    }
    toast({
      title: "重設成功",
      description: `請至 ${values.email} 重設您的密碼，電子郵件可能需要幾分鐘寄送`,
    });
    push("/auth/login");
  }
  return (
    <>
      <Form {...emailForm}>
        <form
          onSubmit={emailForm.handleSubmit(onEmailSubmit)}
          className="space-y-4"
        >
          <FormField
            control={emailForm.control}
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
          <Button
            type="submit"
            className="w-full"
            loading={emailForm.formState.isSubmitting}
          >
            申請重設密碼
          </Button>
        </form>
      </Form>
    </>
  );
}
