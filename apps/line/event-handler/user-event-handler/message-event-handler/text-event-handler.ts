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
import { CoreMessage, CoreUserMessage, ToolCallPart, ToolResultPart } from "ai";

// Define proper types instead of using 'any'
interface Step {
  text: string;
  toolCalls?: ToolCallPart[];
  toolResults?: ToolResultPart[];
}

interface GeneratedOutput {
  steps?: Step[];
}

/**
 * Handles text message events from LINE
 */
const textEventHandler = async (
  event: webhook.MessageEvent,
  messages: Message[],
  tasks: Task[],
  user: User,
) => {
  if (event.message.type !== "text" || !event.replyToken) {
    return;
  }

  const lineApiClient = new LINEAPIClient(client, blobClient);
  const repository = new Repository();
  const textMessage = event.message as webhook.TextMessageContent;
  const userMessageText = textMessage.text;

  // Create and save the user's message
  const newUserMessage = createUserMessage(userMessageText);
  await saveUserMessage(repository, user, userMessageText);

  // Generate and process AI reply
  const systemPrompt = await buildSystemPrompt(messages, tasks, user);
  const formattedMessages = messages.map((message) => ({
    role: message.role,
    content: message.content,
  })) as CoreMessage[];
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
 * Creates a user message object from text
 */
function createUserMessage(text: string): CoreUserMessage {
  return {
    role: "user",
    content: [{ type: "text", text }],
  } as CoreUserMessage;
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
  formattedMessages: CoreMessage[],
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
 * Saves a user message to the repository
 */
async function saveUserMessage(
  repository: Repository,
  user: User,
  text: string,
): Promise<void> {
  await repository.createMessage({
    userId: user.id,
    role: "user",
    content: [{ type: "text", text }] as CoreMessageContent as Json,
  });
}

export default textEventHandler;
