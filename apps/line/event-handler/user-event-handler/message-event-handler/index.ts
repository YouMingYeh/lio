import audioEventHandler from "./audio-event-handler.js";
import fileEventHandler from "./file-event-handler.js";
import imageEventHandler from "./image-event-handler.js";
import stickerEventHandler from "./sticker-event-handler.js";
import textEventHandler from "./text-event-handler.js";
import videoEventHandler from "./video-event-handler.js";
import { blobClient, client } from "@/client/messaging-api.js";
import { LINEAPIClient } from "@/lib/messaging-api/index.js";
import { Repository } from "@/lib/repository/index.js";
import { webhook } from "@line/bot-sdk";

export const messageEventHandler = async (
  event: webhook.MessageEvent,
): Promise<void> => {
  const lineApiClient = new LINEAPIClient(client, blobClient);
  const repository = new Repository();

  if (!event.source || !event.source.userId) {
    console.error("No source found.");
    return;
  }

  await lineApiClient.showLoadingAnimation(event.source.userId);

  const profile = await lineApiClient.getUserProfile(event.source.userId);

  // Check existing
  const { data } = await repository.getUserByLineUserId(event.source.userId);
  if (!data) {
    // handle create new user
    await repository.createUser({
      lineUserId: profile.userId,
      displayName: profile.displayName,
      pictureUrl: profile.pictureUrl,
    });
  }

  // 1. Fetch user
  const { data: user } = await repository.getUserByLineUserId(
    event.source.userId,
  );
  if (!user) {
    console.error("User not found.");
    return;
  }
  // 2. Fetch messages
  const { data: messages } = await repository.getMessagesByUserId(user.id);
  if (!messages) {
    console.error("Messages not found.");
    return;
  }

  // 3. Fetch tasks
  const { data: tasks } = await repository.getTasksByUserId(user.id);
  if (!tasks) {
    console.error("Tasks not found.");
    return;
  }

  try {
    switch (event.message.type) {
      case "text":
        return textEventHandler(event, messages, tasks, user);
      case "image":
        return imageEventHandler(event, messages, tasks, user);
      case "sticker":
        return stickerEventHandler(event, messages, tasks, user);
      case "file":
        return fileEventHandler(event, messages, tasks, user);
      case "audio":
        return audioEventHandler(event, messages, tasks, user);
      case "video":
        return videoEventHandler(event, messages, tasks, user);
      default:
        if (!event.replyToken) {
          return;
        }
        await lineApiClient.replyTextMessage(
          event.replyToken,
          "哎呀！🚨 這個訊息好像超出我的理解範圍！請試試其他類型的訊息，希望下次能幫上忙！。",
        );
    }
  } catch {
    if (!event.replyToken) {
      return;
    }
    await lineApiClient.replyTextMessage(
      event.replyToken,
      "⚠️ 我剛剛遇到了一點小問題 🛠️，讓我重新啟動一下，請稍後再試。",
    );
  }
};

export default messageEventHandler;
