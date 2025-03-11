"use client";

import MessageInput from "./message-input";
import { Markdown } from "@/components/chat/markdown";
import { CoreMessageContent, Message, User } from "@/types/database";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { FileIcon, DownloadIcon, MessagesSquare } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useRef } from "react";

/** MessageBubble renders a single message content */
const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const bubbleClass =
    message.role !== "user"
      ? "bg-primary text-primary-foreground"
      : "bg-muted text-muted-foreground";
  const content = message.content as CoreMessageContent;

  if (Array.isArray(content)) {
    return (
      <div className="flex max-w-xs flex-col gap-4">
        {content.map((part, index) => {
          if (part.type === "file" && typeof part.data === "string") {
            return (
              <div
                key={index}
                className={`flex w-full items-center rounded-lg p-3 ${bubbleClass}`}
              >
                <FileIcon className="mr-2" />
                <div className="flex-grow overflow-hidden">
                  <p className="truncate font-medium">{part.data}</p>
                </div>
                <DownloadIcon
                  className="ml-2 cursor-pointer"
                  onClick={() => {
                    if (
                      typeof part.data === "string" ||
                      part.data instanceof URL
                    ) {
                      window.open(part.data, "_blank")?.focus();
                    }
                  }}
                />
              </div>
            );
          }

          if (part.type === "image" && typeof part.image === "string") {
            return (
              <div
                key={index}
                className={`w-full rounded-lg p-3 ${bubbleClass}`}
              >
                <Dialog>
                  <DialogTrigger asChild>
                    <Image
                      src={part.image}
                      alt="Image"
                      className="h-64 w-full object-cover"
                      width={256}
                      height={256}
                    />
                  </DialogTrigger>
                  <DialogContent className="overflow-auto rounded p-0">
                    <DialogHeader className="sr-only">
                      <DialogTitle />
                    </DialogHeader>
                    <Image
                      src={part.image}
                      alt="Image"
                      className="w-full object-cover"
                      width={1024}
                      height={1024}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            );
          }

          if (part.type === "text") {
            return (
              <div
                key={index}
                className={`w-full rounded-lg p-3 ${bubbleClass}`}
              >
                <Markdown>{part.text}</Markdown>
              </div>
            );
          }
          return <span key={index}>（無法顯示的訊息）</span>;
        })}
      </div>
    );
  }

  if (typeof content === "string") {
    return (
      <div className={`w-full rounded-lg p-3 ${bubbleClass}`}>
        <Markdown>{content}</Markdown>
      </div>
    );
  }
  return null;
};

export const Messages = ({
  messages,
  activeUser,
}: {
  messages: Message[];
  activeUser: User;
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when messages update
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, []);

  if (!activeUser) {
    return (
      <div className="container flex h-full flex-col items-center justify-center">
        <MessagesSquare className="text-muted-foreground h-20 w-20" />
        <p className="text-muted-foreground mt-4">請先選擇聯絡人</p>
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full flex-col">
      {messages.length === 0 && (
        <div className="mx-auto mt-8 space-y-4 text-center">
          <p className="text-muted-foreground">尚無訊息</p>
          <p className="text-muted-foreground">
            在下方輸入匡發送第一則訊息吧！
          </p>
        </div>
      )}

      <ScrollArea
        className="w-ful relativel flex-grow px-4 py-0"
        ref={scrollAreaRef}
      >
        <div className="h-16" />
        {messages.map((message) => (
          <div
            key={message.id}
            className={`relative mb-4 flex ${
              message.role !== "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.role === "user" && (
              <Avatar className="mr-2 h-8 w-8">
                <AvatarImage src={activeUser.pictureUrl || ""} alt="User" />
                <AvatarFallback>
                  {activeUser.displayName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            )}
            <div
              className={`flex max-w-[70%] flex-col ${
                message.role !== "user" ? "items-end" : "items-start"
              }`}
            >
              <p
                className={`mt-1 text-xs ${
                  message.role !== "user" ? "text-right" : "text-left"
                } text-muted-foreground`}
              >
                {message.role === "user" && activeUser.displayName}
              </p>
              <MessageBubble message={message} />
              <p
                className={`mt-1 text-xs ${
                  message.role !== "user" ? "text-right" : "text-left"
                } text-muted-foreground`}
              >
                {format(message.createdAt, "PPP p", { locale: zhTW })}
              </p>
            </div>
          </div>
        ))}

        {/* Gradient overlays */}
        <div className="from-background absolute left-0 right-0 top-0 h-8 bg-gradient-to-b to-transparent" />
        <div className="from-background absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t to-transparent" />
        <div className="h-96" />
      </ScrollArea>

      <div className="absolute bottom-0 left-0 right-0 w-full pb-[10svh]">
        <MessageInput activeUser={activeUser} />
      </div>
    </div>
  );
};
