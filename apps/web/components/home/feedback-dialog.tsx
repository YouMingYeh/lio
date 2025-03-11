"use client";

import { useUser } from "@/hooks/use-user";
import { createFeedback } from "@/lib/data/feedback/action";
import { zodResolver } from "@hookform/resolvers/zod";
import { AutosizeTextarea } from "@workspace/ui/components/autosize-textarea";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@workspace/ui/components/drawer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { useToast } from "@workspace/ui/hooks/use-toast";
import { MessageSquareShare } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  feedback: z.string(),
});

// Custom hook to detect screen size
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    window.addEventListener("resize", listener);
    return () => window.removeEventListener("resize", listener);
  }, [matches, query]);

  return matches;
}

export default function FeedbackDialog() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { feedback: "" },
  });

  const { user } = useUser();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!user) return;
    const res = await createFeedback({
      userId: user.id,
      content: data.feedback,
    });
    if (res.error) {
      toast({ description: "很抱歉，出了點錯誤...", variant: "destructive" });
      return;
    }
    toast({ description: "非常感謝你的回覆！" });
    setOpen(false);
    form.reset();
  };

  const FeedbackForm = () => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="px-4 w-full">
        <FormField
          control={form.control}
          name="feedback"
          render={({ field }) => (
            <FormItem>
              <FormLabel>意見</FormLabel>
              <FormControl>
                <AutosizeTextarea
                  minHeight={96}
                  maxHeight={300}
                  className="text-[16px]"
                  {...field}
                  placeholder="請留下你寶貴的意見..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-between gap-2">
          <Button
            onClick={() => setOpen(false)}
            className="flex-1 mt-4"
            variant="secondary"
          >
            取消
          </Button>
          <Button
            type="submit"
            className="flex-1 mt-4"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "提交中..." : "提交"}
          </Button>
        </div>
      </form>
    </Form>
  );

  // Feedback button with responsive styling
  const FeedbackButton = () => (
    <Button
      className="fixed bottom-5 right-5 w-12 h-12 p-3.5  rounded-full shadow-lg"
      onClick={() => setOpen(true)}
    >
      <MessageSquareShare />
    </Button>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <FeedbackButton />
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>意見回饋</DialogTitle>
            <DialogDescription>你們的意見對我們很重要</DialogDescription>
          </DialogHeader>
          <FeedbackForm />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <FeedbackButton />
      </DrawerTrigger>
      <DrawerContent className="pb-36">
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>意見回饋</DrawerTitle>
            <DrawerDescription>你們的意見對我們很重要</DrawerDescription>
          </DrawerHeader>
          <FeedbackForm />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
