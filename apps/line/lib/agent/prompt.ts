import { fillTemplate } from "../utils.js";

/**
 * Represents a section in the prompt, with label, text, and optional child sections.
 */
export class Section {
  public label: string;
  public text: string;
  public children: Section[];

  /**
   * @param label - The XML-like tag name for this section.
   * @param text - The textual content for this section.
   * @param children - Optional nested child sections.
   */
  constructor(label: string, text: string, children: Section[] = []) {
    this.label = label;
    this.text = text;
    this.children = children;
  }

  /**
   * Creates a Section by applying `fillTemplate()` on a given template string.
   *
   * @param label - The XML-like tag name for this section.
   * @param template - A template string containing placeholders like {{key}}.
   * @param data - A record of key-value pairs to replace in the template.
   * @param emptyValue - The value to insert for any placeholders in the template that are not found in `data`.
   * @param children - Optional nested child sections.
   */
  public static fromTemplate<T extends Record<string, string>>(
    label: string,
    template: string,
    data: T,
    emptyValue = "N/A",
    children: Section[] = [],
  ): Section {
    const text = fillTemplate(template, data, emptyValue);
    return new Section(label, text, children);
  }
}

/**
 * A container for the final prompt.
 * We mainly store the textual result after building all sections.
 */
export class Prompt {
  public readonly text: string;

  constructor(text: string) {
    this.text = text;
  }

  /**
   * Returns a string representation of the prompt.
   */
  public toString(): string {
    return `Prompt:\n${this.text}`;
  }
}

/**
 * Predefined section examples. (Just for demonstration)
 */
export const sectionExamples = {
  a: "This is an example of Section A.",
} as const;

export type SectionExamples = typeof sectionExamples;

/**
 * Predefined template examples. (Just for demonstration)
 */
export const templateExamples = {
  a: {
    template: "`... {{a}} ...",
    variables: ["a"],
  },
} as const;

export type TemplateExamples = typeof templateExamples;

/**
 * A builder for constructing prompts with support for nested sections.
 * Internally, it collects Section objects in a list.
 */
export class PromptBuilder {
  private sections: Section[] = [];

  /**
   * Adds a new Section (manually specifying label and text).
   * Optionally accepts a callback `childrenBuilder` to build nested sections.
   *
   * @param label - The section tag/label.
   * @param text - The content of the section.
   * @param childrenBuilder - An optional callback to build child sections.
   */
  public addSection(
    label: string,
    text: string,
    childrenBuilder?: (builder: PromptBuilder) => void,
  ): this {
    // 1) 建立空的 nested builder 以收集子 Section
    let children: Section[] = [];
    if (childrenBuilder) {
      const nestedBuilder = new PromptBuilder();
      childrenBuilder(nestedBuilder);
      children = nestedBuilder.getSections();
    }
    // 2) 建立當前 Section 並推入 sections
    const section = new Section(label, text, children);
    this.sections.push(section);
    return this;
  }

  /**
   * Adds a Section from a template (filling placeholders).
   *
   * @param label - The section tag/label.
   * @param template - The template string with placeholders like {{key}}.
   * @param data - The record containing values for placeholders.
   * @param emptyValue - The fallback for any missing placeholder.
   * @param childrenBuilder - Optional callback for nested sections.
   */
  public addSectionWithTemplate<T extends Record<string, string>>(
    label: string,
    template: string,
    data: T,
    emptyValue = "N/A",
    childrenBuilder?: (builder: PromptBuilder) => void,
  ): this {
    let children: Section[] = [];
    if (childrenBuilder) {
      const nestedBuilder = new PromptBuilder();
      childrenBuilder(nestedBuilder);
      children = nestedBuilder.getSections();
    }
    // 直接用 Section.fromTemplate 生成
    const section = Section.fromTemplate(
      label,
      template,
      data,
      emptyValue,
      children,
    );
    this.sections.push(section);
    return this;
  }

  /**
   * Adds a Section using one of the predefined section examples by key.
   *
   * @param label - The XML label to wrap the text in.
   * @param exampleKey - The key from the sectionExamples object.
   * @param childrenBuilder - (optional) callback to build child sections.
   */
  public addExampleSection<K extends keyof SectionExamples>(
    label: string,
    exampleKey: K,
    childrenBuilder?: (builder: PromptBuilder) => void,
  ): this {
    const exampleText = sectionExamples[exampleKey];
    return this.addSection(label, exampleText, childrenBuilder);
  }

  /**
   * Adds a Section using one of the predefined template examples.
   * This is basically a convenience method for addSectionWithTemplate().
   *
   * @param label - The section tag/label.
   * @param exampleTemplateName - The key of templateExamples.
   * @param data - Key-value pairs for placeholders used in the template.
   * @param emptyValue - The fallback for missing placeholders.
   * @param childrenBuilder - Optional nested structure builder.
   */
  public addWithExampleTemplate<K extends keyof TemplateExamples>(
    label: string,
    exampleTemplateName: K,
    data: { [key in TemplateExamples[K]["variables"][number]]: string },
    emptyValue = "N/A",
    childrenBuilder?: (builder: PromptBuilder) => void,
  ): this {
    const { template } = templateExamples[exampleTemplateName];
    return this.addSectionWithTemplate(
      label,
      template,
      data,
      emptyValue,
      childrenBuilder,
    );
  }

  /**
   * Adds the current date and time as a Section. (For demonstration)
   */
  public addCurrentDateTime(
    locale: Intl.LocalesArgument,
    childrenBuilder?: (builder: PromptBuilder) => void,
  ): this {
    return this.addSection(
      "current_date_and_time",
      new Date().toLocaleString(locale),
      childrenBuilder,
    );
  }

  /**
   * Adds the current date as a Section. (For demonstration)
   */
  public addCurrentDate(
    locale: Intl.LocalesArgument,
    childrenBuilder?: (builder: PromptBuilder) => void,
  ): this {
    return this.addSection(
      "current_date",
      new Date().toLocaleDateString(locale),
      childrenBuilder,
    );
  }

  /**
   * Adds the current time as a Section. (For demonstration)
   */
  public addCurrentTime(
    locale: Intl.LocalesArgument,
    childrenBuilder?: (builder: PromptBuilder) => void,
  ): this {
    return this.addSection(
      "current_time",
      new Date().toLocaleTimeString(locale),
      childrenBuilder,
    );
  }

  /**
   * Adds an instruction for default language as a Section. (For demonstration)
   */
  public addDefaultLanguage(
    language: string,
    childrenBuilder?: (builder: PromptBuilder) => void,
  ): this {
    const template =
      "Speak in {{language}} if the user does not specify a language.";
    return this.addSectionWithTemplate(
      "default_language",
      template,
      { language },
      "N/A",
      childrenBuilder,
    );
  }

  /**
   * Returns the accumulated top-level sections (including their children).
   */
  public getSections(): Section[] {
    return this.sections;
  }

  /**
   * Recursively renders sections and their children as an XML-like string with indentation.
   */
  public getSectionsText(): string {
    return this.sections
      .map((section) => this.renderSection(section))
      .join("\n\n");
  }

  /**
   * Renders a single section with nested children using a recursive approach.
   *
   * @param section - The Section to render.
   * @param indentLevel - The current indentation level (for nested sections).
   */
  private renderSection(section: Section, indentLevel = 0): string {
    const indent = "  ".repeat(indentLevel);
    const innerIndent = "  ".repeat(indentLevel + 1);

    // 先將 section.text 逐行縮排
    const sectionText = section.text
      .split("\n")
      .map((line) => innerIndent + line)
      .join("\n");

    // 若有子 Sections，遞迴處理
    let childrenText = "";
    if (section.children && section.children.length > 0) {
      childrenText = section.children
        .map((child) => this.renderSection(child, indentLevel + 1))
        .join("\n");
      childrenText = "\n" + childrenText;
    }

    return `${indent}<${section.label}>\n${sectionText}${childrenText}\n${indent}</${section.label}>`;
  }

  /**
   * Constructs the final Prompt object.
   */
  public build(): Prompt {
    return new Prompt(this.getSectionsText());
  }
}
