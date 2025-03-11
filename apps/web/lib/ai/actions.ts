"use server";

import { google } from "@ai-sdk/google";
import { CoreMessage, generateText } from "ai";

export async function generateTextWithPrompt(system: string, prompt: string) {
  const { text } = await generateText({
    model: google("gemini-2.0-flash-001"),
    system: system,
    prompt: prompt,
  });
  return text;
}

export async function generateTextWithMessages(
  system: string,
  messages: CoreMessage[],
) {
  const { text } = await generateText({
    model: google("gemini-2.0-flash-001"),
    system: system,
    messages: messages,
  });
  return text;
}
