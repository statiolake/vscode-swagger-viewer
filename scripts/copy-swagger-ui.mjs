import { cpSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const source = dirname(require.resolve("swagger-ui-dist/package.json"));
const destination = join("media", "swagger-ui");

mkdirSync(destination, { recursive: true });
for (const file of ["swagger-ui-bundle.js", "swagger-ui.css", "LICENSE", "NOTICE"]) {
  cpSync(join(source, file), join(destination, file));
}
