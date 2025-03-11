/****************************************************
 * AGENT IMPLEMENTATION & EXAMPLE USAGE (agent.ts)
 ****************************************************/
import { AgentContext, ITools, createToolSetWithContext } from "./tool.js";
import { google } from "@ai-sdk/google";
import {
  CoreMessage,
  generateObject,
  generateText,
  LanguageModel,
  NoSuchToolError,
} from "ai";

/**
 * Options object for constructing an Agent instance.
 */
interface AgentOptions {
  /**
   * The LanguageModel used for text generation and tool calls.
   * e.g., google("gemini-2.0-flash-001", { temperature: 0.7 })
   */
  model?: LanguageModel;

  /**
   * The system prompt that sets the high-level behavior / persona of the agent.
   */
  systemPrompt?: string;

  /**
   * An array of messages leading up to the AI's final answer.
   * e.g., conversation history or tasks to do.
   */
  messages?: CoreMessage[];

  /**
   * Which tools the LLM is allowed to call by name.
   */
  activeTools?: string[];

  /**
   * A safeguard to prevent infinite loops. Limits chain-of-thought steps.
   */
  maxSteps?: number;

  /**
   * Arbitrary context data that the agent's tools can leverage.
   */
  context?: AgentContext;

  /**
   * A dictionary of dynamic tools that can be used by this agent.
   * The agent calls these at runtime.
   */
  tools?: ITools;
}

/**
 * The Agent class, which can handle dynamic tools and pass in `AgentContext`.
 */
export class Agent {
  private readonly model: LanguageModel;
  private readonly systemPrompt: string;
  private readonly messages: CoreMessage[];
  private readonly activeTools: string[];
  private readonly maxSteps: number;
  private readonly context: AgentContext;
  private readonly tools: ITools;

  constructor({
    model,
    systemPrompt,
    messages = [],
    activeTools = [],
    maxSteps = 10,
    context = {},
    tools = {},
  }: AgentOptions) {
    // Basic validation: ensure we have a model and system prompt
    if (!model) {
      throw new Error("Model is required");
    }
    if (!systemPrompt) {
      throw new Error("System prompt is required");
    }

    this.model = model;
    this.systemPrompt = systemPrompt;
    this.messages = messages;
    this.activeTools = activeTools;
    this.maxSteps = maxSteps;
    this.context = context;
    this.tools = tools;
  }

  /**
   * Runs the agent using the provided language model,
   * attaching context to each dynamic tool, and then
   * calling `generateText` with the final toolset.
   */
  public async run(): Promise<string> {
    // 1) Build a context-bound toolset from the dynamic tools
    const fullToolSet = createToolSetWithContext(this.tools, this.context);

    // 2) Filter the toolset by the allowed tool names in `activeTools`
    const filteredToolSet = Object.fromEntries(
      Object.entries(fullToolSet).filter(([toolName]) =>
        this.activeTools.includes(toolName),
      ),
    );

    // 3) Call generateText, letting the AI use the (filtered) tools
    const result = await generateText({
      model: this.model,
      system: this.systemPrompt,
      messages: this.messages,
      experimental_activeTools: Object.keys(filteredToolSet),
      maxSteps: this.maxSteps,

      // Attempt to fix arguments if there's a schema mismatch or similar
      experimental_repairToolCall: async ({
        toolCall,
        tools,
        parameterSchema,
        error,
      }) => {
        // If the LLM calls a non-existent tool, skip repair
        if (NoSuchToolError.isInstance(error)) {
          return null;
        }

        // Attempt argument repair if the schema was invalid
        const tool = tools[toolCall.toolName as keyof typeof tools];
        if (!tool) {
          // This can happen if the tool name is not recognized at all
          return null;
        }

        const { object: repairedArgs } = await generateObject({
          model: google("gemini-2.0-flash-001", {
            structuredOutputs: true,
          }),
          schema: tool.parameters,
          prompt: [
            `The model tried to call the tool "${toolCall.toolName}"`,
            "with the following arguments:",
            JSON.stringify(toolCall.args),
            "The tool accepts the following schema:",
            JSON.stringify(parameterSchema(toolCall)),
            "Please fix the arguments.",
          ].join("\\n"),
        });

        return { ...toolCall, args: JSON.stringify(repairedArgs) };
      },

      tools: filteredToolSet,
    });

    return result.text;
  }
}

/****************************************************
 * AGENT BUILDER PATTERN
 ****************************************************/
export class AgentBuilder {
  private model?: LanguageModel;
  private systemPrompt?: string;
  private messages: CoreMessage[] = [];
  private activeTools: string[] = [];
  private maxSteps = 10;
  private context: AgentContext = {};
  private tools: ITools = {};

  public setModel(model: LanguageModel): AgentBuilder {
    this.model = model;
    return this;
  }

  public setSystemPrompt(prompt: string): AgentBuilder {
    this.systemPrompt = prompt;
    return this;
  }

  public addMessage(message: CoreMessage): AgentBuilder {
    this.messages.push(message);
    return this;
  }

  public addMessages(messages: CoreMessage[]): AgentBuilder {
    this.messages.push(...messages);
    return this;
  }

  public setMaxSteps(maxSteps: number): AgentBuilder {
    this.maxSteps = maxSteps;
    return this;
  }

  public setContext(context: AgentContext): AgentBuilder {
    this.context = context;
    return this;
  }

  public setITools(tools: ITools): AgentBuilder {
    this.tools = tools;
    return this;
  }

  public build(): Agent {
    if (!this.model) {
      throw new Error("Model is required");
    }
    if (!this.systemPrompt) {
      throw new Error("System prompt is required");
    }

    return new Agent({
      model: this.model,
      systemPrompt: this.systemPrompt,
      messages: this.messages,
      activeTools: this.activeTools,
      maxSteps: this.maxSteps,
      context: this.context,
      tools: this.tools,
    });
  }
}
