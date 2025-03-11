import { google } from "@ai-sdk/google";
import {
  type Message,
  createDataStreamResponse,
  smoothStream,
  streamText,
} from "ai";

export async function POST(request: Request) {
  const { messages, system }: { messages: Array<Message>; system?: string } =
    await request.json();

  return createDataStreamResponse({
    execute: (dataStream) => {
      const result = streamText({
        model: google("gemini-2.0-flash-001"),
        system,
        messages: messages,
        onFinish: async () => {},
        experimental_telemetry: {
          isEnabled: true,
          functionId: "stream-text",
        },
        experimental_continueSteps: true,
        experimental_transform: smoothStream(),
      });

      result.mergeIntoDataStream(dataStream);
    },
  });
}
