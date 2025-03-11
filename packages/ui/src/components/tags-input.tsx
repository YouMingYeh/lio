"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { cn } from "@workspace/ui/lib/utils";
import { Plus, X } from "lucide-react";
import { ChevronDown } from "lucide-react";
import React from "react";

/**
 * used for identifying the split char and use will pasting
 */
const SPLITTER_REGEX = /[\n#?=&\t,./-]+/;

/**
 * used for formatting the pasted element for the correct value format to be added
 */

const FORMATTING_REGEX = /^[^a-zA-Z0-9]*|[^a-zA-Z0-9]*$/g;

interface TagsInputProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string[];
  onValueChange: (value: string[]) => void;
  placeholder?: string;
  maxItems?: number;
  minItems?: number;
  options?: string[];
}

interface TagsInputContextProps {
  value: string[];
  onValueChange: (value: any) => void;
  inputValue: string;
  setInputValue: React.Dispatch<React.SetStateAction<string>>;
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
}

const TagInputContext = React.createContext<TagsInputContextProps | null>(null);

export const TagsInput = React.forwardRef<HTMLDivElement, TagsInputProps>(
  (
    {
      children,
      value,
      onValueChange,
      placeholder,
      maxItems,
      minItems,
      options,
      className,
      dir,
      ...props
    },
    ref,
  ) => {
    const [activeIndex, setActiveIndex] = React.useState(-1);
    const [inputValue, setInputValue] = React.useState("");
    const [disableInput, setDisableInput] = React.useState(false);
    const [disableButton, setDisableButton] = React.useState(false);
    const [isValueSelected, setIsValueSelected] = React.useState(false);
    const [selectedValue, setSelectedValue] = React.useState("");

    // --- ADDED FOR IME COMPOSITION ---
    const [isComposing, setIsComposing] = React.useState(false);
    // ---------------------------------

    const parseMinItems = minItems ?? 0;
    const parseMaxItems = maxItems ?? Infinity;

    const onValueChangeHandler = React.useCallback(
      (val: string) => {
        if (!value.includes(val) && value.length < parseMaxItems) {
          onValueChange([...value, val]);
        }
      },
      [value],
    );

    const RemoveValue = React.useCallback(
      (val: string) => {
        if (value.includes(val) && value.length > parseMinItems) {
          onValueChange(value.filter((item) => item !== val));
        }
      },
      [value],
    );

    const handlePaste = React.useCallback(
      (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const tags = e.clipboardData.getData("text").split(SPLITTER_REGEX);
        const newValue = [...value];
        tags.forEach((item) => {
          const parsedItem = item.replaceAll(FORMATTING_REGEX, "").trim();
          if (
            parsedItem.length > 0 &&
            !newValue.includes(parsedItem) &&
            newValue.length < parseMaxItems
          ) {
            newValue.push(parsedItem);
          }
        });
        onValueChange(newValue);
        setInputValue("");
      },
      [value],
    );

    const handleSelect = React.useCallback(
      (e: React.SyntheticEvent<HTMLInputElement>) => {
        e.preventDefault();
        const target = e.currentTarget;
        const selection = target.value.substring(
          target.selectionStart ?? 0,
          target.selectionEnd ?? 0,
        );

        setSelectedValue(selection);
        setIsValueSelected(selection === inputValue);
      },
      [inputValue],
    );

    React.useEffect(() => {
      const VerifyDisable = () => {
        if (value.length - 1 >= parseMinItems) {
          setDisableButton(false);
        } else {
          setDisableButton(true);
        }
        if (value.length + 1 <= parseMaxItems) {
          setDisableInput(false);
        } else {
          setDisableInput(true);
        }
      };
      VerifyDisable();
    }, [value]);

    const handleKeyDown = React.useCallback(
      async (e: React.KeyboardEvent<HTMLInputElement>) => {
        e.stopPropagation();

        const moveNext = () => {
          const nextIndex =
            activeIndex + 1 > value.length - 1 ? -1 : activeIndex + 1;
          setActiveIndex(nextIndex);
        };

        const movePrev = () => {
          const prevIndex =
            activeIndex - 1 < 0 ? value.length - 1 : activeIndex - 1;
          setActiveIndex(prevIndex);
        };

        const moveCurrent = () => {
          const newIndex =
            activeIndex - 1 <= 0
              ? value.length - 1 === 0
                ? -1
                : 0
              : activeIndex - 1;
          setActiveIndex(newIndex);
        };
        const target = e.currentTarget;

        switch (e.key) {
          case "ArrowLeft":
            if (dir === "rtl") {
              if (value.length > 0 && activeIndex !== -1) {
                moveNext();
              }
            } else {
              if (value.length > 0 && target.selectionStart === 0) {
                movePrev();
              }
            }
            break;

          case "ArrowRight":
            if (dir === "rtl") {
              if (value.length > 0 && target.selectionStart === 0) {
                movePrev();
              }
            } else {
              if (value.length > 0 && activeIndex !== -1) {
                moveNext();
              }
            }
            break;

          case "Backspace":
          case "Delete":
            if (value.length > 0) {
              if (
                activeIndex !== -1 &&
                activeIndex < value.length &&
                value[activeIndex]
              )
                RemoveValue(value[activeIndex]);
              moveCurrent();
            } else {
              if (target.selectionStart === 0) {
                if (selectedValue === inputValue || isValueSelected) {
                  if (value[value.length - 1] !== undefined) {
                    RemoveValue(value[value.length - 1] as string);
                  }
                }
              }
            }
            break;

          case "Escape":
            const newIndex = activeIndex === -1 ? value.length - 1 : -1;
            setActiveIndex(newIndex);
            break;

          case "Enter":
            // --- MODIFIED TO CHECK COMPOSING ---
            if (!isComposing && inputValue.trim() !== "") {
              e.preventDefault();
              onValueChangeHandler(inputValue);
              setInputValue("");
            }
            break;
        }
      },
      [activeIndex, value, inputValue, RemoveValue, isComposing],
    );

    const mousePreventDefault = React.useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
    }, []);

    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.currentTarget.value);
      },
      [],
    );

    const handleOptionSelect = React.useCallback(
      (option: string) => {
        if (!value.includes(option) && value.length < parseMaxItems) {
          onValueChange([...value, option]);
        }
      },
      [value, parseMaxItems, onValueChange],
    );

    const filteredOptions = options?.filter(
      (option) => !value.includes(option),
    );

    return (
      <TagInputContext.Provider
        value={{
          value,
          onValueChange,
          inputValue,
          setInputValue,
          activeIndex,
          setActiveIndex,
        }}
      >
        <div
          {...props}
          ref={ref}
          dir={dir}
          className={cn(
            "bg-background ring-muted flex flex-wrap items-center gap-1 overflow-hidden rounded-lg border p-1.5 ring-1",
            {
              "focus-within:ring-ring": activeIndex === -1,
            },
            className,
          )}
        >
          {value.map((item, index) => (
            <Badge
              tabIndex={activeIndex !== -1 ? 0 : activeIndex}
              key={item}
              aria-disabled={disableButton}
              data-active={activeIndex === index}
              className={cn(
                "data-[active='true']:ring-muted-foreground relative flex items-center gap-1 truncate rounded px-1 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 data-[active='true']:ring-2",
              )}
              // variant={"secondary"}
            >
              <span className="text-xs">{item}</span>
              <button
                type="button"
                aria-label={`Remove ${item} option`}
                aria-roledescription="button to remove option"
                disabled={disableButton}
                onMouseDown={mousePreventDefault}
                onClick={() => RemoveValue(item)}
                className="disabled:cursor-not-allowed"
              >
                <span className="sr-only">Remove {item} option</span>
                <X className="hover:stroke-destructive h-4 w-4" />
              </button>
            </Badge>
          ))}
          <Input
            tabIndex={0}
            aria-label="input tag"
            disabled={disableInput}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            value={inputValue}
            onSelect={handleSelect}
            onChange={activeIndex === -1 ? handleChange : undefined}
            placeholder={placeholder}
            onClick={() => setActiveIndex(-1)}
            // --- ADDED FOR IME COMPOSITION ---
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            // ---------------------------------
            className={cn(
              "placeholder:text-muted-foreground h-7 min-w-fit flex-1 border-none px-1 shadow-none outline-0 focus-visible:border-0 focus-visible:outline-0 focus-visible:ring-0 focus-visible:ring-offset-0",
              activeIndex !== -1 && "caret-transparent",
            )}
          />
          {filteredOptions && filteredOptions.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 px-2">
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0" align="end">
                <div className="grid gap-1 p-1">
                  {filteredOptions.map((option) => (
                    <Button
                      key={option}
                      variant="ghost"
                      size="sm"
                      className="justify-start p-1 py-0 font-normal"
                      onClick={() => handleOptionSelect(option)}
                    >
                      <Plus className="mr-2 h-3 w-3" />
                      {option}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </TagInputContext.Provider>
    );
  },
);

TagsInput.displayName = "TagsInput";
