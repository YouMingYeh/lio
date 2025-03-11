import { useTheme } from "../../hooks/use-theme";
import { ToolbarButton } from "../toolbar-button";
import { CaretDownIcon, CheckIcon } from "@radix-ui/react-icons";
import type { Editor } from "@tiptap/react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@workspace/ui/components/popover";
import type { toggleVariants } from "@workspace/ui/components/toggle";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import type { VariantProps } from "class-variance-authority";
import * as React from "react";

interface ColorItem {
  cssVar: string;
  label: string;
  darkLabel?: string;
}

interface ColorPalette {
  label: string;
  colors: ColorItem[];
  inverse: string;
}

const COLORS: ColorPalette[] = [
  {
    label: "調色盤 1", // Palette 1
    inverse: "hsl(var(--background))",
    colors: [
      { cssVar: "hsl(var(--foreground))", label: "預設" }, // Default
      { cssVar: "var(--mt-accent-bold-blue)", label: "深藍色" }, // Bold blue
      { cssVar: "var(--mt-accent-bold-teal)", label: "深青色" }, // Bold teal
      { cssVar: "var(--mt-accent-bold-green)", label: "深綠色" }, // Bold green
      { cssVar: "var(--mt-accent-bold-orange)", label: "深橙色" }, // Bold orange
      { cssVar: "var(--mt-accent-bold-red)", label: "深紅色" }, // Bold red
      { cssVar: "var(--mt-accent-bold-purple)", label: "深紫色" }, // Bold purple
    ],
  },
  {
    label: "調色盤 2", // Palette 2
    inverse: "hsl(var(--background))",
    colors: [
      { cssVar: "var(--mt-accent-gray)", label: "灰色" }, // Gray
      { cssVar: "var(--mt-accent-blue)", label: "藍色" }, // Blue
      { cssVar: "var(--mt-accent-teal)", label: "青色" }, // Teal
      { cssVar: "var(--mt-accent-green)", label: "綠色" }, // Green
      { cssVar: "var(--mt-accent-orange)", label: "橙色" }, // Orange
      { cssVar: "var(--mt-accent-red)", label: "紅色" }, // Red
      { cssVar: "var(--mt-accent-purple)", label: "紫色" }, // Purple
    ],
  },
  {
    label: "調色盤 3", // Palette 3
    inverse: "hsl(var(--foreground))",
    colors: [
      { cssVar: "hsl(var(--background))", label: "白色", darkLabel: "黑色" }, // White, Black
      { cssVar: "var(--mt-accent-blue-subtler)", label: "淺藍色" }, // Blue subtle
      { cssVar: "var(--mt-accent-teal-subtler)", label: "淺青色" }, // Teal subtle
      { cssVar: "var(--mt-accent-green-subtler)", label: "淺綠色" }, // Green subtle
      { cssVar: "var(--mt-accent-yellow-subtler)", label: "淺黃色" }, // Yellow subtle
      { cssVar: "var(--mt-accent-red-subtler)", label: "淺紅色" }, // Red subtle
      { cssVar: "var(--mt-accent-purple-subtler)", label: "淺紫色" }, // Purple subtle
    ],
  },
];

const MemoizedColorButton = React.memo<{
  color: ColorItem;
  isSelected: boolean;
  inverse: string;
  onClick: (value: string) => void;
}>(({ color, isSelected, inverse, onClick }) => {
  const isDarkMode = useTheme();
  const label = isDarkMode && color.darkLabel ? color.darkLabel : color.label;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <ToggleGroupItem
          tabIndex={0}
          className="relative size-7 rounded-md p-0"
          value={color.cssVar}
          aria-label={label}
          style={{ backgroundColor: color.cssVar }}
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            onClick(color.cssVar);
          }}
        >
          {isSelected && (
            <CheckIcon
              className="absolute inset-0 m-auto size-6"
              style={{ color: inverse }}
            />
          )}
        </ToggleGroupItem>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
});

MemoizedColorButton.displayName = "MemoizedColorButton";

const MemoizedColorPicker = React.memo<{
  palette: ColorPalette;
  selectedColor: string;
  inverse: string;
  onColorChange: (value: string) => void;
}>(({ palette, selectedColor, inverse, onColorChange }) => (
  <ToggleGroup
    type="single"
    value={selectedColor}
    onValueChange={(value: string) => {
      if (value) onColorChange(value);
    }}
    className="gap-1.5"
  >
    {palette.colors.map((color, index) => (
      <MemoizedColorButton
        key={index}
        inverse={inverse}
        color={color}
        isSelected={selectedColor === color.cssVar}
        onClick={onColorChange}
      />
    ))}
  </ToggleGroup>
));

MemoizedColorPicker.displayName = "MemoizedColorPicker";

interface SectionThreeProps extends VariantProps<typeof toggleVariants> {
  editor: Editor;
}

export const SectionThree: React.FC<SectionThreeProps> = ({
  editor,
  size,
  variant,
}) => {
  const color =
    editor.getAttributes("textStyle")?.color || "hsl(var(--foreground))";
  const [selectedColor, setSelectedColor] = React.useState(color);

  const handleColorChange = React.useCallback(
    (value: string) => {
      setSelectedColor(value);
      editor.chain().setColor(value).run();
    },
    [editor],
  );

  React.useEffect(() => {
    setSelectedColor(color);
  }, [color]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <ToolbarButton
          tooltip="文字顏色" // Text color
          aria-label="文字顏色" // Text color
          className="w-12"
          size={size}
          variant={variant}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-5"
            style={{ color: selectedColor }}
          >
            <path d="M4 20h16" />
            <path d="m6 16 6-12 6 12" />
            <path d="M8 12h8" />
          </svg>
          <CaretDownIcon className="size-5" />
        </ToolbarButton>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-full">
        <div className="space-y-1.5">
          {COLORS.map((palette, index) => (
            <MemoizedColorPicker
              key={index}
              palette={palette}
              inverse={palette.inverse}
              selectedColor={selectedColor}
              onColorChange={handleColorChange}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

SectionThree.displayName = "SectionThree";

export default SectionThree;
