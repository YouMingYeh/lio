import { blobClient, client } from "@/client/messaging-api.js";
import { LINEAPIClient } from "@/lib/messaging-api/index.js";
import { removeMarkdown, trimStringRegex } from "@/lib/utils.js";
import { messagingApi } from "@line/bot-sdk";

export async function sendTextMessage(
  to: string,
  message: string,
): Promise<messagingApi.SentMessage[]> {
  const lineApiClient = new LINEAPIClient(client, blobClient);

  const pureText = removeMarkdown(trimStringRegex(message));
  const sentMessages = await lineApiClient.sendMessages(
    [
      {
        type: "text",
        text: pureText,
      },
    ],
    to,
  );

  return sentMessages;
}

export async function sendImageMessage(
  to: string,
  imageUrl: string,
  previewUrl: string,
): Promise<messagingApi.SentMessage[]> {
  const lineApiClient = new LINEAPIClient(client, blobClient);
  const sentMessages = await lineApiClient.sendMessages(
    [
      {
        type: "image",
        originalContentUrl: imageUrl,
        previewImageUrl: previewUrl,
      },
    ],
    to,
  );
  return sentMessages;
}
