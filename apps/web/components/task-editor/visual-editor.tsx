import { AutoFormProps } from "@/types/task-editor";
import { AutosizeTextarea } from "@workspace/ui/components/autosize-textarea";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Copy,
  PlusCircle,
  Trash2,
} from "lucide-react";
import React, { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";

const FIELD_TYPES = [
  { label: "Text", value: "text" },
  { label: "Number", value: "number" },
  { label: "Email", value: "email" },
  { label: "Password", value: "password" },
  { label: "Select", value: "select" },
  { label: "Multi Select", value: "multi-select" },
  { label: "Textarea", value: "textarea" },
];

type VisualEditorProps = {
  initialData?: AutoFormProps["metadata"];
  values?: AutoFormProps["metadata"];
  onChange?: (data: AutoFormProps["metadata"]) => void;
};

export function VisualEditor({
  initialData,
  values,
  onChange,
}: VisualEditorProps) {
  const form = useForm({
    defaultValues:
      initialData ||
      ({
        title: "",
        description: "",
        prompt: "",
        fields: [],
        type: "general",
      } as AutoFormProps["metadata"]),
  });

  const { fields, append, remove, move, insert } = useFieldArray({
    control: form.control,
    name: "fields",
  });

  const handleAddField = () => {
    append({
      name: "",
      label: "",
      type: "text",
      placeholder: "",
      description: "",
      options: [],
    });
  };

  const handleDuplicateField = (index: number) => {
    const fieldToDuplicate = form.getValues(`fields.${index}`);
    insert(index + 1, { ...fieldToDuplicate });
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      move(index, index - 1);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < fields.length - 1) {
      move(index, index + 1);
    }
  };

  useEffect(() => {
    const { unsubscribe } = form.watch((value) => {
      if (onChange) {
        onChange(value as AutoFormProps["metadata"]);
      }
    });
    return () => unsubscribe();
  }, [form, onChange]);

  useEffect(() => {
    form.reset(values);
  }, [form, values]);

  return (
    <div className="container mx-auto space-y-8 p-4">
      <Form {...form}>
        <form className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Form Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Form Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter form title" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Form Description</FormLabel>
                    <FormControl>
                      <AutosizeTextarea
                        {...field}
                        placeholder="Enter form description"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Form Prompt</FormLabel>
                    <FormControl>
                      <AutosizeTextarea
                        {...field}
                        placeholder="Enter form prompt"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Form Title</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="genaral, contact, or group"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <Card key={field.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-4">
                    <span>Field {index + 1}</span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="h-8 w-8"
                      >
                        <ArrowUpCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === fields.length - 1}
                        className="h-8 w-8"
                      >
                        <ArrowDownCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={() => handleDuplicateField(index)}
                        className="h-8 w-8"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={() => remove(index)}
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name={`fields.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Field Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter field name" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`fields.${index}.label`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Field Label</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter field label" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`fields.${index}.type`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Field Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select field type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {FIELD_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`fields.${index}.placeholder`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Placeholder</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter placeholder text"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`fields.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <AutosizeTextarea
                            {...field}
                            placeholder="Enter field description"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleAddField}
              className="flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Add Field
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
