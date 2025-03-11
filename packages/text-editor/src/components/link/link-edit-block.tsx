import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Switch } from "@workspace/ui/components/switch";
import { cn } from "@workspace/ui/lib/utils";
import * as React from "react";

export interface LinkEditorProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultUrl?: string;
  defaultText?: string;
  defaultIsNewTab?: boolean;
  onSave: (url: string, text?: string, isNewTab?: boolean) => void;
}

export const LinkEditBlock = React.forwardRef<HTMLDivElement, LinkEditorProps>(
  ({ onSave, defaultIsNewTab, defaultUrl, defaultText, className }, ref) => {
    const formRef = React.useRef<HTMLDivElement>(null);
    const [url, setUrl] = React.useState(defaultUrl || "");
    const [text, setText] = React.useState(defaultText || "");
    const [isNewTab, setIsNewTab] = React.useState(defaultIsNewTab || false);

    const handleSave = React.useCallback(
      (e: React.FormEvent) => {
        e.preventDefault();
        if (formRef.current) {
          const isValid = Array.from(
            formRef.current.querySelectorAll("input"),
          ).every((input) => input.checkValidity());

          if (isValid) {
            onSave(url, text, isNewTab);
          } else {
            formRef.current.querySelectorAll("input").forEach((input) => {
              if (!input.checkValidity()) {
                input.reportValidity();
              }
            });
          }
        }
      },
      [onSave, url, text, isNewTab],
    );

    React.useImperativeHandle(ref, () => formRef.current as HTMLDivElement);

    return (
      <div ref={formRef}>
        <div className={cn("space-y-4", className)}>
          <div className="space-y-1">
            <Label>網址</Label> {/* URL */}
            <Input
              type="url"
              required
              placeholder="輸入網址"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label>顯示文字（選填）</Label> {/* Display Text (optional) */}
            <Input
              type="text"
              placeholder="輸入顯示文字"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Label>在新標籤頁中開啟</Label> {/* Open in New Tab */}
            <Switch checked={isNewTab} onCheckedChange={setIsNewTab} />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" onClick={handleSave}>
              儲存變更 {/* Save */}
            </Button>
          </div>
        </div>
      </div>
    );
  },
);

LinkEditBlock.displayName = "LinkEditBlock";

export default LinkEditBlock;
