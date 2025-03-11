import { messageEventHandler } from "@/event-handler/user-event-handler/message-event-handler/index.js";
import { webhook } from "@line/bot-sdk";

export const userEventHandler = async (event: webhook.Event) => {
  if (event.source?.type !== "user") {
    return;
  }

  // TODO: Implement other event types.
  switch (event.type) {
    case "message":
      return messageEventHandler(event);
    default:
      return;
  }
};
