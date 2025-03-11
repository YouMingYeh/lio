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
import { CoreAssistantMessage, CoreUserMessage, ImagePart } from "ai";

const stickerEventHandler = async (
  event: webhook.MessageEvent,
  messages: Message[],
  tasks: Task[],
  user: User,
) => {
  if (event.message.type !== "sticker") return;
  const lineApiClient = new LINEAPIClient(client, blobClient);

  const repository = new Repository();
  const stickerMessage = event.message as webhook.StickerMessageContent;

  const stickerUrl = `https://stickershop.line-scdn.net/stickershop/v1/sticker/${stickerMessage.stickerId}/ANDROID/sticker.png`;

  const imageParts = [
    {
      type: "image",
      image: stickerUrl,
    },
  ] as ImagePart[];

  const newMessage = {
    role: "user",
    content: imageParts,
  };

  if (!event.replyToken) {
    return;
  }

  const systemPrompt = await buildSystemPrompt(messages, tasks, user);

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

  // Save the user’s message
  await repository.createMessage({
    userId: user.id,
    role: "user",
    content: imageParts as CoreMessageContent as Json,
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

export default stickerEventHandler;
