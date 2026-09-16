import { parseSpec } from "./spec";

export type WebviewMessage =
  | { type: "render"; spec: Record<string, unknown> }
  | { type: "error"; message: string };

const UPDATE_DELAY_MS = 300;

/**
 * The single place where a document's current text becomes what the preview shows.
 * The preview always reflects the latest parse result: an error banner stays until
 * the document parses again, and the last valid rendering stays visible underneath.
 */
export function toWebviewMessage(text: string): WebviewMessage {
  try {
    return { type: "render", spec: parseSpec(text) };
  } catch (error) {
    return { type: "error", message: error instanceof Error ? error.message : String(error) };
  }
}
