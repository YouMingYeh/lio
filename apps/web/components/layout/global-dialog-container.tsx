"use client";

import { useGlobalDialog } from "@/hooks/use-global-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";

export function GlobalDialogContainer() {
  const { dialogs } = useGlobalDialog();
  return (
    <>
      {dialogs.map((dialog) => (
        <Dialog
          key={dialog.id}
          open={dialog.open}
          onOpenChange={dialog.onOpenChange}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{dialog.title}</DialogTitle>
              <DialogDescription>{dialog.description}</DialogDescription>
            </DialogHeader>
            {dialog.content}
          </DialogContent>
        </Dialog>
      ))}
    </>
  );
}
