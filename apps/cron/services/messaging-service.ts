import { sendTextMessage } from "@/lib/line.js";
import {
  createUserMessage,
  getUserById,
} from "@/repositories/message-repository.js";
import { User, PushMessageJobParameters } from "@/types.js";

export async function pushMessages(
  userId: string,
  parameters: PushMessageJobParameters,
) {
  console.log("Pushing messages...");
  // Push user messages
  const { data } = await getUserById(userId);
  if (!data) {
    console.error(`User ${userId} not found.`);
    return {
      data: null,
      error: new Error(`User ${userId} not found.`),
    };
  }
  const user = data;
  console.log(`Pushing message to user ${userId}`);
  const message = parameters.payload.message;
  const { error } = await pushUserMessage(user, message);
  if (error) {
    console.error("Failed to push message to user:", error.message);
    return { data: null, error };
  }
  const { error: CreateError } = await createUserMessage({
    userId: user.id,
    content: [{ type: "text", text: message }],
    role: "assistant",
  });
  if (CreateError) {
    console.error("Failed to create user message:", CreateError);
    return { data: null, error: CreateError };
  }
  return { data: "Message pushed", error: null };
}

export async function pushUserMessage(user: User, content: string) {
  if (!user.lineUserId) {
    console.log(`User ${user.id} has no Line user ID.`);
    return {
      data: null,
      error: new Error(`User ${user.id} has no Line user ID.`),
    };
  }
  const { error } = await sendTextMessage({
    to: user.lineUserId,
    message: content,
  });
  if (error) {
    console.error("Failed to push message to user:", error.message);
    return { data: null, error };
  }
  return { data: "Message pushed", error: null };
}
