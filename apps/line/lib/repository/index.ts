import { createSupabaseClient } from "@/client/supabase.js";
import { Database, TablesInsert, TablesUpdate } from "@/database.types.js";
import {
  camelToSnakeCase,
  FeedbackInsert,
  MemoryInsert,
  MemoryUpdate,
  MessageInsert,
  snakeToCamelCase,
  TaskInsert,
  TaskUpdate,
  UserInsert,
  UserUpdate,
} from "@/lib/types.js";
import { SupabaseClient } from "@supabase/supabase-js";

const MAX_MESSAGE_LENGTH = 30;

class Repository {
  private supabase: SupabaseClient<Database>;
  constructor() {
    this.supabase = createSupabaseClient();
  }

  async getUserById(id: string) {
    const { data, error } = await this.supabase
      .from("user")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      return { data: null, error };
    }
    return { data: snakeToCamelCase(data), error: null };
  }

  async createUser(user: UserInsert) {
    const { data, error } = await this.supabase
      .from("user")
      .insert(camelToSnakeCase(user));
    if (error) {
      return { data: null, error };
    }
    return { data: snakeToCamelCase(data), error: null };
  }

  async updateUserById(id: string, user: UserUpdate) {
    const { data, error } = await this.supabase
      .from("user")
      .update(camelToSnakeCase(user))
      .eq("id", id)
      .select()
      .single();
    if (error) {
      return { data: null, error };
    }
    return { data: snakeToCamelCase(data), error: null };
  }

  async getUserByLineUserId(lineUserId: string) {
    const { data, error } = await this.supabase
      .from("user")
      .select("*")
      .eq("line_user_id", lineUserId)
      .single();
    if (error) {
      return { data: null, error };
    }
    return { data: snakeToCamelCase(data), error: null };
  }

  async getMessagesByUserId(userId: string) {
    const { data, error } = await this.supabase
      .from("message")
      .select("*")
      .order("created_at", { ascending: false }) // Newest message first
      .limit(MAX_MESSAGE_LENGTH)
      .eq("user_id", userId);
    if (error) {
      return { data: null, error };
    }
    // Reverse the order so the newest message is at the end
    const messages = data.reverse();
    return { data: snakeToCamelCase(messages), error: null };
  }

  async createMessage(message: MessageInsert) {
    const { data, error } = await this.supabase
      .from("message")
      .insert(camelToSnakeCase(message))
      .select()
      .single();
    if (error) {
      return { data: null, error };
    }
    return { data: snakeToCamelCase(data), error: null };
  }

  async getTasksByUserId(userId: string) {
    const { data, error } = await this.supabase
      .from("task")
      .select("*")
      .eq("user_id", userId);
    if (error) {
      return { data: null, error };
    }
    return { data: snakeToCamelCase(data), error: null };
  }

  async getTaskById(id: string) {
    const { data, error } = await this.supabase
      .from("task")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      return { data: null, error };
    }
    return { data: snakeToCamelCase(data), error: null };
  }

  async createTask(task: TaskInsert) {
    const { data, error } = await this.supabase
      .from("task")
      .insert(camelToSnakeCase(task))
      .select()
      .single();
    if (error) {
      return { data: null, error };
    }
    return { data: snakeToCamelCase(data), error: null };
  }
  async createTasks(tasks: TaskInsert[]) {
    const { data, error } = await this.supabase
      .from("task")
      .insert(camelToSnakeCase(tasks))
      .select();
    if (error) {
      return { data: null, error };
    }
    return { data: snakeToCamelCase(data), error: null };
  }

  async updateTaskById(id: string, task: TaskUpdate) {
    const { data, error } = await this.supabase
      .from("task")
      .update(camelToSnakeCase(task))
      .eq("id", id)
      .select()
      .single();
    if (error) {
      return { data: null, error };
    }
    return { data: snakeToCamelCase(data), error: null };
  }

  async getMemoriesByUserId(userId: string) {
    const { data, error } = await this.supabase
      .from("memory")
      .select("*")
      .eq("user_id", userId);
    if (error) {
      return { data: null, error };
    }
    return { data: snakeToCamelCase(data), error: null };
  }

  async searchMemoriesByUserId(userId: string, query: string) {
    const { data, error } = await this.supabase
      .from("memory")
      .select("*")
      .textSearch("content", query)
      .eq("user_id", userId);
    if (error) {
      return { data: null, error };
    }
    return { data: camelToSnakeCase(data), error: null };
  }

  async createMemory(memory: MemoryInsert) {
    const { data, error } = await this.supabase
      .from("memory")
      .insert(camelToSnakeCase(memory))
      .select()
      .single();
    if (error) {
      return { data: null, error };
    }
    return { data: snakeToCamelCase(data), error: null };
  }

  async updateMemoryById(id: string, memory: MemoryUpdate) {
    const { data, error } = await this.supabase
      .from("memory")
      .update(memory)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      return { data: null, error };
    }
    return { data: snakeToCamelCase(data), error: null };
  }

  async deleteMemoryById(id: string) {
    const { data, error } = await this.supabase
      .from("memory")
      .delete()
      .eq("id", id)
      .select()
      .single();
    if (error) {
      return { data: null, error };
    }
    return { data, error: null };
  }

  async createFeedback(feedback: FeedbackInsert) {
    const { data, error } = await this.supabase
      .from("feedback")
      .insert(camelToSnakeCase(feedback))
      .select()
      .single();
    if (error) {
      return { data: null, error };
    }
    return { data: snakeToCamelCase(feedback), error: null };
  }

  /**
   * Upload a file to the our r2 server.
   * @param filename We use the message ID as the filename as convention.
   */
  async uploadFile(file: File, filename: string) {
    async function getUploadUrl(filename: string) {
      const response = await fetch("https://lio.adastra.tw/api/pre-signed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filename }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.url;
    }

    const uploadUrl = await getUploadUrl(filename);

    const response = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    const url = `https://r2.adastra.tw/${filename}`;
    return url;
  }

  async getDownloadUrl(filename: string) {
    const response = await fetch(
      `https://lio.adastra.tw/api/pre-signed?filename=${filename}`,
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.url;
  }
}

export { Repository };
