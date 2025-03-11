"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { cn } from "@workspace/ui/lib/utils";
import { motion } from "motion/react";
import { useState } from "react";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  icon?: string;
  iconPosition?: string;
}

interface FAQProps {
  data: FAQItem[];
}

export function FAQ({ data }: FAQProps) {
  const [openItem, setOpenItem] = useState<string | null>(null);

  return (
    <div className="mx-auto w-full max-w-[700px] rounded-lg p-4">
      <div className="mb-4 text-sm text-muted-foreground">常見問題 FAQ</div>

      <Accordion.Root
        type="single"
        collapsible
        value={openItem || ""}
        onValueChange={(value) => setOpenItem(value)}
      >
        {data.map((item) => (
          <Accordion.Item
            value={item.id.toString()}
            key={item.id}
            className="mb-2"
          >
            <Accordion.Header>
              <Accordion.Trigger className="flex w-full items-center justify-start gap-x-4">
                <div
                  className={cn(
                    "relative flex  items-center space-x-2 rounded-xl border border-transparent bg-muted p-2 transition-all duration-300 ",
                    openItem === item.id.toString() &&
                      "border-border shadow-sm",
                  )}
                >
                  {item.icon && (
                    <span
                      className={`absolute -top-1 text-lg ${
                        item.iconPosition === "right" ? "right-0" : "left-0"
                      }`}
                      style={{
                        transform:
                          item.iconPosition === "right"
                            ? "rotate(7deg)"
                            : "rotate(-4deg)",
                      }}
                    >
                      {item.icon}
                    </span>
                  )}
                  <span className="flex-shrink text-wrap break-words text-left pr-4 ">
                    {item.question}
                  </span>
                </div>

                <span className="cursor-pointer  text-lg font-bold text-muted-foreground">
                  {openItem === item.id.toString() ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="#7CB9E8"
                      className="size-6"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm3 10.5a.75.75 0 0 0 0-1.5H9a.75.75 0 0 0 0 1.5h6Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="size-6"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </span>
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content asChild forceMount>
              <motion.div
                initial="collapsed"
                animate={openItem === item.id.toString() ? "open" : "collapsed"}
                variants={{
                  open: { opacity: 1, height: "auto" },
                  collapsed: { opacity: 0, height: 0 },
                }}
                transition={{ duration: 0.4 }}
                className="overflow-hidden w-full"
              >
                <div className="ml-2 md:ml-7 mt-1 rounded-lg p-3 text-foreground flex">
                  <div className="inline-block w-auto rounded-2xl bg-primary px-4 py-2 text-primary-foreground rounded-br-none whitespace-normal break-words">
                    {item.answer}
                  </div>
                </div>
              </motion.div>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </div>
  );
}
