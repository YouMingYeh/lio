import { google } from "@ai-sdk/google";
import { CoreMessage, generateText } from "ai";

const convertCoreMessagesToReadableString = (
  messages: CoreMessage[],
): string => {
  return messages
    .map((m) => {
      if (m.role === "user") {
        if (typeof m.content === "string") return `使用者：${m.content}`;
        return m.content
          .map((c) => {
            if (c.type === "text") {
              return `使用者：${c.text}`;
            }
            if (c.type === "image") {
              return `圖片：${c.image}`;
            }
          })
          .join("\n");
      } else if (m.role === "assistant") {
        if (typeof m.content === "string") return `助理：${m.content}`;
        return m.content
          .map((c) => {
            if (c.type === "text") {
              return `助理：${c.text}`;
            }
            if (c.type === "tool-call") {
              return `使用工具：${c.toolName}`;
            }
          })
          .join("\n");
      }
    })
    .join("\n");
};

const summarizeMessageHistory = async (
  messages: CoreMessage[],
): Promise<string> => {
  const result = await generateText({
    model: google("gemini-2.0-flash-001"),
    prompt: `您是一個對話紀錄總結工具，請將以下對話紀錄總結成一段文字，需包含所有重要內容、進度、狀態、等等，最好能夠越詳盡越好：
      ${convertCoreMessagesToReadableString(messages)}`,
  });
  console.log(result.text);
  return result.text;
};

export { summarizeMessageHistory, convertCoreMessagesToReadableString };
