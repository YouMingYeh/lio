"use client";

import { useAutoForm } from "../../hooks/use-auto-form";
import type { AutoFormProps, Field, FieldValue } from "../../types/task-editor";
import { AIImprovementDropdown } from "../ai/ai-improvement-dropdown";
import { AutosizeTextarea } from "@workspace/ui/components/autosize-textarea";
import { Button } from "@workspace/ui/components/button";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Wand2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { ControllerRenderProps, FieldValues } from "react-hook-form";

// Add these type definitions at the top of the file
type SelectFieldProps = {
  field: Field;
  formField: ControllerRenderProps<FieldValues, string>;
  acceptOther?: boolean;
};

type MultiSelectFieldProps = {
  field: Field;
  formField: ControllerRenderProps<FieldValues, string>;
  creatable?: boolean;
};

export function AutoForm({ metadata, onSubmit, onChange }: AutoFormProps) {
  const form = useAutoForm(metadata.fields);
  const fields = metadata.fields.map((field) => ({
    ...field,
  }));

  useEffect(() => {
    const { unsubscribe } = form.watch((values) => {
      onChange?.(values as Record<string, FieldValue>);
    });
    return () => unsubscribe();
  }, [form, form.watch, onChange]);

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.stopPropagation();
          e.preventDefault();

          if (onSubmit) {
            form.handleSubmit(onSubmit)(e);
          }
        }}
        className="h-full space-y-4 overflow-auto px-1"
        id="auto-form"
        key="auto-form"
      >
        {fields.map((field) => (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem className="relative">
                <FormLabel>{field.label || field.name}</FormLabel>
                {typeof formField.value === "string" ? (
                  <AIImprovementDropdown
                    input={formField.value || ""}
                    onFinished={(value) => formField.onChange(value)}
                    variant="ghost"
                    size="sm"
                  >
                    <Wand2 size={14} className="" />
                  </AIImprovementDropdown>
                ) : null}
                {field.type === "select" && (
                  <SelectField
                    field={field}
                    formField={formField}
                    acceptOther={field.acceptOther}
                  />
                )}
                {field.type === "multi-select" && (
                  <MultiSelectField
                    field={field}
                    formField={formField}
                    creatable={field.creatable}
                  />
                )}
                {field.type === "textarea" && (
                  <FormControl>
                    <AutosizeTextarea
                      minHeight={96}
                      placeholder={field.placeholder}
                      {...formField}
                    />
                  </FormControl>
                )}
                {(field.type === "text" ||
                  field.type === "number" ||
                  field.type === "email" ||
                  field.type === "password") && (
                  <FormControl>
                    <Input
                      type={field.type}
                      placeholder={field.placeholder}
                      {...formField}
                    />
                  </FormControl>
                )}

                {field.description && (
                  <FormDescription>{field.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        {onSubmit && (
          <Button type="submit" form="auto-form">
            提交
          </Button>
        )}
      </form>
    </Form>
  );
}

function SelectField({ field, formField, acceptOther }: SelectFieldProps) {
  const [otherValue, setOtherValue] = useState("");
  const [showOtherInput, setShowOtherInput] = useState(false);

  const handleSelectChange = (value: string) => {
    if (value === "other" && acceptOther) {
      setShowOtherInput(true);
      formField.onChange(otherValue);
    } else {
      setShowOtherInput(false);
      formField.onChange(value);
    }
  };

  return (
    <FormControl>
      <div>
        <Select
          onValueChange={handleSelectChange}
          defaultValue={formField.value}
        >
          <SelectTrigger>
            <SelectValue placeholder={field.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
            {acceptOther && <SelectItem value="other">其他</SelectItem>}
          </SelectContent>
        </Select>
        {showOtherInput && (
          <Input
            className="fade-in animate-in mt-2"
            placeholder="輸入自訂值"
            value={otherValue}
            onChange={(e) => {
              setOtherValue(e.target.value);
              formField.onChange(e.target.value);
            }}
          />
        )}
      </div>
    </FormControl>
  );
}

function MultiSelectField({
  field,
  formField,
  creatable,
}: MultiSelectFieldProps) {
  const [customValue, setCustomValue] = useState("");
  const [allOptions, setAllOptions] = useState(field.options || []);

  const handleCheckboxChange = (checked: boolean, value: string) => {
    const updatedValue = checked
      ? [...(formField.value || []), value]
      : (formField.value || []).filter((v: string) => v !== value);
    formField.onChange(updatedValue);
  };

  const handleAddCustomValue = () => {
    if (customValue) {
      // 如果自訂值尚未存在於選項中，則將其加入。
      if (!allOptions.find((option) => option.value === customValue)) {
        const newOption = { value: customValue, label: customValue };
        setAllOptions([...allOptions, newOption]);
      }
      // 如果自訂值尚未被選取，則將其加入表單值中
      if (!(formField.value || []).includes(customValue)) {
        const updatedValue = [...(formField.value || []), customValue];
        formField.onChange(updatedValue);
      }
      setCustomValue("");
    }
  };

  return (
    <FormControl>
      <div className="space-y-2">
        {allOptions.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <Checkbox
              id={option.value}
              checked={(formField.value as string[])?.includes(option.value)}
              onCheckedChange={(checked) =>
                handleCheckboxChange(checked as boolean, option.value)
              }
            />
            <label htmlFor={option.value}>{option.label}</label>
          </div>
        ))}
        {creatable && (
          <div className="mt-2 flex items-center space-x-2">
            <Input
              placeholder="新增自訂值"
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
            />
            <Button type="button" onClick={handleAddCustomValue}>
              新增
            </Button>
          </div>
        )}
      </div>
    </FormControl>
  );
}
