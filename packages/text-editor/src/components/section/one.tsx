import type { FormatAction } from "../../types";
import { ShortcutKey } from "../shortcut-key";
import { ToolbarButton } from "../toolbar-button";
import { CaretDownIcon, LetterCaseCapitalizeIcon } from "@radix-ui/react-icons";
import type { Level } from "@tiptap/extension-heading";
import type { Editor } from "@tiptap/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import type { toggleVariants } from "@workspace/ui/components/toggle";
import { cn } from "@workspace/ui/lib/utils";
import type { VariantProps } from "class-variance-authority";
import * as React from "react";

interface TextStyle
  extends Omit<
    FormatAction,
    "value" | "icon" | "action" | "isActive" | "canExecute"
  > {
  element: keyof React.JSX.IntrinsicElements;
  level?: Level;
  className: string;
}

const formatActions: TextStyle[] = [
  {
    label: "一般文字", // Normal Text
    element: "span",
    className: "grow",
    shortcuts: ["mod", "alt", "0"],
  },
  {
    label: "標題 1", // Heading 1
    element: "h1",
    level: 1,
    className: "m-0 grow text-3xl font-extrabold",
    shortcuts: ["mod", "alt", "1"],
  },
  {
    label: "標題 2", // Heading 2
    element: "h2",
    level: 2,
    className: "m-0 grow text-xl font-bold",
    shortcuts: ["mod", "alt", "2"],
  },
  {
    label: "標題 3", // Heading 3
    element: "h3",
    level: 3,
    className: "m-0 grow text-lg font-semibold",
    shortcuts: ["mod", "alt", "3"],
  },
  {
    label: "標題 4", // Heading 4
    element: "h4",
    level: 4,
    className: "m-0 grow text-base font-semibold",
    shortcuts: ["mod", "alt", "4"],
  },
  {
    label: "標題 5", // Heading 5
    element: "h5",
    level: 5,
    className: "m-0 grow text-sm font-normal",
    shortcuts: ["mod", "alt", "5"],
  },
  {
    label: "標題 6", // Heading 6
    element: "h6",
    level: 6,
    className: "m-0 grow text-sm font-normal",
    shortcuts: ["mod", "alt", "6"],
  },
];

interface SectionOneProps extends VariantProps<typeof toggleVariants> {
  editor: Editor;
  activeLevels?: Level[];
}

export const SectionOne: React.FC<SectionOneProps> = React.memo(
  ({ editor, activeLevels = [1, 2, 3, 4, 5, 6], size, variant }) => {
    const filteredActions = React.useMemo(
      () =>
        formatActions.filter(
          (action) => !action.level || activeLevels.includes(action.level),
        ),
      [activeLevels],
    );

    const handleStyleChange = React.useCallback(
      (level?: Level) => {
        if (level) {
          editor.chain().focus().toggleHeading({ level }).run();
        } else {
          editor.chain().focus().setParagraph().run();
        }
      },
      [editor],
    );

    const renderMenuItem = React.useCallback(
      ({ label, element: Element, level, className, shortcuts }: TextStyle) => (
        <DropdownMenuItem
          key={label}
          onClick={() => handleStyleChange(level)}
          className={cn("flex flex-row items-center justify-between gap-4", {
            "bg-accent": level
              ? editor.isActive("heading", { level })
              : editor.isActive("paragraph"),
          })}
          aria-label={label}
        >
          <Element className={className}>{label}</Element>
          <ShortcutKey keys={shortcuts} />
        </DropdownMenuItem>
      ),
      [editor, handleStyleChange],
    );

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <ToolbarButton
            isActive={editor.isActive("heading")}
            tooltip="文字樣式" // Text styles
            aria-label="文字樣式" // Text styles
            pressed={editor.isActive("heading")}
            className="w-12"
            disabled={editor.isActive("codeBlock")}
            size={size}
            variant={variant}
          >
            <LetterCaseCapitalizeIcon className="size-5" />
            <CaretDownIcon className="size-5" />
          </ToolbarButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-full">
          {filteredActions.map(renderMenuItem)}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
);

SectionOne.displayName = "SectionOne";

export default SectionOne;
