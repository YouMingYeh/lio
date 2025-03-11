import { userEventHandler } from "./user-event-handler/index.js";
import { webhook } from "@line/bot-sdk";

export const eventHandler = async (event: webhook.Event) => {
  if (event.source?.type === "user") {
    return userEventHandler(event);
  }
};
