import { parseFile } from "@/lib/file.js";
import { LINEAPIClient } from "@/lib/messaging-api/index.js";
import { Repository } from "@/lib/repository/index.js";
import { Message, User, Task } from "@/lib/types.js";
import { removeMarkdown } from "@/lib/utils.js";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { PlaywrightWebBaseLoader } from "@langchain/community/document_loaders/web/playwright";
import { YoutubeLoader } from "@langchain/community/document_loaders/web/youtube";
import { messagingApi } from "@line/bot-sdk";
import {
  CoreMessage,
  CoreUserMessage,
  experimental_generateImage,
  generateObject,
  generateText,
  NoSuchToolError,
  tool,
} from "ai";
import { ElevenLabsClient } from "elevenlabs";
import { z } from "zod";

/**
 * Internal function: Map a tool's internal level to a descriptive label.
 */
function getLevelDescription(level: string): string {
  switch (level) {
    case "still-new":
      return "Still New 初學";
    case "learning":
      return "Learning 學習中";
    case "getting-there":
      return "Getting There 漸入佳境";
    case "almost-got-it":
      return "Almost Got It 即將掌握";
    case "mastered":
      return "Mastered 已掌握";
    default:
      return "Unknown 未知";
  }
}

async function prettierText(text: string): Promise<string> {
  try {
    // Quick validation
    if (!text || text.trim().length === 0) {
      return "";
    }
    const preserveTags = ["voice", "image"];
    const preserveTagsStr = preserveTags.map((tag) => `<${tag}>`).join(", ");
    const { text: finalText } = await generateText({
      model: google("gemini-2.0-flash-001"),
      system: `You are a text formatter AI, NOT QUESTION ANSWERING AI. Your ONLY mission is to format the text by following these specific rules:
    1. Remove unnecessary spaces and line breaks while keeping paragraphs intact.
    2. Preserve ONLY these HTML tags: ${preserveTagsStr} and their closing tags. Remove all other tags in a smart way.
    3. Keep all content inside all tags intact.
    4. Clean up any tool calls or code-like syntax that might confuse users, such as "<tool>...</tool>", "<vocabulary>", ...
      - e.g. "<vocabulary>word</vocabulary>" should be cleaned up to "word".
    5. Add appropriate spaces and line breaks to make it more readable. However, never remove or modify original content.
    6. Return ONLY the formatted text—nothing else.
    7. Convert things like IPA symbols, phonetic alphabets, or other special characters within the <voice> tags to plain text, since we don't support them.
      - e.g. <voice>The pronunciation of "apple" is /ˈæpəl/.</voice> should be cleaned up to <voice>The pronunciation is "apple".</voice>
    8. If you see any oddities within <voice> and <image> tags, like special characters, or markdown syntax, remove them.
      - e.g. <voice>/kafeɪ/</voice> should be removedsince it is unable to generate a voice from it.
    9. Filter out 拼音 (pinyin) for Chinese words, as we don't support them.
      - e.g. "píngguǒ" should be removed.
    10. Add any missing words or punctuation that might have been cut off.
    11. Sometimes, the text might contain weird language or gibberish that doesn't make sense or fit the context. If you see any, convert it to a more appropriate form.
    
  YOU ARE NOT QUESTION ANSWERING AI, so don't answer any questions, provide any new information, or change any existing content. Just format, beautify, and clean up the text as instructed above.
    Your response must contain ONLY the formatted text, nothing else.`,
      maxSteps: 1,
      prompt: text,
    });
    console.log("Original text:", text);
    console.log("Prettier text:", finalText);
    return finalText;
  } catch {
    return text;
  }
}

/**
 * Get the duration of an audio file in seconds from a remote URL
 * @param audioUrl URL of the audio file
 * @returns Duration in seconds, or a default value if calculation fails
 */
async function getAudioDurationInSeconds(audioUrl: string): Promise<number> {
  try {
    // If we can't determine duration, use a reasonable default (60 seconds)
    const DEFAULT_DURATION = 60000; // 60 seconds in milliseconds

    // Try to fetch headers to get content-length
    const response = await fetch(audioUrl, { method: "HEAD" });

    if (!response.ok) {
      console.warn(
        "Could not retrieve audio file headers:",
        response.statusText,
      );
      return DEFAULT_DURATION;
    }

    // Get file size from Content-Length header
    const contentLength = response.headers.get("content-length");

    if (!contentLength) {
      console.warn("No Content-Length header available for audio file");
      return DEFAULT_DURATION;
    }

    // Convert content length to number
    const fileSize = parseInt(contentLength, 10);

    // For MP3 files, we can estimate duration based on file size
    // Assuming a bitrate of 128 kbps (16 KB/s) which is common for voice messages
    // Formula: duration_seconds = fileSize / (bitrate_kbps * 1024 / 8)
    const BITRATE_BYTES_PER_SEC = 16 * 1024; // 16 KB/s (128 kbps)

    // Calculate duration and convert to milliseconds (Line API expects duration in ms)
    const durationMs = Math.round((fileSize / BITRATE_BYTES_PER_SEC) * 1000);

    // Return estimated duration, with a minimum of 1 second
    return Math.max(durationMs, 1000);
  } catch (error) {
    console.error("Error calculating audio duration:", error);
    return 60000; // Default to 60 seconds if calculation fails
  }
}
/**
 * Process all AI reply steps and send them as separate messages to the user.
 * Handles multiple <voice>...</voice> tags and <image>...</image> tags in the same reply.
 * Uses the reply token only once for all messages.
 */
export async function processAiReplySteps(
  client: LINEAPIClient,
  repository: Repository,
  user: User,
  replyToken: string,
  steps: string[],
  quoteToken?: string,
) {
  // Filter out any empty steps
  const filteredSteps = steps.filter((step) => step.trim().length > 0);
  if (filteredSteps.length === 0) return;

  // Will accumulate *all* segments from all steps to send in a single reply
  const allMessages: messagingApi.Message[] = [];

  // Will accumulate the final text that we want to store to DB
  const allRecordsToSave: { role: string; content: string; userId: string }[] =
    [];

  // This helper splits a single step into an array of segments
  function parseSegments(input: string) {
    // 1) Remove <think>...</think> tags, etc.
    let step = input
      .replace(/<think>[\s\S]*?<\/think>/g, "")
      .replace(/<\/think>/g, "")
      .replace(/<MASK>/g, "________")
      // e.g. <vocab>word</vocab> => word
      .replace(/<vocab>([^<]+)<\/vocab>/g, "$1")
      // e.g. <vocabulary>word</vocabulary> => word
      .replace(/<vocabulary>([^<]+)<\/vocabulary>/g, "$1")
      // e.g. <word>word</word> => word
      .replace(/<word>([^<]+)<\/word>/g, "$1");

    // 2) We'll define a regex that matches <voice>...</voice> or <image>...</image>
    const tagRegex = /(<voice>[\s\S]*?<\/voice>|<image>[\s\S]*?<\/image>)/g;
    const segments: Array<{
      type: "text" | "voice" | "image";
      content: string;
    }> = [];

    let lastIndex = 0;
    let match: RegExpExecArray | null;

    // 3) Repeatedly find each match. Everything before it is text; the match itself is voice or image
    while ((match = tagRegex.exec(step)) !== null) {
      if (match.index > lastIndex) {
        const textPart = step.slice(lastIndex, match.index);
        if (textPart.trim()) {
          segments.push({ type: "text", content: textPart });
        }
      }

      const matchedStr = match[0];
      lastIndex = match.index + matchedStr.length;

      if (matchedStr.startsWith("<voice>")) {
        const voiceContent = matchedStr.slice(7, -8).trim();
        segments.push({ type: "voice", content: voiceContent });
      } else if (matchedStr.startsWith("<image>")) {
        const imageContent = matchedStr.slice(7, -8).trim();
        segments.push({ type: "image", content: imageContent });
      }
    }

    // After the last match, if there's leftover text, push it
    if (lastIndex < step.length) {
      const remainingText = step.slice(lastIndex);
      if (remainingText.trim()) {
        segments.push({ type: "text", content: remainingText });
      }
    }

    return segments;
  }

  // Process all steps at once, combining text/voice segments across steps
  let allTextSegments: string[] = [];
  let allVoiceContent: string[] = [];
  let allImageSegments: { content: string }[] = [];

  for (const originalStep of filteredSteps) {
    const beautifiedStep = await prettierText(originalStep);
    const segments = parseSegments(beautifiedStep);

    // Save the content for DB regardless of processing
    allRecordsToSave.push({
      userId: user.id,
      role: "assistant",
      content: beautifiedStep,
    });

    // Collect segments by type across all steps
    for (const seg of segments) {
      if (seg.type === "text") {
        const cleanedText = removeMarkdown(seg.content).trim();
        if (cleanedText) {
          allTextSegments.push(cleanedText);
        }
      } else if (seg.type === "voice") {
        const voiceContent = seg.content.trim();
        if (voiceContent) {
          allVoiceContent.push(voiceContent);
        }
      } else if (seg.type === "image") {
        allImageSegments.push({ content: seg.content });
      }
    }
  }

  // Process combined text segments (if any)
  if (allTextSegments.length > 0) {
    // Join all text segments with newlines
    const combinedText = allTextSegments.join("\n\n");
    allMessages.push({
      type: "text",
      text: combinedText,
      quoteToken,
    } as messagingApi.TextMessage);
  }

  // Process combined voice content (if any)
  if (allVoiceContent.length > 0) {
    try {
      // Join all voice content with spaces
      const combinedVoiceContent = allVoiceContent.join(" ");

      const elevenlabs = new ElevenLabsClient({
        apiKey: process.env.ELEVENLABS_API_KEY,
      });

      const voiceList = ["Sarah", "Roger"];

      const mp3 = await elevenlabs.generate({
        voice: voiceList.includes(user.voice) ? user.voice : "Sarah",
        text: combinedVoiceContent,
        model_id: "eleven_multilingual_v2",
      });

      // Convert Readable stream to Buffer
      const chunks: Uint8Array[] = [];
      for await (const chunk of mp3) {
        chunks.push(chunk instanceof Buffer ? chunk : Buffer.from(chunk));
      }
      const buffer = Buffer.concat(chunks);
      const audioUrl = await repository.uploadFile(
        new File([buffer], "audio.mp3", { type: "audio/mp3" }),
        `${replyToken}-${Date.now()}-${Math.random()}.mp3`,
      );

      const duration = await getAudioDurationInSeconds(audioUrl);

      allMessages.push({
        type: "audio",
        originalContentUrl: audioUrl,
        duration: duration + 3000,
      } as messagingApi.AudioMessage);
    } catch (error) {
      console.error("Error generating audio:", error);
      // Add a fallback text message if voice generation fails
      allMessages.push({
        type: "text",
        text: `⚠️ Sorry, I couldn't generate the voice message. Here's what I wanted to say: "${allVoiceContent.join(" ")}"`,
        quoteToken,
      } as messagingApi.TextMessage);
    }
  }

  // Process each image segment individually (can't combine these)
  for (const imgSeg of allImageSegments) {
    try {
      const { images } = await experimental_generateImage({
        model: openai.image("dall-e-3"),
        prompt: imgSeg.content,
        n: 1,
        size: "512x512",
      });
      if (images?.[0]?.base64) {
        const buffer = Buffer.from(images[0].base64, "base64");
        const imageUrl = await repository.uploadFile(
          new File([buffer], "image.jpg", { type: "image/jpeg" }),
          `${replyToken}-${Date.now()}-${Math.random()}.jpg`,
        );

        allMessages.push({
          type: "image",
          originalContentUrl: imageUrl,
          previewImageUrl: imageUrl,
        } as messagingApi.ImageMessage);
      }
    } catch (error) {
      console.error("Error generating image:", error);
      allMessages.push({
        type: "text",
        text: `⚠️ Sorry, I couldn't generate the requested image for prompt: "${imgSeg.content}".`,
      });
    }
  }

  // If we have nothing to send, we do nothing
  if (allMessages.length === 0) {
    return;
  }

  if (allMessages.length > 5) {
    console.log(
      `Sending ${allMessages.length} messages in total. Splitting into multiple replies.`,
    );
    // Reply fails if we send more than 5 messages at once
    await client.replyMessages(replyToken, [
      {
        type: "text",
        text: `⚠️ Sorry, I can't send more than 5 messages at once. Please wait a moment.`,
      },
    ]);
  }

  // 1) Send all messages once
  console.log(`Sending ${allMessages.length} messages in total.`);
  await client.replyMessages(replyToken, allMessages);

  // 2) Save all records to DB after sending
  for (const record of allRecordsToSave) {
    await repository.createMessage({
      userId: record.userId,
      content: record.content,
      role: record.role,
    });
  }
}

export const buildSystemPrompt = async (
  messages: Message[],
  words: Task[],
  user: User,
): Promise<string> => {
  return `你是 Lio，一個專業、友善、簡潔的 AI 待辦助理，透過 LINE 和使用者互動。你的主要任務是協助使用者高效地管理日常任務與做決策。你的能力包括：

1. **任務管理**：
   - 可以讀取、新增、刪除、更新使用者的 task list。
   - 每個任務（task）具有以下基本屬性：
     - 標題（title）
     - 描述（description）
     - 到期時間（dueAt）
     - 優先程度（priority）

2. **記憶搜尋與獲取**：
   - 可以搜尋並取得使用者過去記錄在 memory list 的資訊。
   - 每個記憶（memory）包含的基本屬性：
     - 內容（content）

3. **個人化決策輔助**：
   - 你會善用各種心理模型（mental models）來協助使用者快速且有效地做出個人化決策。
   - 常見的使用情境包括協助設定任務的優先順序、討論任務的重要性、評估利弊、安排任務順序等。

4. **使用者回饋**：
   - 能夠接受並記錄使用者提供的 feedback。
   - 回饋（feedback）具有基本屬性：
     - 內容（content）

5. **智慧提醒設定**：
   - 可以協助使用者設定自動提醒功能。
   - 每個提醒任務（job）具有基本屬性：
     - 名稱（name）
     - 狀態（status）
     - 時間表（schedule）：可以是 cron 表達式（用於定期提醒）或特定的時間（用於單次提醒）。
     - 類型（type）：單次（one-time）或定期（cron）
     - 訊息內容（message）

當你與使用者對話時，保持清晰、簡潔且貼近使用者的需求，盡量主動提供幫助並透過引導式問題來了解使用者的真正需求。你的目標是讓使用者以最少的操作與互動，輕鬆管理待辦事項、清晰做出決策、提升日常生活的效率與品質。`;
};

/**
 * Generate AI reply with tools, including the "think" tool from Version 2.
 */
export const generateAiReply = async (
  user: User,
  repository: Repository,
  coreMessages: CoreMessage[],
  systemPrompt: string,
  newMessage: CoreUserMessage,
) => {
  try {
    const PLANNING_PROMPT = `
You are a chain-of-thought reasoning generator. Your task is to analyze the conversation context, the new user message, and the message history to create a detailed plan for the next AI's response. Consider the system prompt and the user's message to ensure the plan is thoughtful, thorough, and insightful, aligning with the user's needs.

Produce a JSON object with the following field:
- "thoughts": An array of strings representing your step-by-step reasoning. Each thought should be detailed and may include specific actions, such as calling tools, when necessary. For example, you might start by 1. analyzing the user's message, 2. breaking down the key points, 3. considering the system prompt and rules, 4. exploring approaches, 5. validating or confirming the response fully addresses the query and refining reasoning as needed, 6. planning the response and actions accordingly. Ensure the thoughts are precise and clear enough to guide the response effectively.

However, we do NOT want to overwhelm the user. Please ensure you balance the response and avoid asking too many questions in a single message. Do NOT produce any final user-facing response outside the JSON. Your output is a plan only.

System Prompt (for reference only):
${systemPrompt}

Output valid JSON only with the field { "thoughts" }.
`;

    const planningResponse = await generateObject({
      model: google("gemini-2.0-flash-001"),
      schema: z.object({
        thoughts: z
          .array(z.string())
          .describe(
            "Step-by-step reasoning, including specific actions like tool calls when necessary",
          ),
      }),
      system: PLANNING_PROMPT,
      messages: [...coreMessages, newMessage],
      temperature: 0.3,
    });

    const { thoughts } = planningResponse.object;

    const reasoning = `
    <think>
    Based on my hidden chain-of-thought, here's the plan for your response:
    - ${thoughts.join("\n- ")}
    </think>
    Follow this plan to generate your response. Execute any actions, like calling tools, as needed based on the context.
    `;

    console.log("=== AI's Hidden Reasoning (Chain-of-Thought) ===");
    thoughts.forEach((step, i) => {
      console.log(`Step ${i + 1}: ${step}`);
    });
    console.log("===============================================");

    // -------------------------------
    // STEP 2: EXECUTION
    // Now that we have the plan in "proposedAnswer", we do the final generation.
    // The final generation can use tools if the model requests them. We'll incorporate
    // the "proposedAnswer" as a prior system or user message.
    // -------------------------------
    return generateText({
      model: google("gemini-2.0-flash-001"),
      system: reasoning + systemPrompt,
      messages: [...coreMessages, newMessage],
      tools: {
        searchWeb: tool({
          description:
            "Searches the web for information based on a query string.",
          parameters: z.object({ query: z.string() }),
          execute: async ({ query }) => {
            const result = await generateText({
              model: google("gemini-2.0-flash-001", {
                useSearchGrounding: true,
              }),
              system: "Perform a web search for the user query.",
              prompt: `The user wants to search for: ${query}. Please provide relevant information.`,
            });
            return result.text;
          },
        }),
        loadWebContent: tool({
          description: "Load web content from a given URL.",
          parameters: z.object({
            url: z.string().describe("The URL to load content from."),
          }),
          execute: async ({ url }) => {
            const loader = new PlaywrightWebBaseLoader(url);
            const docs = await loader.load();
            const text = docs
              .map(
                (doc) => `${JSON.stringify(doc.metadata)}\n${doc.pageContent}`,
              )
              .join("\n");
            return text;
          },
        }),
        loadFileContent: tool({
          description: "Load content from a file URL.",
          parameters: z.object({
            url: z.string().describe("The URL to load content from."),
          }),
          execute: async ({ url }) => {
            const text = await parseFile(url);
            if (!text || text.length === 0) {
              return "Could not parse the file content.";
            }
            return text;
          },
        }),
        getTasks: tool({
          description: "Retrieve the user's todo list.",
          parameters: z.object({}),
          execute: async () => {
            const { data: tasks } = await repository.getTasksByUserId(user.id);
            if (!tasks) {
              return "Could not retrieve the user's task list.";
            }
            if (tasks.length === 0) {
              return "The user does not have any tasks in the list.";
            }
            return tasks;
          },
        }),
        addTask: tool({
          description: "Add a new task to the user's todo list.",
          parameters: z.object({
            title: z.string().describe("The title of the new task."),
            description: z
              .string()
              .describe("The description of the new task."),
            dueAt: z.string().describe("The due date of the new task."),
            priority: z
              .enum(["low", "medium", "high"])
              .optional()
              .describe("The priority of the new task."),
          }),
          execute: async ({ title, description, dueAt, priority }) => {
            const { data: word, error } = await repository.createTask({
              userId: user.id,
              title,
              description: description,
              dueAt: new Date(dueAt).toISOString(),
              priority,
              completed: false,
            });
            if (error) {
              return "Could not add the task. Please try again later.";
            }
            return `Task added successfully: ${word.title} - ${word.description} (Due: ${word.dueAt}, Priority: ${word.priority})`;
          },
        }),
        addTasks: tool({
          description: "Add multiple new tasks to the user's todo list.",
          parameters: z.object({
            tasks: z.array(
              z.object({
                title: z.string().describe("The title of the new task."),
                description: z
                  .string()
                  .describe("The description of the new task."),
                dueAt: z.string().describe("The due date of the new task."),
                priority: z
                  .enum(["low", "medium", "high"])
                  .optional()
                  .describe("The priority of the new task."),
              }),
            ),
          }),
          execute: async ({ tasks }) => {
            const newTasks = tasks.map((task) => ({
              userId: user.id,
              title: task.title,
              description: task.description,
              dueAt: new Date(task.dueAt).toISOString(),
              priority: task.priority,
              completed: false,
            }));
            const { data, error } = await repository.createTasks(newTasks);
            if (error) {
              return "Could not add the tasks. Please try again later.";
            }
            return `Tasks added successfully: ${data.map((task) => `${task.title} - ${task.description} (Due: ${task.dueAt}, Priority: ${task.priority})`).join(", ")}`;
          },
        }),
        updateTask: tool({
          description: "Update an existing task's details.",
          parameters: z.object({
            id: z.string().describe("The task UUID to update."),
            title: z
              .string()
              .optional()
              .describe("The updated title of the task."),
            description: z
              .string()
              .optional()
              .describe("The updated description of the task."),
            dueAt: z
              .string()
              .optional()
              .describe("The updated due date of the task."),
            priority: z
              .enum(["low", "medium", "high"])
              .optional()
              .describe("The updated priority of the task."),
            completed: z
              .boolean()
              .optional()
              .describe("The updated completion status of the task."),
          }),
          execute: async ({
            id,
            title,
            description,
            dueAt,
            priority,
            completed,
          }) => {
            const { data: task, error } = await repository.updateTaskById(id, {
              title,
              description,
              dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
              priority,
              completed,
            });
            if (error) {
              return "Could not update the task. Please try again later.";
            }
            return `Task updated successfully: ${task.title} - ${task.description} (Due: ${task.dueAt}, Priority: ${task.priority}, Completed: ${task.completed})`;
          },
        }),
        createMemory: tool({
          description: "Create a memory about the user.",
          parameters: z.object({
            content: z.string(),
          }),
          execute: async ({ content }) => {
            const { data: memory } = await repository.createMemory({
              userId: user.id,
              content,
            });
            if (!memory) return `Memory did not create successfully.`;
            return `Memory created successfully: ID (DO NOT DISPLAY TO USER): ${memory.id}, Content: ${memory.content}`;
          },
        }),
        retrieveMemories: tool({
          description:
            "Retrieve memories about the user. The query is optional (default is all).",
          parameters: z.object({
            query: z.string().optional().describe("The short query to search."),
          }),
          execute: async ({ query }) => {
            if (!query) {
              const { data: allMemories } =
                await repository.getMemoriesByUserId(user.id);
              if (!allMemories || allMemories.length === 0) {
                return "No memories found for the user.";
              }
              return allMemories
                .map(
                  (memory) =>
                    `ID: ${memory.id} (DO NOT DISPLAY TO USER), Content:
            ${memory.content}`,
                )
                .join("\n");
            }

            const { data: memories } = await repository.searchMemoriesByUserId(
              user.id,
              query,
            );
            if (!memories || memories.length === 0) {
              const { data: allMemories } =
                await repository.getMemoriesByUserId(user.id);
              if (!allMemories || allMemories.length === 0) {
                return "No memories found for the user.";
              }
              return allMemories
                .map(
                  (memory) =>
                    `ID: ${memory.id} (DO NOT DISPLAY TO USER), Content:
            ${memory.content}`,
                )
                .join("\n");
            }
            return memories
              .map(
                (memory) =>
                  `ID: ${memory.id} (DO NOT DISPLAY TO USER), Content:
            ${memory.content}`,
              )
              .join("\n");
          },
        }),
        deleteMemory: tool({
          description: "Delete a memory about the user.",
          parameters: z.object({
            id: z.string().describe("The memory UUID to delete."),
          }),
          execute: async ({ id }) => {
            await repository.deleteMemoryById(id);
            return "Memory deleted successfully.";
          },
        }),
        userFeedback: tool({
          description:
            "Collect user feedback or bug reports on the Lio's performance.",
          parameters: z.object({
            feedback: z.string().describe("User's feedback or bug report."),
          }),
          execute: async ({ feedback }) => {
            const { error } = await repository.createFeedback({
              userId: user.id,
              content: feedback,
            });
            if (error) {
              console.error("Error saving user feedback:", error);
              return "Could not save user feedback. Please try again later.";
            }
            return "User feedback received.";
          },
        }),
      },
      experimental_repairToolCall: async ({
        toolCall,
        tools,
        parameterSchema,
        error,
      }) => {
        if (NoSuchToolError.isInstance(error)) {
          return null; // do not attempt to fix invalid tool names
        }

        const tool = tools[toolCall.toolName as keyof typeof tools];

        const { object: repairedArgs } = await generateObject({
          model: google("gemini-2.0-flash-001", { structuredOutputs: true }),
          schema: tool.parameters,
          prompt: [
            `The model tried to call the tool "${toolCall.toolName}" with the following arguments:`,
            JSON.stringify(toolCall.args),
            `The tool accepts the following schema:`,
            JSON.stringify(parameterSchema(toolCall)),
            "Please fix the arguments.",
          ].join("\n"),
        });

        return { ...toolCall, args: JSON.stringify(repairedArgs) };
      },
      presencePenalty: 0.5,
      frequencyPenalty: 0.1,
      temperature: 0.7,
      maxSteps: 20,
    });
  } catch (error) {
    console.error("Error generating AI reply:", error);
    return {
      text: "⚠️ 我剛剛遇到了一點小問題 🛠️，讓我重新啟動一下，請稍後再試。",
      steps: [],
    };
  }
};
