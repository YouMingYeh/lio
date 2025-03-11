"use server";

import {
  ClientConfig,
  GroupSummaryResponse,
  messagingApi,
} from "@line/bot-sdk";

const clientConfig: ClientConfig = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN!,
};

// Create a new LINE SDK client.
const client = new messagingApi.MessagingApiClient(clientConfig);

type SendTextMessagePayload = {
  to: string;
  message: string;
};

export async function sendTextMessage(payload: SendTextMessagePayload) {
  const url = "https://line.adastra.tw/send-text-message";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const result = (await response.json()) as {
      sentMessages: { id: string }[];
    };
    return result.sentMessages;
  } catch (error) {
    console.error("Failed to send text message:", error);
  }
}

type sendImageMessagePayload = {
  to: string;
  imageUrl: string;
  previewUrl: string;
};

export async function sendImageMessage(payload: sendImageMessagePayload) {
  const url = "https://line.lio.tw/send-image-message";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const result = (await response.json()) as {
      sentMessages: { id: string }[];
    };
    return result.sentMessages;
  } catch (error) {
    console.error("Failed to send image message:", error);
  }
}

export async function getGroupSummary(teamId: string, groupId: string) {
  const url = "https://line.lio.tw/get-group-summary";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ teamId, groupId }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const result = (await response.json()) as {
      groupSummary: GroupSummaryResponse;
    };
    return result.groupSummary;
  } catch (error) {
    console.error("Failed to send image message:", error);
  }
}

export async function getGroupMembersProfiles(groupId: string) {
  const idsResponse = await client.getGroupMembersIds(groupId);
  const profiles = await Promise.all(
    idsResponse.memberIds.map((id) => client.getProfile(id)),
  );

  return profiles;
}
