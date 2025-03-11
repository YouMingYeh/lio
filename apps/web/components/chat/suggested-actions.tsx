"use client";

import { Button } from "@workspace/ui/components/button";
import { ChatRequestOptions, CreateMessage, Message } from "ai";
import { motion } from "motion/react";
import { memo } from "react";

interface SuggestedActionsProps {
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  suggestedActions?: Array<{ title: string; action: string; label: string }>;
}

function PureSuggestedActions({
  append,
  suggestedActions,
}: SuggestedActionsProps) {
  return (
    <div className="grid w-full gap-2 sm:grid-cols-2">
      {suggestedActions?.map((suggestedAction, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05 * index }}
          key={`suggested-action-${suggestedAction.title}-${index}`}
          className={index > 1 ? "hidden sm:block" : "block"}
        >
          <Button
            variant="ghost"
            onClick={async () => {
              append({
                role: "user",
                content: suggestedAction.action,
              });
            }}
            className="bg-background h-auto w-full flex-1 items-start justify-start gap-1 rounded-xl border px-4 py-3.5 text-left text-sm sm:flex-col"
          >
            <span className="font-medium">{suggestedAction.title}</span>
            <span className="text-muted-foreground">
              {suggestedAction.label}
            </span>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

export const SuggestedActions = memo(PureSuggestedActions, () => true);
