import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import test from "node:test";

test("product surface contains the three teaching steps", async () => {
  const source = await readFile(new URL("../components/BridgeInspectionApp.tsx", import.meta.url), "utf8");
  assert.match(source, /生成桥梁场景/);
  assert.match(source, /生成巡检航线/);
  assert.match(source, /AI 裂缝检测/);
  assert.match(source, /教学模拟/);
});

test("bridge, four routes and crack datasets are present", async () => {
  const scene = await readFile(new URL("../components/BridgeScene.tsx", import.meta.url), "utf8");
  const data = await readFile(new URL("../lib/teaching-data.ts", import.meta.url), "utf8");
  assert.match(scene, /spanCenters = \[-75, -45, -15, 15, 45, 75\]/);
  assert.equal((data.match(/id: "route-/g) ?? []).length, 4);
  assert.match(data, /const spacing = 2/);
  assert.match(data, /route-underside/);
  assert.equal((data.match(/id: "CR-/g) ?? []).length, 6);
});

test("all local inspection images exist", async () => {
  await Promise.all(Array.from({ length: 6 }, (_, i) => access(new URL(`../public/inspection/crack-${String(i + 1).padStart(3, "0")}.png`, import.meta.url))));
});

test("starter preview metadata has been removed", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(page, /codex-preview|SkeletonPreview/);
});
