"use client";

import { DialogTitle } from "@radix-ui/react-dialog";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import Image, { type ImageProps } from "next/image";
import { useState } from "react";

interface ZoomableImageProps extends ImageProps {
  zoomedSrc?: string;
  zoomedAlt?: string;
}

export function ZoomableImage({
  src,
  alt,
  zoomedSrc,
  zoomedAlt,
  width,
  height,
  ...props
}: ZoomableImageProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Image
          src={src || "/placeholder.svg"}
          alt={alt}
          width={width}
          height={height}
          className="cursor-zoom-in transition-all hover:scale-105"
          {...props}
        />
      </DialogTrigger>
      <DialogContent
        className="h-full max-h-[80svh] w-full overflow-auto rounded border-none bg-transparent p-0 shadow-none"
        isCloseHidden
      >
        <DialogTitle className="sr-only">Zoomed Image</DialogTitle>
        <div className="relative h-full w-full">
          <Image
            src={zoomedSrc || src}
            alt={zoomedAlt || alt}
            fill
            className="h-full w-full overflow-auto object-contain"
            onClick={() => setIsOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
