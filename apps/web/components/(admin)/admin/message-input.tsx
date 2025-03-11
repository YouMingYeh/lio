"use client";

import { createMessage } from "./actions";
import { uploadFile } from "@/lib/file-storage/actions";
import { sendImageMessage, sendTextMessage } from "@/lib/line/actions";
import { User } from "@/types/database";
import { zodResolver } from "@hookform/resolvers/zod";
import { AutosizeTextarea } from "@workspace/ui/components/autosize-textarea";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import {
  FileInput,
  FileUploader,
  FileUploaderContent,
  FileUploaderItem,
} from "@workspace/ui/components/file-upload";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@workspace/ui/components/form";
import { useToast } from "@workspace/ui/hooks/use-toast";
import { ArrowUpRight, CloudUpload, Paperclip } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  message: z.string().optional(),
  files: z.string().optional(),
});

export default function MessageInput({ activeUser }: { activeUser: User }) {
  const [files, setFiles] = useState<File[] | null>(null);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { message: "", files: "" },
  });
  const dropZoneConfig = {
    maxFiles: 5,
    maxSize: 1024 * 1024 * 4,
    multiple: true,
  };

  async function handleFileUploads() {
    if (!activeUser?.lineUserId) return;
    const uploads = await Promise.all(
      (files || []).map(async (file) => {
        const url = await uploadFile(file);
        return { type: file.type, url };
      }),
    );
    return uploads.filter((item) => item !== undefined);
  }

  async function sendFileMessages(uploads: { type: string; url: string }[]) {
    await Promise.all(
      uploads.map(async ({ type, url }) => {
        if (!activeUser.lineUserId) {
          return;
        }
        if (type.startsWith("image")) {
          const sent = await sendImageMessage({
            to: activeUser.lineUserId,
            imageUrl: url,
            previewUrl: url,
          });
          await createMessage({
            userId: activeUser.id,
            content: [{ type: "image", image: url, url }],
            role: "assistant",
            lineMessageId: sent?.[0]?.id ?? null,
          });
        } else {
          const sent = await sendTextMessage({
            to: activeUser.lineUserId,
            message: `附件檔案：${url}`,
          });
          await createMessage({
            userId: activeUser.id,
            content: [{ type: "file", data: url }],
            role: "assistant",
            lineMessageId: sent?.[0]?.id ?? null,
          });
        }
      }),
    );
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!activeUser?.lineUserId) {
      toast({
        title: "無法發送訊息",
        description: "此聯絡人尚位連結 LINE 帳號",
        variant: "destructive",
      });
      return;
    }
    try {
      if (files && files.length > 0) {
        const uploads = await handleFileUploads();
        if (!uploads) {
          toast({
            title: "上傳檔案失敗",
            description: "請稍後再試",
            variant: "destructive",
          });
          return;
        }
        await sendFileMessages(uploads);
        setFiles(null);
      }
      form.reset();
      if (!values.message) return;
      const sentMessages = await sendTextMessage({
        to: activeUser.lineUserId,
        message: values.message,
      });
      if (!sentMessages || sentMessages.length === 0) {
        toast({
          title: "無法發送訊息",
          description: "請再試一次",
          variant: "destructive",
        });
        return;
      }
      const { error } = await createMessage({
        userId: activeUser.id,
        content: [{ type: "text", text: values.message }],
        role: "assistant",
        lineMessageId: sentMessages[0]?.id ?? null,
      });
      if (error) {
        toast({
          title: "無法發送訊息",
          description: "請再試一次",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Form submission error", error);
      toast({
        title: "無法發送訊息",
        description: "請再試一次",
        variant: "destructive",
      });
    }
  }

  if (!activeUser?.lineUserId) {
    return (
      <p className="text-muted-foreground text-center">
        請先點擊右上角 「連結 LINE」 並完成後，再開始對話
      </p>
    );
  }

  return (
    <Form {...form}>
      <form
        className="container relative h-full w-full"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <AutosizeTextarea
                  minHeight={96}
                  placeholder="手動回覆訊息..."
                  className="pb-10 shadow-lg"
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      !e.shiftKey &&
                      !e.nativeEvent.isComposing
                    ) {
                      e.preventDefault();
                      form.handleSubmit(onSubmit)();
                    }
                  }}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="absolute bottom-2 left-8 space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                className="relative size-8"
                size="icon"
                type="button"
                variant="ghost"
              >
                <Paperclip size={20} />
                {files && files.length > 0 && (
                  <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 bg-opacity-80 text-xs text-white shadow">
                    {files.length}
                  </span>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>選擇上傳檔案</DialogTitle>
              <FormField
                control={form.control}
                name="files"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FileUploader
                        value={files}
                        onValueChange={setFiles}
                        dropzoneOptions={dropZoneConfig}
                        className="bg-background relative rounded-lg p-2"
                      >
                        <FileInput
                          id="fileInput"
                          className="outline-muted-foreground outline-dashed outline-1"
                        >
                          <div className="flex w-full flex-col items-center justify-center p-8">
                            <CloudUpload className="text-muted-foreground h-10 w-10" />
                            <p className="text-muted-foreground mb-1 text-sm dark:text-gray-400">
                              <span className="font-semibold">點我上傳</span>
                              &nbsp; 或拖放檔案到此處
                            </p>
                            <p className="text-muted-foreground dark:text-muted-foreground text-xs">
                              最多可上傳 10 個檔案，每個檔案大小不超過 4 MB
                            </p>
                          </div>
                        </FileInput>
                        <FileUploaderContent>
                          {files &&
                            files.length > 0 &&
                            files.map((file, i) => (
                              <FileUploaderItem key={i} index={i}>
                                <Paperclip className="h-4 w-4 stroke-current" />
                                <span>{file.name}</span>
                              </FileUploaderItem>
                            ))}
                        </FileUploaderContent>
                      </FileUploader>
                    </FormControl>
                    <div className="space-x-2 self-end">
                      <DialogClose asChild>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => setFiles(null)}
                        >
                          取消
                        </Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button type="button">確認</Button>
                      </DialogClose>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </DialogContent>
          </Dialog>
        </div>

        <Button
          className="absolute bottom-2 right-8 size-8"
          size="icon"
          type="submit"
          loading={form.formState.isSubmitting}
          disabled={!form.getValues().message && (!files || files.length === 0)}
        >
          <ArrowUpRight size={20} />
        </Button>
      </form>
    </Form>
  );
}
