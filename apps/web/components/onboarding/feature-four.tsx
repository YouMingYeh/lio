"use client";

import { useUser } from "@/hooks/use-user";
import { zodResolver } from "@hookform/resolvers/zod";
import { AutosizeTextarea } from "@workspace/ui/components/autosize-textarea";
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
  age: z.coerce.number().default(20),
  gender: z.string().default(""),
  objective: z.string().default(""),
});

type FormValues = z.infer<typeof formSchema>;

export default function FeatureFour({
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
        className="mb-8 rounded-full bg-green-100 p-6 dark:bg-green-900"
      >
        <span className="text-5xl">☺️</span>
      </motion.div>

      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-2xl font-bold"
      >
        快完成了！
      </motion.h2>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-4 text-muted-foreground"
      >
        告訴我們你的學習目標，我們將為你量身打造專屬學習計畫
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
      age: user?.age ?? 20,
      gender: user?.gender ?? "",
      objective: user?.objective ?? "",
    },
  });

  return (
    <Form {...form}>
      <form
        onChange={form.handleSubmit(onChange)}
        className="space-y-2 max-w-3xl mx-auto text-start"
      >
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-6">
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>年齡 Age</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormDescription>請問今年幾歲了呢？</FormDescription>
                  <FormDescription>How old are you?</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-6">
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>性別 Gender</FormLabel>
                  <FormControl>
                    <Input type="" {...field} />
                  </FormControl>
                  <FormDescription>請問您的性別是？</FormDescription>
                  <FormDescription>What is your gender?</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="objective"
          render={({ field }) => (
            <FormItem>
              <FormLabel>學習目標 Learning Objective</FormLabel>
              <FormControl>
                <AutosizeTextarea minHeight={56} {...field} />
              </FormControl>
              <FormDescription>
                您為什麼想要學習英文？不要吝嗇告訴我們您的學習目標、想完成的事情或是其他任何想法！
              </FormDescription>
              <FormDescription>
                Don&apos;t hesitate to tell us your learning objectives, things
                you want to accomplish, or any other thoughts!
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
