// @ts-nocheck
import Link from "next/link";
import React, { memo } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

interface MarkdownProps {
  children: string;
  pure?: boolean;
}

const NonMemoizedMarkdown = ({ children, pure = false }: MarkdownProps) => {
  const components: Partial<Components> = {
    code: ({ node, inline, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <pre
          {...props}
          className={`${className} bg-muted relative mt-2 w-full max-w-[80dvw] rounded-lg p-3 text-sm md:max-w-[500px]`}
        >
          <button
            className="bg-background absolute right-2 top-2 rounded-md border p-1 text-xs"
            onClick={() => {
              navigator.clipboard.writeText(children as string);
              toast("複製成功");
            }}
          >
            複製
          </button>
          <div className="overflow-x-scroll">
            <code className={match[1]}>{children}</code>
          </div>
        </pre>
      ) : (
        <code
          className={`${className} bg-muted rounded-md px-1 py-0.5 text-sm`}
          {...props}
        >
          {children}
        </code>
      );
    },

    ol: ({ node, children, ...props }) => (
      <ol className="ml-4 list-outside list-decimal" {...props}>
        {children}
      </ol>
    ),

    li: ({ node, children, ...props }) => (
      <li className="py-1" {...props}>
        {children}
      </li>
    ),

    ul: ({ node, children, ...props }) => (
      <ul className="ml-4 list-outside list-decimal" {...props}>
        {children}
      </ul>
    ),

    strong: ({ node, children, ...props }) => (
      <span className="font-semibold" {...props}>
        {children}
      </span>
    ),
    a: ({ node, children, ...props }) => (
      <Link
        className="text-blue-500 hover:underline"
        target="_blank"
        rel="noreferrer"
        href={props.href as string}
        {...props}
      >
        {children}
      </Link>
    ),

    h1: ({ node, children, ...props }) => (
      <h1 className="mb-2 mt-6 text-3xl font-semibold" {...props}>
        {children}
      </h1>
    ),

    h2: ({ node, children, ...props }) => (
      <h2 className="mb-2 mt-6 text-2xl font-semibold" {...props}>
        {children}
      </h2>
    ),
    h3: ({ node, children, ...props }) => (
      <h3 className="mb-2 mt-6 text-xl font-semibold" {...props}>
        {children}
      </h3>
    ),
    h4: ({ node, children, ...props }) => (
      <h4 className="mb-2 mt-6 text-lg font-semibold" {...props}>
        {children}
      </h4>
    ),
    h5: ({ node, children, ...props }) => (
      <h5 className="mb-2 mt-6 text-base font-semibold" {...props}>
        {children}
      </h5>
    ),
    h6: ({ node, children, ...props }) => (
      <h6 className="mb-2 mt-6 text-sm font-semibold" {...props}>
        {children}
      </h6>
    ),
    softbreak: () => <br />,
  };

  const parsedChildren = children.replace(/<br\s*\/?>/g, "\n");

  return pure ? (
    <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
      {parsedChildren}
    </ReactMarkdown>
  ) : (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkBreaks]}
      components={components}
    >
      {parsedChildren}
    </ReactMarkdown>
  );
};

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);
