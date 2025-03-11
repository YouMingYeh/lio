"use client";

import { useGlobalSheet } from "@/hooks/use-global-sheet";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet";
import { Maximize2Icon } from "lucide-react";
import { useState } from "react";

export function GlobalSheetContainer() {
  const { sheets } = useGlobalSheet();
  const [fullScreenKey, setFullScreenKey] = useState<string | null>(null);

  return (
    <>
      {sheets.map((sheet) => (
        <Sheet
          key={sheet.id}
          open={sheet.open}
          onOpenChange={sheet.onOpenChange}
        >
          <Dialog
            open={fullScreenKey === sheet.id}
            onOpenChange={(open) => {
              if (!open) {
                setFullScreenKey(null);
              }
            }}
          >
            <DialogContent className="bg-background h-[85%] w-[90%] max-w-none">
              <DialogTitle className="sr-only">
                {sheet.title ?? "Sheet"}
              </DialogTitle>
              {fullScreenKey === sheet.id && sheet.content}
            </DialogContent>
          </Dialog>
          <SheetContent className="h-dvh max-w-[540px] sm:max-w-[720px]">
            <button
              onClick={() => setFullScreenKey(sheet.id)}
              className="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute right-4 top-12 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none"
            >
              <Maximize2Icon className="h-4 w-4" />
            </button>
            <SheetHeader>
              <SheetTitle>{sheet.title}</SheetTitle>
              <SheetDescription>{sheet.description}</SheetDescription>
            </SheetHeader>
            {fullScreenKey !== sheet.id && sheet.content}
          </SheetContent>
        </Sheet>
      ))}
    </>
  );
}
