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
  FilePart,
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
 * Handles file message events from LINE
 */
const fileEventHandler = async (
  event: webhook.MessageEvent,
  messages: Message[],
  tasks: Task[],
  user: User,
) => {
  if (event.message.type !== "file" || !event.replyToken) {
    return;
  }

  const lineApiClient = new LINEAPIClient(client, blobClient);
  const repository = new Repository();
  const fileMessage = event.message as webhook.FileMessageContent;

  // Retrieve and upload the file
  const fileParts = await retrieveAndUploadFile(
    lineApiClient,
    repository,
    fileMessage.id,
  );
  const newUserMessage = createFileMessage(fileParts);

  // Save the user's message
  await saveFileMessage(repository, user, fileParts);

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
  );

  // Save tool results if any
  if (toolCalls.length > 0 && toolResults.length > 0) {
    await saveToolResult(repository, user, toolCalls, toolResults);
  }
};

/**
 * Retrieves and uploads a file from LINE messaging API
 */
async function retrieveAndUploadFile(
  lineApiClient: LINEAPIClient,
  repository: Repository,
  messageId: string,
): Promise<FilePart[]> {
  const content = await lineApiClient.getMessageFile(messageId);
  const url = await repository.uploadFile(content, messageId);

  return [
    {
      type: "text",
      text: "(This is a file, please respond to it but DO NOT EXPOSE YOUR THINKING STEPS)",
    },
    {
      type: "file",
      data: url,
      mimeType: content.type,
    },
  ] as FilePart[];
}

/**
 * Creates a user message object from file parts
 */
function createFileMessage(fileParts: FilePart[]): CoreUserMessage {
  return {
    role: "user",
    content: fileParts,
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
 * Saves a file message to the repository
 */
async function saveFileMessage(
  repository: Repository,
  user: User,
  fileParts: FilePart[],
): Promise<void> {
  await repository.createMessage({
    userId: user.id,
    role: "user",
    content: fileParts as CoreMessageContent as Json,
  });
}

export default fileEventHandler;
