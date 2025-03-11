import { Button, ButtonProps } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Input } from "@workspace/ui/components/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { useChat } from "ai/react";
import {
  TextIcon as LetterText,
  Smile,
  PencilRuler,
  Eraser,
  PenLine,
  Check,
  X,
  ArrowUpRight,
} from "lucide-react";
import React, { useEffect, useState } from "react";

type PromptGroup = {
  label: React.ReactNode;
  prompts: Prompt[];
};

type Prompt = {
  label: React.ReactNode;
  value: string;
};

type AIImprovementDropdownProps = {
  input: string;
  onFinished: (improvedPrompt: string) => void;
  children: React.ReactNode;
  prompts?: PromptGroup[];
} & ButtonProps;

const SYSTEM_PROMPT = `You are an awesome text refinement assistant. Given a user’s original text and a prompt, 
          your sole task is to provide an improved version of the text—focusing on better wording, 
          grammar, and clarity—without adding extra commentary or changing the original language（尤其是您必須辨識如果使用繁體中文，請您必須使用繁體中文）.

          For example, if the original text is: “您好，您是誰？” with the prompt “更正是”, a valid revision could be: “您好，請問您是？
          
          Note: if the prompt is “繼續寫”, you should rewrite the text from scratch but keep the original text.`;

export function AIImprovementDropdown({
  input,
  onFinished,
  children,
  size = "icon",
  variant = "ghost",
  prompts = [
    {
      label: "✨ 改善口吻",
      prompts: [
        { label: <LetterText size={16} className="mr-2" />, value: "更正式" },
        { label: <Smile size={16} className="mr-2" />, value: "更輕鬆" },
      ],
    },
    {
      label: "✨ 改善文字",
      prompts: [
        {
          label: <PencilRuler size={16} className="mr-2" />,
          value: "更清楚明瞭",
        },
        { label: <Eraser size={16} className="mr-2" />, value: "更簡短" },
        { label: <PenLine size={16} className="mr-2" />, value: "繼續寫" },
      ],
    },
  ],
  ...props
}: AIImprovementDropdownProps) {
  const { append, isLoading, messages } = useChat({
    api: "/api/ai",
    body: { system: SYSTEM_PROMPT },
  });

  const [improvedText, setImprovedText] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");

  const handleImproveTextInput = async (prompt: string) => {
    setImprovedText(null);
    append({
      role: "user",
      content: `
        Original text: ${input}
        Prompt: ${prompt}`,
    });
  };

  const handleCustomPromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customPrompt.trim()) {
      handleImproveTextInput(customPrompt);
      setCustomPrompt("");
    }
  };

  useEffect(() => {
    if (!messages.length) return;
    const lastMessage = messages[messages.length - 1];

    if (!lastMessage) return;

    if (lastMessage.role === "assistant" && lastMessage.content) {
      setImprovedText(lastMessage.content);
    }
  }, [messages]);

  const handleConfirm = () => {
    if (improvedText) {
      onFinished(improvedText);
      setImprovedText(null);
    }
  };

  const handleCancel = () => {
    setImprovedText(null);
  };

  return (
    <Popover
      open={improvedText !== null}
      onOpenChange={(open) => {
        if (!open) {
          setImprovedText(null);
        }
      }}
    >
      <DropdownMenu>
        <PopoverTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              size={size}
              variant={variant}
              {...props}
              loading={isLoading}
            >
              {children}
            </Button>
          </DropdownMenuTrigger>
        </PopoverTrigger>
        <DropdownMenuContent className="w-56">
          {prompts.map((group, index) => (
            <React.Fragment key={index}>
              <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
              {group.prompts.map((prompt) => (
                <DropdownMenuItem
                  key={prompt.value}
                  onSelect={() => handleImproveTextInput(prompt.value)}
                >
                  {prompt.label} {prompt.value}
                </DropdownMenuItem>
              ))}
              {index < prompts.length - 1 && <DropdownMenuSeparator />}
            </React.Fragment>
          ))}
          <DropdownMenuSeparator />
          <div className="p-2">
            <form
              onSubmit={handleCustomPromptSubmit}
              className="flex items-center space-x-2"
            >
              <Input
                type="text"
                placeholder="請幫我改善..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="flex-grow"
              />
              <Button type="submit" size="sm" disabled={!customPrompt.trim()}>
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <PopoverContent className="w-80">
        <div className="space-y-2">
          <p className="text-sm font-medium">改善為：</p>
          <p className="text-sm">{improvedText}</p>
          <div className="flex justify-end space-x-2">
            <Button size="sm" variant="outline" onClick={handleCancel}>
              <X className="mr-2 h-4 w-4" />
              取消
            </Button>
            <Button size="sm" onClick={handleConfirm}>
              <Check className="mr-2 h-4 w-4" />
              確認
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
