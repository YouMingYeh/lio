import {
  buildSystemPrompt,
  generateAiReply,
  processAiReplySteps,
  saveToolResult,
} from "./utils.js";
import { blobClient, client } from "@/client/messaging-api.js";
import { Json } from "@/database.types.js";
import { LINEAPIClient } from "@/lib/messaging-api/index.js";
import { Repository } from "@/lib/repository/index.js";
import { CoreMessageContent, Message, User, Task } from "@/lib/types.js";
import { webhook } from "@line/bot-sdk";
import {
  CoreAssistantMessage,
  CoreUserMessage,
  ImagePart,
  ToolCallPart,
  ToolResultPart,
} from "ai";

// Define proper types instead of using any
interface Step {
  text: string;
  toolCalls?: ToolCallPart[];
  toolResults?: ToolResultPart[];
}

interface GeneratedOutput {
  steps?: Step[];
}

/**
 * Handles sticker message events from LINE
 */
const stickerEventHandler = async (
  event: webhook.MessageEvent,
  messages: Message[],
  tasks: Task[],
  user: User,
) => {
  if (event.message.type !== "sticker" || !event.replyToken) {
    return;
  }

  const lineApiClient = new LINEAPIClient(client, blobClient);
  const repository = new Repository();
  const stickerMessage = event.message as webhook.StickerMessageContent;

  // Create and save the user's sticker message
  const newUserMessage = createStickerMessage(stickerMessage.stickerId);
  await saveStickerMessage(
    repository,
    user,
    newUserMessage.content as ImagePart[],
  );

  // Generate and process AI reply
  const systemPrompt = await buildSystemPrompt(messages, tasks, user);
  const formattedMessages = convertMessagesToAiFormat(messages);

  const { steps, toolCalls, toolResults } = await generateAiReplyWithRetry(
    user,
    repository,
    formattedMessages,
    systemPrompt,
    newUserMessage,
  );

  // Process the AI reply steps
  await processAiReplySteps(
    lineApiClient,
    repository,
    user,
    event.replyToken,
    steps,
    event.message.quoteToken,
  );

  // Save tool results if any
  if (toolCalls.length > 0 && toolResults.length > 0) {
    await saveToolResult(repository, user, toolCalls, toolResults);
  }
};

/**
 * Creates a user message object from a sticker ID
 */
function createStickerMessage(stickerId: string): CoreUserMessage {
  const stickerUrl = `https://stickershop.line-scdn.net/stickershop/v1/sticker/${stickerId}/ANDROID/sticker.png`;

  return {
    role: "user",
    content: [
      {
        type: "image",
        image: stickerUrl,
      },
    ],
  } as CoreUserMessage;
}

/**
 * Converts messages to the format expected by AI functions
 */
function convertMessagesToAiFormat(
  messages: Message[],
): (CoreAssistantMessage | CoreUserMessage)[] {
  return messages.map((message) => {
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
  });
}

/**
 * Processes generated steps to remove duplicates
 */
function processGeneratedOutput(generated: GeneratedOutput): {
  steps: string[];
  toolCalls: ToolCallPart[];
  toolResults: ToolResultPart[];
} {
  if (!generated.steps || generated.steps.length === 0) {
    return {
      steps: ["I'm sorry, I don't understand. Please try again."],
      toolCalls: [],
      toolResults: [],
    };
  }

  const uniqueSteps = generated.steps
    .filter(
      (step: Step, index: number, self: Step[]) =>
        index === self.findIndex((t) => t.text.trim() === step.text.trim()),
    )
    .map((step: Step) => step.text);

  const toolCalls: ToolCallPart[] = generated.steps.flatMap(
    (step: Step) => step.toolCalls || [],
  );
  const toolResults: ToolResultPart[] = generated.steps.flatMap(
    (step: Step) => step.toolResults || [],
  );

  return { steps: uniqueSteps, toolCalls, toolResults };
}

/**
 * Generates AI reply with retry mechanism
 */
async function generateAiReplyWithRetry(
  user: User,
  repository: Repository,
  formattedMessages: (CoreAssistantMessage | CoreUserMessage)[],
  systemPrompt: string,
  newMessage: CoreUserMessage,
): Promise<{
  steps: string[];
  toolCalls: ToolCallPart[];
  toolResults: ToolResultPart[];
}> {
  // First attempt
  const generated = await generateAiReply(
    user,
    repository,
    formattedMessages,
    systemPrompt,
    newMessage,
  );

  let result = processGeneratedOutput(generated as GeneratedOutput);

  // Retry if no steps were generated
  if (
    result.steps.length === 0 ||
    (result.steps[0] &&
      result.steps[0].includes("I'm sorry, I don't understand"))
  ) {
    const retryGenerated = await generateAiReply(
      user,
      repository,
      formattedMessages,
      systemPrompt,
      newMessage,
    );
    result = processGeneratedOutput(retryGenerated as GeneratedOutput);
  }

  return result;
}

/**
 * Saves a sticker message to the repository
 */
async function saveStickerMessage(
  repository: Repository,
  user: User,
  imageParts: ImagePart[],
): Promise<void> {
  await repository.createMessage({
    userId: user.id,
    role: "user",
    content: imageParts as CoreMessageContent as Json,
  });
}

export default stickerEventHandler;
