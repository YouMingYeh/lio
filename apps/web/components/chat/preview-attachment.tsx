"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import type { Attachment } from "ai";
import { LoaderIcon } from "lucide-react";
import { Paperclip } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export function PreviewAttachment({
  attachment,
  isUploading = false,
}: {
  attachment: Attachment;
  isUploading?: boolean;
}) {
  const { name, url, contentType } = attachment;
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const isImage = contentType?.startsWith("image");

  return (
    <Tooltip>
      <TooltipTrigger>
        <div
          className="relative flex flex-col gap-2"
          onClick={() => setIsDialogOpen(true)}
        >
          <div className="bg-muted relative flex aspect-video h-16 w-20 cursor-pointer flex-col items-center justify-center rounded-md">
            {contentType ? (
              isImage ? (
                <Image
                  key={url}
                  src={url}
                  alt={name ?? "An image attachment"}
                  className="size-full rounded-md object-cover"
                  fill
                />
              ) : (
                <div className="bg-muted flex h-16 w-20 items-center justify-center rounded-md border">
                  <Paperclip className="text-muted-foreground" />
                </div>
              )
            ) : (
              <div className="bg-muted flex h-16 w-20 items-center justify-center rounded-md border"></div>
            )}

            {isUploading && (
              <div className="absolute animate-spin text-zinc-500">
                <LoaderIcon />
              </div>
            )}
          </div>
          <div className="max-w-16 truncate text-xs text-zinc-500">{name}</div>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        {name}
        <Image
          src={url}
          alt={name ?? "An image attachment"}
          width={200}
          height={200}
          className="w-full rounded-md object-contain"
        />
      </TooltipContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-fit max-w-none">
          <DialogHeader>
            <DialogTitle>{name}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {isImage ? (
              <Image
                src={url}
                alt={name ?? "An image attachment"}
                width={1280}
                height={720}
                className="w-full rounded-md object-contain"
              />
            ) : (
              <div className="bg-muted flex h-[600px] w-full items-center justify-center rounded-md">
                <Paperclip size={96} className="text-muted-foreground" />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Tooltip>
  );
}
