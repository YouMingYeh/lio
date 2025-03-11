"use client";

import { Messages } from "./messages";
import { MultimodalInput } from "./multimodal-input";
import { cn } from "@workspace/ui/lib/utils";
import type { Attachment, Message } from "ai";
import { useChat } from "ai/react";
import { useEffect, useState } from "react";

export function Chat({
  id,
  initialMessages,
  initialInput,
  initialAttachments,
  autoSubmitInitialInput = false,
  isReadonly,
  suggestedActions = [
    {
      title: "請問",
      action: "請問您會做什麼？",
      label: "您會做什麼？",
    },
    {
      title: "我想了解",
      action: "我想了解團隊中發生的最新資訊",
      label: "團隊中發生的最新資訊",
    },
  ],
  className,
  api,
  body,
}: {
  id: string;
  initialMessages: Array<Message>;
  initialInput?: string;
  initialAttachments?: Array<Attachment>;
  autoSubmitInitialInput?: boolean;
  isReadonly: boolean;
  suggestedActions?: Array<{
    title: string;
    action: string;
    label: string;
  }>;
  className?: string;
  api?: string;
  body?: Record<string, unknown>;
}) {
  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    append,
    isLoading,
    stop,
    reload,
  } = useChat({
    id,
    body: { ...body, id },
    initialMessages,
    initialInput,
    experimental_throttle: 100,
    api,
    maxSteps: 10,
  });

  const [attachments, setAttachments] = useState<Array<Attachment>>(
    initialAttachments || [],
  );

  useEffect(() => {
    if (!initialInput || !autoSubmitInitialInput) {
      return;
    }
    const timer = setTimeout(() => {
      handleSubmit(undefined);
    }, 500);
    return () => clearTimeout(timer);
  }, [autoSubmitInitialInput]);

  return (
    <>
      <div
        className={cn("bg-muted flex h-dvh w-full min-w-0 flex-col", className)}
      >
        <Messages
          chatId={id}
          isLoading={isLoading}
          messages={messages}
          setMessages={setMessages}
          reload={reload}
          isReadonly={isReadonly}
        />

        <form className="mx-auto flex w-full gap-2 px-4 pb-4 md:max-w-3xl md:pb-6">
          {!isReadonly && (
            <MultimodalInput
              chatId={id}
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              stop={stop}
              attachments={attachments}
              setAttachments={setAttachments}
              messages={messages}
              setMessages={setMessages}
              append={append}
              suggestedActions={suggestedActions}
            />
          )}
        </form>
      </div>
    </>
  );
}
