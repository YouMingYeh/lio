/**
 * Replaces placeholders in a template.
 * For each key in `data`, all occurrences of {{key}} are replaced with data[key].
 * Any remaining placeholders are replaced with `emptyValue`.
 *
 * @example
 * const template = "Hello, {{ name }}! Your order {{ orderId }} is ready.";
 * const data = { name: "Alice", orderId: "12345" };
 * const output = fillTemplate(template, data, "N/A");
 * // output will be: "Hello, Alice! Your order 12345 is ready."
 *
 * @param template - The template string containing placeholders.
 * @param data - An object where keys correspond to placeholders.
 * @param emptyValue - The value used to replace missing placeholders. Defaults to "N/A".
 * @returns The template string with placeholders replaced by their corresponding values.
 */
export function fillTemplate<T extends Record<string, string>>(
  template: string,
  data: T,
  emptyValue = "N/A",
): string {
  let result = template;
  // Replace placeholders for each provided key.
  for (const key in data) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
    result = result.replace(regex, data[key] ?? emptyValue);
  }
  // Replace any leftover placeholders.
  return result.replace(/{{\s*[^}]+\s*}}/g, emptyValue);
}

/**
 * Remove leading and trailing whitespace, \n, \r, and \t characters from a string.
 *
 * @example
 * const text = "\n\t  Hello, World!   \r\n";
 * const output = trimStringRegex(text);
 * // output will be: "Hello, World!"
 *
 * @param str - The input string to be trimmed.
 * @returns A string with leading and trailing whitespace and control characters removed.
 */
export function trimStringRegex(str: string): string {
  return str.replace(/^\s+|\s+$/g, "");
}

/**
 * Removes common markdown syntax from text and adds emojis for layout
 * @param {string} markdownText - The markdown text to process
 * @return {string} Plain text with markdown syntax removed and emojis added
 */
export function removeMarkdown(markdownText: string) {
  if (!markdownText) return "";

  let text = markdownText;

  // Remove code blocks, keeping only the content inside
  text = text.replace(/```(?:[a-zA-Z0-9]*\n)?([\s\S]*?)```/g, "$1");

  // Remove inline code, keeping the content inside
  text = text.replace(/`([^`]+)`/g, "$1");

  // Remove headers and prepend with 📌 emoji
  text = text.replace(/^(#{1,6})\s+(.+)$/gm, "📌 $2");

  // Remove emphasis, only when used as markdown syntax
  text = text.replace(/\*\*(.*?)\*\*/g, "$1"); // Bold

  // Remove blockquotes and prepend with 💬 emoji
  text = text.replace(/^\s*>\s+(.+)$/gm, "💬 $1");

  // Convert bullet lists to plain text with 🔹 emoji
  text = text.replace(/^\s*[-*+]\s+(.+)$/gm, "🔹 $1");

  // Convert numbered lists to plain text with ℹ️ emoji
  text = text.replace(/^\s*\d+\.\s+(.+)$/gm, "ℹ️ $1");

  // Remove link syntax, keep text and URL with 🔗 emoji)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 🔗 ($2)");

  // Remove image syntax, keep alt text with 🖼️ emoji
  text = text.replace(/!\[([^\]]+)\]\([^)]+\)/g, "🖼️ $1");

  // Clean up extra whitespace
  text = text.replace(/\n{3,}/g, "\n\n");
  text = text.trim();

  return text;
}

export const wordTypes: [string, ...string[]] = [
  "noun",
  "pronoun",
  "verb",
  "adjective",
  "adverb",
  "preposition",
  "conjunction",
  "interjection",
  "article",
  "determiner",
  "modal-verb",
  "auxiliary-verb",
  "gerund",
  "participle",
  "infinitive",
  "contraction",
  "compound-word",
  "portmanteau",
  "noun-phrase",
  "verb-phrase",
  "adjective-phrase",
  "adverb-phrase",
  "prepositional-phrase",
  "gerund-phrase",
  "infinitive-phrase",
  "participial-phrase",
  "idiom",
  "phrasal-verb",
  "collocation",
  "proverb",
  "cliché",
  "simple-sentence",
  "compound-sentence",
  "complex-sentence",
  "compound-complex-sentence",
  "interrogative-sentence",
  "imperative-sentence",
  "exclamatory-sentence",
  "etymology",
  "loanword",
  "slang",
  "jargon",
  "acronym",
  "initialism",
  "abbreviation",
  "onomatopoeia",
  "palindrome",
  "homophone",
  "homonym",
  "synonym",
  "antonym",
  "false-friend",
];
