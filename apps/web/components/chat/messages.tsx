import { PreviewMessage, ThinkingMessage } from "./message";
import { useScrollToBottom } from "@/hooks/use-scroll-to-bottom";
import { ChatRequestOptions, Message } from "ai";
import equal from "fast-deep-equal";
import { memo } from "react";

interface MessagesProps {
  chatId: string;
  isLoading: boolean;
  messages: Array<Message>;
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[]),
  ) => void;
  reload: (
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  isReadonly: boolean;
}

function PureMessages({
  chatId,
  isLoading,
  messages,
  setMessages,
  reload,
  isReadonly,
}: MessagesProps) {
  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();
  return (
    <div
      className="flex min-w-0 flex-1 flex-col gap-6 overflow-y-scroll pt-4"
      ref={messagesContainerRef}
    >
      <div className="min-h-[24px] min-w-[24px] shrink-0" />
      {messages.map((message, index) => (
        <PreviewMessage
          key={message.id}
          chatId={chatId}
          message={message}
          isLoading={isLoading && messages.length - 1 === index}
          setMessages={setMessages}
          reload={reload}
          isReadonly={isReadonly}
          isLastMessage={index === messages.length - 1}
        />
      ))}

      {isLoading &&
        messages.length > 0 &&
        messages?.[messages.length - 1]?.role === "user" && <ThinkingMessage />}
      {/* gradient overlay */}
      <div className="from-background absolute left-0 right-0 top-0 h-6 bg-gradient-to-b to-transparent" />
      <div className="from-background absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-t to-transparent" />
      <div className="min-h-[24px] min-w-[24px] shrink-0" />
      <div
        ref={messagesEndRef}
        className="min-h-[24px] min-w-[24px] shrink-0"
      />
    </div>
  );
}

export const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.isLoading !== nextProps.isLoading) return false;
  if (prevProps.isLoading && nextProps.isLoading) return false;
  if (prevProps.messages.length !== nextProps.messages.length) return false;
  if (!equal(prevProps, nextProps)) return false;

  return true;
});
