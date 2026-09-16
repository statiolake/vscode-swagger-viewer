import { parse } from "yaml";

export type OpenApiDocument = Record<string, unknown>;

export class SpecError extends Error {
  override name = "SpecError";
}

/**
 * Parses an OpenAPI / Swagger document written in YAML or JSON.
 * YAML is a superset of JSON, so a single parser handles both formats.
 */
export function parseSpec(text: string): OpenApiDocument {
  const value: unknown = parse(text, { prettyErrors: true });
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new SpecError("The document root must be a mapping (object).");
  }
  const doc = value as OpenApiDocument;
  if (typeof doc.openapi !== "string" && typeof doc.swagger !== "string") {
    throw new SpecError('The document has no "openapi" or "swagger" version field.');
  }
  return doc;
}

const YAML_VERSION_KEY = /^["']?(openapi|swagger)["']?\s*:/m;
const JSON_VERSION_KEY = /"(openapi|swagger)"\s*:/;

/**
 * Cheap check used to decide whether the preview commands are offered.
 * It only looks for a version key so that a document stays recognized while
 * it is temporarily unparsable during editing; `parseSpec` does the real validation.
 */
export function declaresOpenApi(text: string): boolean {
  return YAML_VERSION_KEY.test(text) || JSON_VERSION_KEY.test(text);
}
