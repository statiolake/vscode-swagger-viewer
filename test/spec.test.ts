import assert from "node:assert/strict";
import test from "node:test";
import { toWebviewMessage } from "../src/preview-message";
import { parseSpec, SpecError } from "../src/spec";

test("parses an OpenAPI 3 YAML document", () => {
  const doc = parseSpec("openapi: 3.0.0\ninfo:\n  title: Pets\n  version: '1'\npaths: {}\n");
  assert.equal(doc.openapi, "3.0.0");
});

test("parses a Swagger 2 JSON document", () => {
  const doc = parseSpec('{"swagger": "2.0", "info": {"title": "Pets", "version": "1"}, "paths": {}}');
  assert.equal(doc.swagger, "2.0");
});

test("rejects a document without a version field", () => {
  assert.throws(() => parseSpec("name: not an api\n"), SpecError);
});

test("rejects a non-mapping root", () => {
  assert.throws(() => parseSpec("- a\n- b\n"), SpecError);
});

test("reports YAML syntax errors to the preview", () => {
  const message = toWebviewMessage("openapi: 3.0.0\ninfo: [unclosed\n");
  assert.equal(message.type, "error");
});

test("reports a missing version field to the preview", () => {
  assert.deepEqual(toWebviewMessage("name: x\n"), {
    type: "error",
    message: 'The document has no "openapi" or "swagger" version field.'
  });
});
