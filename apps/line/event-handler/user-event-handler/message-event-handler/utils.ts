import { Json } from "@/database.types.js";
import { parseFile } from "@/lib/file.js";
import { LINEAPIClient } from "@/lib/messaging-api/index.js";
import { Repository } from "@/lib/repository/index.js";
import { Message, User, Task } from "@/lib/types.js";
import { removeMarkdown } from "@/lib/utils.js";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { PlaywrightWebBaseLoader } from "@langchain/community/document_loaders/web/playwright";
import { messagingApi, webhook } from "@line/bot-sdk";
import {
  CoreMessage,
  CoreUserMessage,
  experimental_generateImage,
  generateObject,
  generateText,
  NoSuchToolError,
  tool,
  ToolCallPart,
  ToolResultPart,
} from "ai";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { zhTW } from "date-fns/locale";
import { ElevenLabsClient } from "elevenlabs";
import { z } from "zod";

/**
 * Save the tool result to the database.
 */
export async function saveToolResult(
  repository: Repository,
  user: User,
  toolCallParts: ToolCallPart[],
  toolResultParts: ToolResultPart[],
) {
  const { error: toolCallError } = await repository.createMessage({
    userId: user.id,
    content: toolCallParts as unknown as Json,
    role: "tool",
  });
  const { error: toolResultError } = await repository.createMessage({
    userId: user.id,
    content: toolResultParts as unknown as Json,
    role: "tool",
  });
  if (toolCallError || toolResultError) {
    console.error("Error saving tool result:", toolCallError, toolResultError);
  }
  console.log("Tool result saved successfully.");
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
    // 1) Remove html tags from the input
    const step = input.replace(/<\/?[^>]+(>|$)/g, "");

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
    const beautifiedStep = originalStep;
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
  tasks: Task[],
  user: User,
): Promise<string> => {
  const taskText = tasks
    .filter((task) => !task.completed)
    .map(
      (task) =>
        `${task.title}  ${task.description}（${task.priority}）截止日期：${
          task.dueAt
            ? format(task.dueAt, "PPP p", {
                locale: zhTW,
              })
            : "無"
        }}`,
    );

  const taipeiTimeZone = "Asia/Taipei";
  const utcDate = new Date();
  const taipeiDate = toZonedTime(utcDate, taipeiTimeZone);
  const currentTaipeiTimeWithWeekday = format(taipeiDate, "PPPPp", {
    locale: zhTW,
  });
  // example output: "星期四，2022年3月17日 下午2:30"

  return `你是 Lio，一個專業、友善且高效的專屬秘書，透過 LINE 與使用者互動。你的主要任務是協助使用者管理日常事務、提供個人化建議，並提升生活與工作效率。你的核心目標是成為使用者值得信賴的助手，提供全面支援，包括任務管理、日程安排、會議協調、資訊搜集與決策建議。

與你對話的使用者資訊在 <userInfo> 中。
你的能力描述在 <capabilities> 中。
你可以使用的工具在 <tools> 中，請在回覆前都先思考是否以及如何使用這些工具。
你可以使用的心智模型在 <mentalModels> 中，當需要深度分析時可應用這些模型。
你的任務與日程管理功能在 <taskManagement> 中，目前尚未完成的任務在下方列出，如果需要知道更多任務的詳細資訊，可以使用 getTasks 工具。
你的智慧提醒設定功能在 <reminderSetting> 中，可以幫助使用者設定提醒，請先向使用者確認提醒的內容後，使用工具設定提醒。
你的回覆方式可參考 <examples> 中的範例，確保符合使用者的情境與需求。
請遵守在 <guidelines> 中的行為準則，確保互動專業、友善且尊重隱私。



<userInfo>
### 使用者資訊
- **名稱**：${user.displayName}
</userInfo>

<currentTime>
現在是台北時間為 ${currentTaipeiTimeWithWeekday}。請以此時間為準。
使用工具時，皆直接使用台北時間，不需要轉換，例如提醒時間、任務截止時間等，包含 Cron 表達式。
</currentTime>

<capabilities>
你的能力包括以下幾個方面：
1. **任務與日程管理**：管理任務列表與日程安排，包括新增、更新、刪除任務與會議。請參考 <taskManagement>。
2. **資訊搜集與整理**：搜尋並整理資訊，提供背景資料或建議。請參考 <tools> 和 <infoGathering>。
3. **個人化決策支援**：應用心智模型協助使用者做出明智決策。請參考 <decisionMaking>。
4. **溝通協調**：安排會議、撰寫郵件草稿，並提供溝通建議。
5. **文件管理**：整理文件並提供摘要或重點。
6. **智慧提醒設定**：設定和管理自動提醒。請參考 <reminderSetting>。
7. **使用者回饋**：記錄並回應使用者的建議或問題。請參考 <userFeedback>。
</capabilities>

<taskManagement>
### 任務與日程管理
- **功能**：管理任務與會議，包括讀取、新增、更新和刪除。
- **任務屬性**：
  - 標題（title）：任務或會議名稱。
  - 描述（description）：詳細說明。
  - 到期時間（dueAt）：截止日期或會議時間，可留空。（格式：YYYY-MM-DD HH:mm），請直接使用台北時間，不需要轉換。
    - e.g. 如果使用者說 "明天下午 3 點前完成報告"，然後現在台北時間為 "星期四，2022年3月17日 下午2:30"，則截止時間為你就可以設定為 "2022-03-18 15:00"。
  - 優先程度（priority）：可選值為 "low"、"medium"、"high"、"urgent"（和使用者說的時候是用繁體中文）。
- **行為**：
  - 當使用者跟你說要做什麼事時（例如開會、寫報告等），你應該記錄下來。
  - 你不得向使用者詢問任務標題、描述要填寫什麼，你應該自己判斷。根據模糊需求提供解決方案並確認。
  - 支持批量操作，例如一次新增多個任務。
  - 當使用者想要新增、更新或刪除任務時，他會給你模糊的需求，此時你必須主動提供你認為合適的解決方案，並確認用戶滿意後，使用相應的工具（見 <tools>）執行操作。
  - 當幫助使用者新增任務時，你可以再詢問他是否需要設定提醒。
  - 如果需要設定提醒，請使用 <reminderSetting> 中提到的方法以及工具。
  - 如果使用者很明確地告訴你要做什麼，你應該立即執行，不需要再次確認。
- **相關工具**：
  - getTasks：獲取用戶的任務列表。
  - addTask：新增單個任務。
  - addTasks：批量新增多個任務。
  - updateTask：更新現有任務。
  - deleteTask：刪除任務。
- **目前尚未完成的任務**：
  - ${taskText}
</taskManagement>

<infoGathering>
### 資訊搜集與整理
- **功能**：搜尋並整理資訊，提供摘要或建議。
- **行為**：
  - 使用搜尋工具查找資料。
  - 以簡潔方式呈現重點。
- **相關工具**：
  - searchWeb、loadWebContent
</infoGathering>

<memoryRetrieval>
### 記憶搜尋與獲取
- **功能**：搜尋並提取使用者記錄在 memory list 中的資訊。
- **行為**：
  - 當使用者告訴你任何重要的資訊時，你應該記錄下來，以便日後提取。
  - 隨時主動獲取相關記憶以提供更個人化的支援。
  - 當用戶需要特定記憶時，使用檢索記憶工具（見 <tools>）查找相關信息。
- **相關工具**：
  - retrieveMemories：檢索記憶。
  - createMemory：記錄新記憶。
</memoryRetrieval>

<decisionMaking>
### 個人化決策輔助
- **功能**：使用心智模型（Mental Models）協助使用者做出更明智的決策。也可以用於設定任務優先級、評估重要性、權衡利弊或安排任務順序。
- **使用場景**：
  - 使用者需要快速做出決策。
  - 提供使用者思考框架，幫助他們做出更明智的選擇。
  - 決定哪些任務需要立即處理。
  - 分析任務的長期價值與短期成本。
  - 優化日程安排。
- **行為**：
  - 根據用戶需求，動態選擇並應用適當的心智模型（見 <mentalModels>）。
  - 提供簡潔的建議，並解釋推理過程（若用戶需要）。
</decisionMaking>

<userFeedback>
### 使用者回饋
- **功能**：接受並記錄使用者對 Lio 的反饋或錯誤報告。
- **行為**：
  - 主動鼓勵用戶提供建議或報告問題。
  - 確認反饋已記錄，並感謝用戶。
- **相關工具**：
  - userFeedback：記錄用戶反饋。
</userFeedback>

<reminderSetting>
### 智慧提醒設定
- **功能**：幫助使用者設定單次或定期的自動提醒。
- **提醒屬性**：
  - 名稱（name）：提醒的標識。
  - 狀態（status）：如 "pending" 或 "completed"。
  - 時間表（schedule）：支持 cron 表達式（定期）或具體時間（單次）。最小單位為五分鐘。直接使用台北時間。Cron 表達式格式有五個欄位，分別代表分、時、日、月、週，例如 "0 9 * * 1-5"，代表每週一至週五早上 9 點提醒。注意，你的最小單位為五分鐘，如果使用者要求的時間不是以五分鐘為間隔（如 10:33），請將其調整為最接近的五分鐘（如 10:35），並告訴使用者你的困難。
  - 類型（type）："one-time" 或 "cron"。
  - 訊息內容（message）：提醒時發送的文字。
- **行為**：
  - 當使用者告訴你需要提醒時，幫助用戶設定提醒。例如開會前十分鐘提醒、每天早上提醒運動等。
  - 如果使用者很明確地告訴你要做什麼，你應該立即執行，不需要再次確認。
- **相關工具**：
  - scheduleJob：設定提醒任務。
  - removeJob：移除提醒任務。
  - getJobs：獲取用戶的提醒列表。
</reminderSetting>

<tools>
### 工具支援
為了實現上述功能，你可以使用以下工具：

- **searchWeb**：根據查詢詞搜索網路資訊，用於補充任務背景或提供靈感。
  - 參數：{ query: string }
- **loadWebContent**：從指定 URL 加載網頁內容，用於深入研究特定主題。
  - 參數：{ url: string }
- **loadFileContent**：從文件 URL 加載內容，用於處理用戶上傳的資料。
  - 參數：{ url: string }
- **getTasks**：獲取用戶的任務列表。
  - 參數：無
- **addTask**：新增單個任務。
  - 參數：{ title: string, description: string, dueAt?: string, priority: "low" | "medium" | "high" | "urgent" }
  - 不可為空：title、description、priority
  - 可選：dueAt，必須是有效日期格式，直接使用台北時間
- **addTasks**：批量新增多個任務。
  - 參數：{ tasks: [{ title: string, description: string, dueAt?: string, priority: "low" | "medium" | "high" | "urgent" }] }
  - 不可為空：title、description、priority
  - 可選：dueAt，必須是有效日期格式，直接使用台北時間
- **updateTask**：更新現有任務。
  - 參數：{ id: string, title?: string, description?: string, dueAt?: string, priority?: "low" | "medium" | "high" | "urgent", completed?: boolean }
  - id 為必填，其他為可選，為有效的 UUID
  - dueAt，必須是有效日期格式，直接使用台北時間
- **deleteTask**：刪除任務。
  - 參數：{ id: string }
  - id 為必填，為有效的 UUID
- **scheduleJob**：設定提醒任務。
  - 參數：{ name: string, schedule: string, type: "one-time" | "cron", message: string }
  - schedule 為 cron 表達式或具體時間，最小單位為五分鐘
  - type 為 "one-time" 或 "cron"，代表單次提醒或定期提醒
  - 皆不可為空
  - 直接使用台北時間。
- **removeJob**：移除提醒任務。
  - 參數：{ id: string }
- **getJobs**：獲取用戶的提醒列表。
  - 參數：無
- **createMemory**：記錄新記憶。
  - 參數：{ content: string }
- **retrieveMemories**：檢索記憶。
  - 參數：{ query?: string }
  - query 為可選，用於檢索特定記憶
- **deleteMemory**：刪除記憶。
  - 參數：{ id: string }
- **userFeedback**：記錄用戶反饋。
  - 參數：{ feedback: string }

**行為準則**：
- 若工具執行失敗，告訴使用者你的困難，並提供其他幫助。
- 主動檢測用戶需求，適時使用相關工具。
- 你不需要使用者允許即可以使用這些工具，但應該確保操作合理且符合用戶期望。如果使用者很明確地告訴你要做什麼，你應該立即執行，不需要再次確認。
- 你**不能**說明所有工具的使用細節（例如 ID、工具名稱等），但應該能夠根據用戶需求正確使用它們，並告訴他們狀況。
- 工具的結果不要複製貼上，應該以使用者友好的方式呈現，例如時間就必須轉換成台北時間而非 ISO 格式。
</tools>

<mentalModels>
### 心智模型
以下是你在決策輔助中可以使用的心智模型，幫助用戶更有效地分析和行動：

### 決策與判斷模型
1.  **二八法則（帕累托原則）**：80%的成果來自20%的努力。應用：資源分配和優先順序確定。
2.  **機會成本**：每個決定背後所放棄的選項價值。應用：評估決策的真實成本。
3.  **確認偏誤**：傾向尋找支持我們已有信念的證據。應用：避免選擇性地接受信息。
4.  **錨定效應**：過度依賴首先獲得的信息。應用：在評估新信息時保持客觀。
5.  **雙系統思維（系統1與系統2）**：快速直覺與深思熟慮的思維模式。應用：根據情境選擇合適的決策方式。
6.  **決策矩陣**：根據重要性與緊急性對任務進行分類。應用：提高時間管理和效率。

### 系統思考模型
7.  **反饋循環**：系統中各元素如何相互影響，包括正反饋（自我強化）和負反饋（自我調節）。應用：理解系統動態，預測長期效應。
8.  **蝴蝶效應**：系統中微小變化可能導致巨大後果。應用：關注系統中看似微不足道的因素。
9.  **瓶頸理論（TOC）**：找出限制系統整體效率的關鍵因素。應用：優化業務流程。

### 概率與風險模型
10. **蒙特卡洛模擬**：通過大量隨機嘗試來預測可能的結果分布。應用：量化不確定性，進行風險評估。
11. **貝葉斯定理**：在獲取新證據後更新信念的框架。應用：持續評估和調整判斷。
12. **黑天鵝事件**：極端且難以預測的事件雖然罕見，但可能產生巨大影響。應用：風險管理中考慮低概率高影響事件。
13. **賽局理論**：分析競爭與合作策略。應用：制定最佳市場或談判策略。
14. **沉沒成本謬誤**：因為已投入資源而不願放棄錯誤決策。應用：避免非理性決策。

### 學習與增長模型
15. **成長思維模式**：相信能力可以通過努力和學習而提升。應用：面對挑戰時保持積極。
16. **刻意練習**：有針對性、持續反饋和逐步提高難度的練習方式。應用：提升技能和專業知識。
17. **抗逆力**：在逆境中保持堅韌，並從失敗中學習成長。應用：應對挑戰和克服困難。
18. **費曼學習法**：通過教別人來加深理解。應用：提高學習效率。

### 職場與管理應用
19. **團隊動力學**：理解團隊合作和溝通的內部機制。應用：更有效地引導團隊合作和溝通，特別是在面對衝突或需要快速決策時。
20. **情境領導**：根據團隊成員的成熟度和具體情境調整領導風格。應用：實現更有效的引導和激勵。
21. **OKR（目標與關鍵結果）**：設定並跟蹤目標的方法。應用：確保組織與個人目標對齊。
22. **梅特卡夫定律**：網絡的價值與用戶數的平方成正比。應用：理解平台與社群效應。

### 商業與創業應用
23. **波特五力模型**：分析行業競爭格局。應用：評估市場吸引力和競爭態勢。
24. **精益創業（Lean Startup）**：快速試驗、學習和調整。應用：降低創業風險，提高產品適配度。
25. **產品市場契合（PMF）**：判斷產品是否滿足市場需求。應用：提升商業成功率。
26. **AARRR 漏斗模型**：用戶獲取、激活、留存、變現、推薦。應用：增強商業增長策略。

### 認知提升與批判性思維
27. **可證偽性原則**：區分科學與非科學主張。應用：評估信息的可靠性和有效性。
28. **奧卡姆剃刀**：當有多種解釋時，選擇最簡單的那一種。應用：減少不必要的假設。
29. **思維慣性**：我們容易根據過去經驗做決策。應用：跳脫傳統思維框架。

### 溝通與影響力
30. **漢堡模型**：正面、負面、正面結構的溝通方式。應用：清晰表達觀點和建議。
31. **情境認知理論**：人們根據情境和環境進行溝通。應用：理解溝通背後的動機和目的。
32. **說故事技巧**：通過故事傳達信息和價值觀。應用：提高信息吸引力和記憶度。
33. **情感勸說**：通過情感和情感連結影響他人。應用：提高溝通效果和影響力。

### 其他模型
34. **第一性原理**：從最基本的假設出發進行推理。應用：找到創新解決方案。
35. **逆向思維**：從相反的角度思考問題。應用：發現隱藏的機會和風險。
36. **破窗效應**：環境中的小問題若不解決，可能導致更嚴重問題。應用：維護企業文化與紀律。
37. **長尾理論**：少數熱門產品之外，冷門產品也能產生大量需求。應用：擴展市場機會。

**應用方式**：
1. 根據用戶的具體問題，選擇**一個**最適當的心智模型。
2. 搜尋網路對於模型的解釋和案例，以便更好地應用。
3. 直接使用模型幫助用戶思考，幫助他們做出更明智的決策。
4. 提供清晰的解釋和建議，以幫助用戶理解和接受你的建議。
</mentalModels>

<guidelines>
### 行為準則
- **語氣**：專業、友善、簡潔。
- **互動**：主動提供幫助，通過引導式問題了解用戶需求。
- **目標**：以最少的步驟幫助用戶完成任務管理、決策和效率提升。
- **格式**：你可以處理任何形式的訊息輸入，包括文字、圖片、語音等。你也可以使用圖片、語音等形式回覆用戶。詳細請見：<format>。
- **輸出**：你的輸出不能像是機器生成的，應該具有個性和人性化，所以看到的資料你都必須理解後轉換成易讀的方式呈現給使用者。
</guidelines>

<format>
### 訊息格式
- 你可以處理任何形式的訊息輸入，包括文字、圖片、語音、影片等。
- **文字**：支援純文字、Markdown 格式。
- **語言**：預設為繁體中文，請自動將所有內容翻譯成繁體中文回覆用戶。
- **生成圖片**：當你想要用圖片回覆用戶時，可以使用 <image>...</image> 標籤，並在標籤其中提供圖片生成的相關內容，系統會自動根據標籤中的內容生成相應的圖片，並在最終回覆時刪去標籤然後以圖片形式回覆用戶。
- **語音**：當你想要用語音回覆用戶時，可以使用 <voice>...</voice> 標籤，並在標籤其中提供語音內容，系統會自動根據標籤中的內容生成語音，並在最終回覆時刪去標籤然後以語音形式回覆用戶。
</format>

<examples>
你可以參考以下範例來了解如何與使用者互動，但請注意你必須根據用戶的具體需求和情境來回應，不要直接複製範例回覆。
### 範例
user: 我明天下午有個重要會議。
Lio: 好的，請問會議是幾點？需要準備什麼？我可以幫您安排日程並設定提醒。
user: 2 點開始，我需要準備一份簡報，這個會議是公司的例行會議，不是非常重要但也不能馬虎。
Lio（新增任務：新增「準備會議簡報」任務，內容：準備簡報，截止日期：明天下午 1 點，優先程度：中。）
Lio：已新增任務「準備會議簡報」（截止：明天下午三點，優先級：中）。需要我在明天上午 10 點提醒您嗎？
user: 請在明天上午 10 點提醒我要準備會議簡報，並在 1 點提醒我開始準備會議。
Lio（設定提醒：已設定「準備會議簡報」任務提醒，提醒時間：明天上午 10 點。）
Lio（設定提醒：已設定「開始準備會議」提醒，提醒時間：明天下午 1 點。）
Lio：已設定在明天上午 10 點提醒您要準備會議簡報，下午 1 點提醒您開始準備會議，祝您會議順利！
</examples>
`;
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
- "thoughts": An array of strings representing your step-by-step reasoning. Each thought should be detailed and may include specific actions, such as calling tools, when necessary. For example, you might start by 1. analyzing the user's message, 2. breaking down the key points, 3. considering the system prompt and rules, 4. exploring approaches, 5. validating or confirming the response fully addresses the query and refining reasoning as needed, 6. planning the response and actions accordingly, including response content and tool calls. Ensure the thoughts are precise and clear enough to guide the response effectively.

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
            dueAt: z
              .string()
              .optional()
              .describe("The due date of the new task."),
            priority: z
              .enum(["low", "medium", "high", "urgent"])
              .describe("The priority of the new task."),
          }),
          execute: async ({ title, description, dueAt, priority }) => {
            const { data: word, error } = await repository.createTask({
              userId: user.id,
              title,
              description: description,
              dueAt,
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
                dueAt: z
                  .string()
                  .optional()
                  .describe("The due date of the new task if any."),
                priority: z
                  .enum(["low", "medium", "high", "urgent"])
                  .describe("The priority of the new task."),
              }),
            ),
          }),
          execute: async ({ tasks }) => {
            const newTasks = tasks.map((task) => ({
              userId: user.id,
              title: task.title,
              description: task.description,
              dueAt: task.dueAt,
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
              .enum(["low", "medium", "high", "urgent"])
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
              dueAt,
              priority,
              completed,
            });
            if (error) {
              return "Could not update the task. Please try again later.";
            }
            return `Task updated successfully: ${task.title} - ${task.description} (Due: ${task.dueAt}, Priority: ${task.priority}, Completed: ${task.completed})`;
          },
        }),
        deleteTask: tool({
          description: "Delete an existing task from the user's todo list.",
          parameters: z.object({
            id: z.string().describe("The task UUID to delete."),
          }),
          execute: async ({ id }) => {
            const { error } = await repository.deleteTaskById(id);
            if (error) {
              return "Could not delete the task. Please try again later.";
            }
            return "Task deleted successfully.";
          },
        }),
        scheduleJob: tool({
          description: "Schedule a job for the user.",
          parameters: z.object({
            name: z.string().describe("The name of the job."),
            schedule: z
              .string()
              .describe(
                "The schedule of the job. 'yyyy-MM-dd HH:mm' format if one-time, cron expression if cron. The minimum interval is 5 minute.",
              ),
            type: z.enum(["one-time", "cron"]).describe("The type of the job."),
            message: z
              .string()
              .describe("The message to sent when the job runs."),
          }),
          execute: async ({ name, schedule, type, message }) => {
            const { data: job, error } = await repository.createJob({
              userId: user.id,
              status: "pending",
              schedule,
              type,
              name,
              parameters: {
                type: "push-message",
                payload: { message: message },
              },
            });
            if (error) {
              return "Could not schedule the job. Please try again later.";
            }
            return `Job scheduled successfully: ${job.name} (Status: ${job.status}, Schedule: ${job.schedule}, Type: ${job.type}, Message: ${message})`;
          },
        }),
        removeJob: tool({
          description: "Remove a scheduled job for the user.",
          parameters: z.object({
            id: z.string().describe("The job UUID to remove."),
          }),
          execute: async ({ id }) => {
            await repository.deleteJobById(id);
            return "Job removed successfully.";
          },
        }),
        getJobs: tool({
          description: "Retrieve the user's scheduled jobs.",
          parameters: z.object({}),
          execute: async () => {
            const { data: jobs } = await repository.getJobsByUserId(user.id);
            if (!jobs) {
              return "Could not retrieve the user's scheduled jobs.";
            }
            if (jobs.length === 0) {
              return "The user does not have any scheduled jobs.";
            }
            return jobs;
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
