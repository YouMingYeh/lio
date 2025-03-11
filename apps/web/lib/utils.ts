import { CoreMessage } from "ai";
import { js_beautify } from "js-beautify";

/**
 * Converts the first character of a string to uppercase and the rest to lowercase.
 *
 * @param {string} str - The input string.
 * @returns {string} The transformed string.
 *
 * @example
 * ```ts
 * const result = sentenceCase("hELLO wORLD!");
 * // => "Hello world!"
 * ```
 */
export const sentenceCase = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Converts the first character of a string to lowercase and the rest to lowercase.
 *
 * @param {string} str - The input string.
 * @returns {string} The transformed string.
 *
 * @example
 * ```ts
 * const result = lowerCase("HeLLo WoRLd");
 * // => "hello world"
 * ```
 */
export const lowerCase = (str: string): string => {
  return str.charAt(0).toLowerCase() + str.slice(1).toLowerCase();
};

/**
 * Checks if a string is not empty (after trimming).
 *
 * @param {string | undefined} value - The string to check.
 * @returns {boolean} True if the string is non-empty, false otherwise.
 *
 * @example
 * ```ts
 * if (isNotEmpty(someString)) {
 *   // ...
 * }
 * ```
 */
export const isNotEmpty = (value: string | undefined): boolean =>
  value!.trim().length > 0;

/**
 * Formats JSX code by beautifying it with certain style preferences.
 *
 * @param {string} code - The JSX code to format.
 * @returns {string} The prettified code.
 *
 * @example
 * ```ts
 * const beautified = formatJSXCode("<div><span>Hello</span></div>");
 * // => The prettified version of the code
 * ```
 */
export function formatJSXCode(code: string): string {
  return js_beautify(code, {
    indent_size: 2,
    indent_char: " ",
    max_preserve_newlines: 2,
    preserve_newlines: true,
    keep_array_indentation: false,
    break_chained_methods: false,
    space_before_conditional: true,
    unescape_strings: false,
    jslint_happy: false,
    end_with_newline: false,
    wrap_line_length: 0,
    e4x: true,
    indent_empty_lines: false,
  });
}

// Converts a snake_case string to camelCase at type level.
export type CamelCase<S extends string> =
  S extends `${infer P1}_${infer P2}${infer P3}`
    ? `${Lowercase<P1>}${Uppercase<P2>}${CamelCase<P3>}`
    : Lowercase<S>;

// Recursively transforms all keys in an object (or array) from snake_case to camelCase.
export type KeysToCamelCase<T> = T extends any[]
  ? KeysToCamelCase<T[number]>[]
  : T extends object
    ? {
        [K in keyof T as K extends string ? CamelCase<K> : K]: KeysToCamelCase<
          T[K]
        >;
      }
    : T;

// Transforms a camelCase string to snake_case string at type level.
type CamelToSnakeCaseStr<
  S extends string,
  IsFirst extends boolean = true,
> = S extends `${infer Head}${infer Tail}`
  ? Head extends Uppercase<Head>
    ? IsFirst extends true
      ? `${Lowercase<Head>}${CamelToSnakeCaseStr<Tail, false>}`
      : `_${Lowercase<Head>}${CamelToSnakeCaseStr<Tail, false>}`
    : `${Head}${CamelToSnakeCaseStr<Tail, false>}`
  : S;

// Recursively transforms all keys in an object (or array) from camelCase to snake_case.
type CamelToSnakeCase<T> = T extends any[]
  ? CamelToSnakeCase<T[number]>[]
  : T extends object
    ? {
        [K in keyof T as K extends string
          ? CamelToSnakeCaseStr<K>
          : K]: CamelToSnakeCase<T[K]>;
      }
    : T;

/**
 * Converts an object's keys from camelCase to snake_case, recursively.
 *
 * @param obj - The object to transform.
 * @returns The transformed object with snake_case keys.
 *
 * @example
 * ```ts
 * const result = camelToSnakeCase({ someKey: 123, nestedKey: { moreDataHere: 456 } });
 * // => { some_key: 123, nested_key: { more_data_here: 456 } }
 * ```
 */
export function camelToSnakeCase<T>(obj: T): CamelToSnakeCase<T> {
  if (Array.isArray(obj)) {
    return obj.map((v) => camelToSnakeCase(v)) as CamelToSnakeCase<T>;
  } else if (obj !== null && typeof obj === "object") {
    return Object.entries(obj).reduce((result, [key, value]) => {
      // Replace uppercase letters with an underscore (if not at the beginning) plus the lowercase letter.
      const newKey = key.replace(/([A-Z])/g, (match, p1, offset) =>
        offset === 0 ? p1.toLowerCase() : "_" + p1.toLowerCase(),
      );
      (result as any)[newKey] = camelToSnakeCase(value);
      return result;
    }, {} as any) as CamelToSnakeCase<T>;
  }
  return obj as CamelToSnakeCase<T>;
}

// Transforms a snake_case string to camelCase string at type level.
type SnakeToCamelCaseStr<S extends string> =
  S extends `${infer Head}_${infer Tail}`
    ? `${Head}${Capitalize<SnakeToCamelCaseStr<Tail>>}`
    : S;

// Recursively transforms all keys in an object (or array) from snake_case to camelCase.
type SnakeToCamelCase<T> = T extends any[]
  ? SnakeToCamelCase<T[number]>[]
  : T extends object
    ? {
        [K in keyof T as K extends string
          ? SnakeToCamelCaseStr<K>
          : K]: SnakeToCamelCase<T[K]>;
      }
    : T;

/**
 * Converts an object's keys from snake_case to camelCase, recursively.
 *
 * @param obj - The object to transform.
 * @returns The transformed object with camelCase keys.
 *
 * @example
 * ```ts
 * const result = snakeToCamelCase({ some_key: 123, nested_key: { more_data_here: 456 } });
 * // => { someKey: 123, nestedKey: { moreDataHere: 456 } }
 * ```
 */
export function snakeToCamelCase<T>(obj: T): SnakeToCamelCase<T> {
  if (Array.isArray(obj)) {
    return obj.map((v) => snakeToCamelCase(v)) as SnakeToCamelCase<T>;
  } else if (
    obj !== null &&
    typeof obj === "object" &&
    obj.constructor === Object
  ) {
    return Object.entries(obj).reduce((result, [key, value]) => {
      const newKey = key.replace(/_([a-z])/g, (_, letter) =>
        letter.toUpperCase(),
      );
      (result as any)[newKey] = snakeToCamelCase(value);
      return result;
    }, {} as any) as SnakeToCamelCase<T>;
  }
  return obj as SnakeToCamelCase<T>;
}

/**
 * Converts a string to lowercase, removes any non-alphanumeric characters,
 * splits by spaces, and returns an array of words. Works for any language.
 *
 * @param {string} text - The input text to tokenize.
 * @returns {string[]} An array of words extracted from the string.
 *
 * @example
 * ```ts
 * const tokens = tokenize("Hello, WORLD! This is   fun.");
 * // => ["hello", "world", "this", "is", "fun"]
 * ```
 */
export function tokenize(text: string): string[] {
  return text
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .split(" ")
    .filter((word) => word.length > 0);
}

export type FileType = "text" | "image" | "audio" | "video" | "other";

/**
 * Determines a file type based on its extension (text, image, audio, video, or other).
 *
 * @param {string} fileName - The file name to parse.
 * @returns {FileType} The type of the file.
 *
 * @example
 * ```ts
 * const fileType = getFileType("picture.png");
 * // => "image"
 * ```
 */
export function getFileType(fileName: string): FileType {
  const extension = fileName.split(".").pop()?.toLowerCase();
  if (["txt", "pdf", "doc", "docx"].includes(extension || "")) return "text";
  if (["jpg", "jpeg", "png", "gif", "svg"].includes(extension || ""))
    return "image";
  if (["mp3", "wav", "ogg"].includes(extension || "")) return "audio";
  if (["mp4", "avi", "mov", "wmv"].includes(extension || "")) return "video";
  return "other";
}

/**
 * Maps a file type to a corresponding icon name (for displaying different icons).
 *
 * @param {FileType} fileType - The file type.
 * @returns {string} The icon name to display.
 *
 * @example
 * ```ts
 * const iconName = getFileIconName("image");
 * // => "FileImage"
 * ```
 */
export function getFileIconName(fileType: FileType): string {
  switch (fileType) {
    case "text":
      return "FileText";
    case "image":
      return "FileImage";
    case "audio":
      return "FileAudio";
    case "video":
      return "FileVideo";
    default:
      return "File";
  }
}

/**
 * Maps a file type to a corresponding color (for UI badges, tags, etc.).
 *
 * @param {FileType} fileType - The file type.
 * @returns {string} The color associated with the file type.
 *
 * @example
 * ```ts
 * const color = getFileColor("audio");
 * // => "green"
 * ```
 */
export function getFileColor(fileType: FileType): string {
  switch (fileType) {
    case "text":
      return "pink";
    case "image":
      return "blue";
    case "audio":
      return "green";
    case "video":
      return "purple";
    default:
      return "gray";
  }
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
 * Remove markdown formatting (specifically bold formatting) from a string.
 * This function targets markdown syntax for bold text using ** or __ and replaces it
 * with just the inner text.
 *
 * @example
 * const markdownText = "**Hello**, this is __world__!";
 * const output = removeMarkdown(markdownText);
 * // output will be: "Hello, this is world!"
 *
 * @param str - The input string containing markdown formatted text.
 * @returns A string with markdown bold formatting removed.
 */
export function removeMarkdown(str: string): string {
  return str.replace(/(\*\*|__)(.*?)\1/g, "$2");
}

export function renderTeaser(content: CoreMessage["content"]) {
  if (!content) {
    return "尚無訊息";
  }
  if (typeof content === "string") {
    return removeMarkdown(trimStringRegex(content));
  }
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (part.type === "text") {
          return removeMarkdown(trimStringRegex(part.text));
        }
        if (part.type === "image") {
          return "📷 圖片";
        }
        if (part.type === "file") {
          return "📄 檔案";
        }
      })
      .join(" ");
  }
  return "📄 未知的訊息類型";
}
