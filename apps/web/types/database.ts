import { Tables, TablesInsert, TablesUpdate } from "@/database.types";
import { KeysToCamelCase } from "@/lib/utils";
import { CoreMessage } from "ai";

export type Message = KeysToCamelCase<Tables<"message">>;
export type MessageInsert = KeysToCamelCase<TablesInsert<"message">>;
export type MessageUpdate = KeysToCamelCase<TablesUpdate<"message">>;

export type User = KeysToCamelCase<Tables<"user">>;
export type UserInsert = KeysToCamelCase<TablesInsert<"user">>;
export type UserUpdate = KeysToCamelCase<TablesUpdate<"user">>;

export type Job = KeysToCamelCase<Tables<"job">>;
export type JobInsert = KeysToCamelCase<TablesInsert<"job">>;
export type JobUpdate = KeysToCamelCase<TablesUpdate<"job">>;

export type Task = KeysToCamelCase<Tables<"task">>;
export type TaskInsert = KeysToCamelCase<TablesInsert<"task">>;
export type TaskUpdate = KeysToCamelCase<TablesUpdate<"task">>;

export type CoreMessageContent = CoreMessage["content"];
