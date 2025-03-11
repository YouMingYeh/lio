import { Button } from "@workspace/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import type { Message } from "ai";
import { CopyIcon } from "lucide-react";
import { memo } from "react";
import { toast } from "sonner";
import { useCopyToClipboard } from "usehooks-ts";

export function PureMessageActions({
  message,
  isLoading,
}: {
  chatId: string;
  message: Message;
  isLoading: boolean;
}) {
  const [_, copyToClipboard] = useCopyToClipboard();

  if (isLoading) return null;
  if (message.role === "user") return null;
  if (message.toolInvocations && message.toolInvocations.length > 0)
    return null;

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex flex-row gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="text-muted-foreground h-fit px-2 py-1"
              variant="ghost"
              onClick={async () => {
                await copyToClipboard(message.content as string);
                toast.success("Copied to clipboard!");
              }}
            >
              <CopyIcon size={14} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>複製訊息</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

export const MessageActions = memo(
  PureMessageActions,
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) return false;

    return true;
  },
);
