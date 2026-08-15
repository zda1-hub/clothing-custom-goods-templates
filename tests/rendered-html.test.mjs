import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("builds the bespoke hat atelier", async () => {
  const [html, source] = await Promise.all([
    readFile(new URL("../dist/index.html", import.meta.url), "utf8"),
    readFile(new URL("../app/showcase.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(html, /<title>Range \/ Made/);
  assert.match(html, /assets\/index-/);
  assert.match(source, /Wear/);
  assert.match(source, /Shape yours/);
  assert.match(source, /The High Desert/);
  assert.match(source, /Request a fitting/);
  await access(new URL("../dist/range-made-hero.png", import.meta.url));
  await access(new URL("../dist/range-made-hat-v2.png", import.meta.url));
});
