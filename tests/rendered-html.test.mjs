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
  assert.match(source, /cava-cowboy-hat\.glb/);
  assert.match(source, /OrbitControls/);
  assert.match(source, /<Decal/);
  assert.doesNotMatch(source, /Sketchfab/);
  assert.doesNotMatch(source, /viewer-monogram|sketchfab-credit/);
  await access(new URL("../dist/range-made-hero.png", import.meta.url));
  await access(new URL("../dist/cava-cowboy-hat.glb", import.meta.url));
});
