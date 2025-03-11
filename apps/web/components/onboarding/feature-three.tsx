"use client";

import { useUser } from "@/hooks/use-user";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  display_name: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export default function FeatureThree({
  onChange,
}: {
  onChange: (values: FormValues) => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8 rounded-full bg-yellow-100 p-6 dark:bg-yellow-900"
      >
        <span className="text-5xl">👇</span>
      </motion.div>

      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-2xl font-bold"
      >
        話不多說，馬上開始
      </motion.h2>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-4 text-muted-foreground"
      >
        首先，請告訴我們您的名字
      </motion.p>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mt-8"
      >
        <OnboardingForm onChange={onChange} />
      </motion.div>
    </div>
  );
}

function OnboardingForm({
  onChange,
}: {
  onChange: (values: FormValues) => void;
}) {
  const { user } = useUser();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      display_name: user?.displayName ?? "",
    },
  });

  return (
    <Form {...form}>
      <form
        onChange={form.handleSubmit(onChange)}
        className="space-y-2 max-w-3xl mx-auto text-start"
      >
        <FormField
          control={form.control}
          name="display_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>名字 Your Name*</FormLabel>
              <FormControl>
                <Input type="" {...field} />
              </FormControl>
              <FormDescription>怎麼稱呼您呢？</FormDescription>
              <FormDescription>What should we call you?</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
