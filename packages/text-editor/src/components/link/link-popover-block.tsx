import { ToolbarButton } from "../toolbar-button";
import {
  CopyIcon,
  ExternalLinkIcon,
  LinkBreak2Icon,
} from "@radix-ui/react-icons";
import { Separator } from "@workspace/ui/components/separator";
import * as React from "react";

interface LinkPopoverBlockProps {
  url: string;
  onClear: () => void;
  onEdit: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const LinkPopoverBlock: React.FC<LinkPopoverBlockProps> = ({
  url,
  onClear,
  onEdit,
}) => {
  const [copyTitle, setCopyTitle] = React.useState<string>("複製"); // Copy

  const handleCopy = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      navigator.clipboard
        .writeText(url)
        .then(() => {
          setCopyTitle("已複製！"); // Copied!
          setTimeout(() => setCopyTitle("複製"), 1000); // Copy
        })
        .catch(console.error);
    },
    [url],
  );

  const handleOpenLink = React.useCallback(() => {
    window.open(url, "_blank", "noopener,noreferrer");
  }, [url]);

  return (
    <div className="bg-background flex h-10 overflow-hidden rounded p-2 shadow-lg">
      <div className="inline-flex items-center gap-1">
        <ToolbarButton
          tooltip="編輯連結" // Edit link
          onClick={onEdit}
          className="w-auto px-2"
        >
          編輯連結 {/* Edit link */}
        </ToolbarButton>
        <Separator orientation="vertical" />
        <ToolbarButton
          tooltip="在新標籤頁中開啟連結" // Open link in a new tab
          onClick={handleOpenLink}
        >
          <ExternalLinkIcon className="size-4" />
        </ToolbarButton>
        <Separator orientation="vertical" />
        <ToolbarButton tooltip="移除連結" onClick={onClear}>
          {" "}
          {/* Clear link */}
          <LinkBreak2Icon className="size-4" />
        </ToolbarButton>
        <Separator orientation="vertical" />
        <ToolbarButton
          tooltip={copyTitle}
          onClick={handleCopy}
          tooltipOptions={{
            onPointerDownOutside: (e: Event) => {
              if (e.target === e.currentTarget) e.preventDefault();
            },
          }}
        >
          <CopyIcon className="size-4" />
        </ToolbarButton>
      </div>
    </div>
  );
};
