import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("builds the bespoke hat atelier", async () => {
  const [html, source] = await Promise.all([
    readFile(new URL("../dist/index.html", import.meta.url), "utf8"),
    readFile(new URL("../app/showcase.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(html, /<title>Cava Hat Bar/);
  assert.match(html, /assets\/index-/);
  assert.match(source, /Wear/);
  assert.match(source, /Shape yours/);
  assert.match(source, /Cava Signature/);
  assert.match(source, /Request a fitting/);
  assert.match(source, /ebcd0a0e1bb941f69c5f1ca4049e8619/);
  assert.match(source, /getMaterialList/);
  assert.match(source, /createDecal/);
  await access(new URL("../dist/range-made-hero.png", import.meta.url));
});
