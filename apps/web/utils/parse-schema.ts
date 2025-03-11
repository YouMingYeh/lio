import type { Field } from "../types/task-editor";
import { z } from "zod";

export function parseSchema(
  schema: z.ZodObject<any, any>,
  metadata: Record<string, Field> = {},
) {
  return Object.entries(schema.shape).map(([key, value]) => {
    const Field = metadata[key] || ({} as Field);
    let type = Field.type;

    if (!type) {
      if (value instanceof z.ZodString) type = "text";
      else if (value instanceof z.ZodNumber) type = "number";
      else if (value instanceof z.ZodEnum) type = "select";
      else if (value instanceof z.ZodArray) type = "multi-select";
    }

    return {
      key,
      type,
      zodType: value,
      ...Object.fromEntries(
        Object.entries(Field).filter(([key]) => key !== "type"),
      ),
    };
  });
}
