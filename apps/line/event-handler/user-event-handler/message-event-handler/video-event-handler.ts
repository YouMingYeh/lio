import {
  buildSystemPrompt,
  generateAiReply,
  processAiReplySteps,
} from "./utils.js";
import { blobClient, client } from "@/client/messaging-api.js";
import { Json } from "@/database.types.js";
import { LINEAPIClient } from "@/lib/messaging-api/index.js";
import { Repository } from "@/lib/repository/index.js";
import { CoreMessageContent, Message, User, Task } from "@/lib/types.js";
import { webhook } from "@line/bot-sdk";
import { CoreAssistantMessage, CoreUserMessage, FilePart } from "ai";

const videoEventHandler = async (
  event: webhook.MessageEvent,
  messages: Message[],
  tasks: Task[],
  user: User,
) => {
  if (event.message.type !== "video") return;
  const lineApiClient = new LINEAPIClient(client, blobClient);

  const repository = new Repository();
  const message = event.message as webhook.VideoMessageContent;

  const content = await lineApiClient.getMessageFile(message.id);
  const url = await repository.uploadFile(content, message.id);
  const fileParts = [
    {
      type: "text",
      text: "(This is an video file, please repond it but DO NOT EXPOSE YOUR THINKING STEPS)",
    },
    {
      type: "file",
      data: url,
      mimeType: content.type,
    },
  ] as FilePart[];

  const newMessage = { role: "user", content: fileParts };

  const systemPrompt = await buildSystemPrompt(messages, tasks, user);
  if (!event.replyToken) {
    return;
  }

  let finalSteps = [];
  const generated = await generateAiReply(
    user,
    repository,
    messages.map((message) => {
      if (message.role === "assistant") {
        return {
          role: "assistant",
          content: message.content as CoreMessageContent,
        } as CoreAssistantMessage;
      } else {
        return {
          role: "user",
          content: message.content as CoreMessageContent,
        } as CoreUserMessage;
      }
    }),
    systemPrompt,
    newMessage as CoreUserMessage,
  );

  finalSteps =
    generated.steps.length > 0
      ? // remove duplicated steps first and them join them
        generated.steps
          .filter(
            (step, index, self) =>
              index ===
              self.findIndex((t) => t.text.trim() === step.text.trim()),
          )
          .map((step) => step.text)
      : [];

  if (finalSteps.length === 0) {
    // Try again here
    const retryGenerated = await generateAiReply(
      user,
      repository,
      messages.map((message) => {
        if (message.role === "assistant") {
          return {
            role: "assistant",
            content: message.content as CoreMessageContent,
          } as CoreAssistantMessage;
        } else {
          return {
            role: "user",
            content: message.content as CoreMessageContent,
          } as CoreUserMessage;
        }
      }),
      systemPrompt,
      newMessage as CoreUserMessage,
    );
    finalSteps =
      retryGenerated.steps.length > 0
        ? retryGenerated.steps
            .filter(
              (step, index, self) =>
                index ===
                self.findIndex((t) => t.text.trim() === step.text.trim()),
            )
            .map((step) => step.text)
        : [];
  }

  if (finalSteps.length === 0) {
    finalSteps = ["I'm sorry, I don't understand. Please try again."];
  }

  await repository.createMessage({
    userId: user.id,
    content: fileParts as CoreMessageContent as Json,
    role: "user",
  });

  await processAiReplySteps(
    lineApiClient,
    repository,
    user,
    event.replyToken,
    finalSteps,
    event.message.quoteToken,
  );
};

export default videoEventHandler;
