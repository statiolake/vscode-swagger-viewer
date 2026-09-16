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
