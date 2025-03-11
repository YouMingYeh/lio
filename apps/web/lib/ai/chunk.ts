import { decode, encode } from "gpt-tokenizer";

// for RAG document chunking

interface Options {
  // The size of each chunk.
  chunkSize?: number;
  //   The size of the padding (before and after) each chunk.
  paddingSize?: number;
  //   The metadata to include in each chunk.
  metadata?: string;
}

export function chunkDocument(text: string, options: Options): string[] {
  const tokens = encode(text);
  const chunkSize = options.chunkSize || 1024;
  const paddingSize = options.paddingSize || 128;
  const textLength = text.length;
  const chunks: string[] = [];

  let position = 0;

  while (position < textLength) {
    const start = Math.max(position - paddingSize, 0);
    const end = Math.min(position + chunkSize + paddingSize, textLength);
    const chunk = tokens.slice(start, end);
    chunks.push(decode(chunk));

    position += chunkSize;
  }

  return chunks;
}
