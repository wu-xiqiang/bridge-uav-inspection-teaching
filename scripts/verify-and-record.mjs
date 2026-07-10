import { chromium } from "playwright-core";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "output");
const screenshots = path.join(output, "screenshots");
const frames = path.join(output, `.video-frames-${process.pid}`);
const url = process.argv[2] || "http://127.0.0.1:3001/";
const edge = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

await rm(screenshots, { recursive: true, force: true });
await mkdir(screenshots, { recursive: true });
await rm(frames, { recursive: true, force: true }).catch(() => undefined);
await mkdir(frames, { recursive: true });

const browser = await chromium.launch({
  executablePath: edge,
  headless: true,
  args: ["--use-angle=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--disable-dev-shm-usage"],
});
const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1, colorScheme: "dark" });
const page = await context.newPage();
const browserErrors = [];
page.on("console", (message) => { if (message.type() === "error") browserErrors.push(message.text()); });
page.on("pageerror", (error) => browserErrors.push(error.message));

await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
await page.locator("canvas").waitFor({ state: "visible", timeout: 15000 });
await page.screenshot({ path: path.join(screenshots, "01-initial.png") });

await page.evaluate(() => {
  const caption = document.createElement("div");
  caption.id = "demo-caption";
  caption.style.cssText = "position:fixed;left:50%;bottom:66px;transform:translateX(-50%);z-index:9999;padding:12px 26px;background:rgba(4,12,16,.88);border:1px solid rgba(32,212,232,.52);color:#e7f7f9;font:600 19px 'Microsoft YaHei UI',sans-serif;letter-spacing:.04em;box-shadow:0 12px 35px rgba(0,0,0,.38);pointer-events:none;white-space:nowrap";
  caption.textContent = "基于低空无人机的桥梁智能巡检教学系统";
  document.body.appendChild(caption);
});

let frameIndex = 0;
let pendingWrites = 0;
const cdp = await context.newCDPSession(page);
cdp.on("Page.screencastFrame", async ({ data, sessionId }) => {
  pendingWrites += 1;
  const current = frameIndex++;
  try {
    await writeFile(path.join(frames, `frame-${String(current).padStart(6, "0")}.jpg`), Buffer.from(data, "base64"));
    await cdp.send("Page.screencastFrameAck", { sessionId });
  } finally {
    pendingWrites -= 1;
  }
});

await cdp.send("Page.startScreencast", { format: "jpeg", quality: 82, maxWidth: 1920, maxHeight: 1080, everyNthFrame: 2 });
const recordStarted = Date.now();

const wait = (ms) => page.waitForTimeout(ms);
const caption = (text) => page.evaluate((value) => { const node = document.querySelector("#demo-caption"); if (node) node.textContent = value; }, text);

await wait(3500);
await caption("步骤一：生成六跨预应力混凝土简支高架桥");
await page.getByTestId("generate-bridge").click();
await wait(2200);
await page.screenshot({ path: path.join(screenshots, "02-bridge-scene.png") });
await caption("鼠标旋转、平移或缩放后，视角会保持在当前位置");
const canvas = page.locator("canvas");
const box = await canvas.boundingBox();
if (box) {
  await page.mouse.move(box.x + box.width * .58, box.y + box.height * .48);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * .43, box.y + box.height * .37, { steps: 36 });
  await page.mouse.up();
  await wait(1200);
  await page.mouse.move(box.x + box.width * .5, box.y + box.height * .5);
  await page.mouse.wheel(0, 1050);
}
await wait(3000);

await caption("步骤二：生成桥面、两侧和桥底四类专项巡检航线");
await page.getByTestId("generate-route").click();
await page.getByTestId("route-deck").waitFor({ state: "visible", timeout: 8000 });
await wait(3300);
await page.screenshot({ path: path.join(screenshots, "03-route-overview.png") });
await caption("航点间隔约 2 米；点击图例或航点查看相机姿态");
await page.getByTestId("route-deck").click();
await page.getByTestId("waypoint-card").waitFor({ state: "visible", timeout: 8000 });
await wait(3200);
await page.screenshot({ path: path.join(screenshots, "04-route-waypoint.png") });
await caption("桥面航线镜头向下，两侧朝桥，桥底镜头向上并折线绕墩");
await page.getByTestId("route-underside").click();
await wait(3500);

await caption("步骤三：AI 自动完成裂缝分割、测量和三维匹配");
await page.getByTestId("ai-detect").click();
await page.getByTestId("detection-progress").waitFor({ state: "visible", timeout: 5000 });
await wait(5200);
await page.getByTestId("crack-results").waitFor({ state: "visible", timeout: 8000 });
await wait(1800);
await page.screenshot({ path: path.join(screenshots, "05-ai-results.png") });

await caption("选择裂缝，三维相机自动定位并显示病害图像");
const crackSix = page.getByTestId("crack-CR-006");
await crackSix.click();
await page.getByTestId("scene-crack-card").waitFor({ state: "visible", timeout: 8000 });
await wait(3800);
await caption("裂缝旁直接显示拍摄图像、分割位置和最大宽度");
const originalTab = page.getByRole("button", { name: "原始图像", exact: true });
if (await originalTab.count() === 1) await originalTab.click();
await wait(2200);
const maskTab = page.getByRole("button", { name: "分割结果", exact: true });
if (await maskTab.count() === 1) await maskTab.click();
await wait(3200);
await page.screenshot({ path: path.join(screenshots, "06-crack-spatial-card.png") });

await caption("返回全桥视角，复核巡检航线与病害分布");
await page.getByRole("button", { name: "重置视角", exact: true }).click();
await wait(2200);
const orbit = page.getByRole("button", { name: "自动旋转", exact: true });
if (await orbit.count() === 1) await orbit.click();
await wait(4800);
await caption("教学模拟系统 · 请结合实际规范开展工程检测");
await wait(4300);

await cdp.send("Page.stopScreencast");
while (pendingWrites > 0) await new Promise((resolve) => setTimeout(resolve, 50));
const elapsedSeconds = (Date.now() - recordStarted) / 1000;
await browser.close();

const pythonPath = process.env.CODEX_PYTHON || "C:\\Users\\Administrator.DESKTOP-APPT7B9\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\python\\python.exe";
const ffmpegProbe = spawnSync(pythonPath, ["-c", `import sys; sys.path.insert(0, r'${path.join(root, ".tools", "python")}'); import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())`], { encoding: "utf8" });
if (ffmpegProbe.status !== 0) throw new Error(ffmpegProbe.stderr || "FFmpeg runtime unavailable");
const ffmpeg = ffmpegProbe.stdout.trim();
const fps = Math.max(1, frameIndex / elapsedSeconds);
const videoPath = path.join(output, "bridge-inspection-demo.mp4");
const encode = spawnSync(ffmpeg, [
  "-y", "-framerate", fps.toFixed(4), "-i", path.join(frames, "frame-%06d.jpg"),
  "-c:v", "libx264", "-preset", "medium", "-crf", "22", "-pix_fmt", "yuv420p",
  "-r", "30", "-movflags", "+faststart", videoPath,
], { encoding: "utf8" });
if (encode.status !== 0) throw new Error(encode.stderr || "Video encoding failed");

await writeFile(path.join(output, "verification.json"), JSON.stringify({
  url,
  title: "基于低空无人机的桥梁智能巡检教学系统",
  viewport: "1920x1080",
  frames: frameIndex,
  durationSeconds: Number(elapsedSeconds.toFixed(2)),
  video: videoPath,
  consoleErrors: browserErrors,
}, null, 2));
await rm(frames, { recursive: true, force: true }).catch(() => undefined);

console.log(JSON.stringify({ videoPath, frames: frameIndex, durationSeconds: Number(elapsedSeconds.toFixed(2)), browserErrors }, null, 2));
