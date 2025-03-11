import { ImageEditBlock } from "../image/image-edit-block";
import { ToolbarButton } from "../toolbar-button";
import { ImageIcon } from "@radix-ui/react-icons";
import type { Editor } from "@tiptap/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import type { toggleVariants } from "@workspace/ui/components/toggle";
import type { VariantProps } from "class-variance-authority";
import { useState } from "react";

interface ImageEditDialogProps extends VariantProps<typeof toggleVariants> {
  editor: Editor;
}

const ImageEditDialog = ({ editor, size, variant }: ImageEditDialogProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ToolbarButton
          isActive={editor.isActive("image")}
          tooltip="圖片" // Image
          aria-label="圖片" // Image
          size={size}
          variant={variant}
        >
          <ImageIcon className="size-5" />
        </ToolbarButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>選擇圖片</DialogTitle> {/* Select image */}
          <DialogDescription className="sr-only">
            從電腦上傳圖片 {/* Upload an image from your computer */}
          </DialogDescription>
        </DialogHeader>
        <ImageEditBlock editor={editor} close={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};

export { ImageEditDialog };
