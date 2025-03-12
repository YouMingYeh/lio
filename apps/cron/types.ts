import { Tables, TablesInsert, TablesUpdate } from "@/database.types.js";
import { CoreMessage } from "ai";

export type Message = KeysToCamelCase<Tables<"message">>;
export type MessageInsert = KeysToCamelCase<TablesInsert<"message">>;
export type MessageUpdate = KeysToCamelCase<TablesUpdate<"message">>;

export type User = KeysToCamelCase<Tables<"user">>;
export type UserInsert = KeysToCamelCase<TablesInsert<"user">>;
export type UserUpdate = KeysToCamelCase<TablesUpdate<"user">>;

export type Job = KeysToCamelCase<Tables<"job">>;
export type OneTimeJob = Job & { type: "one-time" };
export type CronJob = Job & { type: "cron" };
export type JobInsert = KeysToCamelCase<TablesInsert<"job">>;
export type JobUpdate = KeysToCamelCase<TablesUpdate<"job">>;

export type JobParameters = PushMessageJobParameters;

export type PushMessageJobParameters = {
  type: "push-message";
  payload: {
    message: string;
  };
};

export type Task = KeysToCamelCase<Tables<"task">>;
export type TaskInsert = KeysToCamelCase<TablesInsert<"task">>;
export type TaskUpdate = KeysToCamelCase<TablesUpdate<"task">>;

export type Memory = KeysToCamelCase<Tables<"memory">>;
export type MemoryInsert = KeysToCamelCase<TablesInsert<"memory">>;
export type MemoryUpdate = KeysToCamelCase<TablesUpdate<"memory">>;

export type Feedback = KeysToCamelCase<Tables<"feedback">>;
export type FeedbackInsert = KeysToCamelCase<TablesInsert<"feedback">>;
export type FeedbackUpdate = KeysToCamelCase<TablesUpdate<"feedback">>;

export type CoreMessageContent = CoreMessage["content"];

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
