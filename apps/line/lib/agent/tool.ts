/****************************************************
 * TOOL DEFINITIONS (tool.ts)
 ****************************************************/
import { ToolSet, Tool } from "ai";
import { z } from "zod";

/**
 * Interface defining the agent context.
 * You can store any data here that your tools might need:
 *   - user/session data
 *   - environment settings
 *   - permissions
 *   - etc.
 */
export interface AgentContext {
  userId?: string;
  teamId?: string;
  contactId?: string;
  groupId?: string;
  // Add more fields as needed
}

/**
 * A single tool definition that can utilize the `AgentContext`.
 * `execute` has a second parameter for context, so each tool
 * can tailor its behavior based on user/team/etc.
 */
export interface IToolDef {
  description: string;
  parameters: z.ZodType;
  /**
   * Executes the tool's logic.
   * @param args - Arguments validated by `parameters`.
   * @param context - The current agent context.
   * @returns A promise that resolves to any output.
   */
  execute: (args: unknown, context: AgentContext) => Promise<unknown>;
}

/**
 * Collection of named tools. The key is the tool name,
 * and the value is its definition (IToolDef).
 */
export type ITools = Record<string, IToolDef>;

/**
 * Helper function that transforms your dynamic tools into
 * the AI library's required `ToolSet`.
 *
 * Each tool's `execute(args, context)` is wrapped in a closure
 * so that the AI library's standard `(args: unknown)` signature
 * can be fulfilled. The agent context is still accessible.
 */
export function createToolSetWithContext(
  dynamicTools: ITools,
  context: AgentContext,
): ToolSet {
  const entries = Object.entries(dynamicTools).map(([toolName, toolDef]) => {
    const { description, parameters, execute } = toolDef;
    return [
      toolName,
      {
        description,
        parameters,
        // Wrap the original `execute(args, context)` so the AI sees `(args) => Promise<any>`.
        execute: async (args: unknown) => {
          return execute(args, context);
        },
      } satisfies Tool,
    ];
  });

  return Object.fromEntries(entries) as ToolSet;
}
