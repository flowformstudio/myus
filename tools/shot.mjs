#!/usr/bin/env node
// Full-page screenshot at an exact CSS viewport width via headless Chrome + CDP.
// Needed because headless Chrome ignores --window-size below ~500px.
// usage: node tools/shot.mjs <url> <width> <out.png> [deviceScaleFactor]
import { spawn } from "node:child_process";

const [url, widthArg, out, dsfArg] = process.argv.slice(2);
if (!url || !widthArg || !out) { console.error("usage: shot.mjs <url> <width> <out.png> [dsf]"); process.exit(1); }
const width = +widthArg, dsf = +(dsfArg || 1), port = 9222 + Math.floor(Math.random() * 500);
const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ["--headless=new", `--remote-debugging-port=${port}`, "--user-data-dir=/tmp/shot-profile-" + port, "--no-first-run", "--hide-scrollbars", "--window-size=1600,1200", "about:blank"],
  { stdio: "ignore" });
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
try {
  let targets;
  for (let i = 0; i < 50; i++) { try { targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); if (targets.length) break; } catch {} await sleep(200); }
  const ws = new WebSocket(targets[0].webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0; const pending = new Map();
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); } };
  const send = (method, params = {}) => new Promise(res => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
  await send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: dsf, mobile: width < 800 });
  await send("Page.enable");
  await send("Page.navigate", { url });
  await sleep(2500);
  const { cssContentSize } = await send("Page.getLayoutMetrics");
  const height = Math.ceil(cssContentSize.height);
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: dsf, mobile: width < 800 });
  await sleep(800);
  const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true });
  const { writeFileSync } = await import("node:fs");
  writeFileSync(out, Buffer.from(data, "base64"));
  console.log(`${out}: ${width}x${height} css px @${dsf}x`);
  ws.close();
} finally { chrome.kill(); setTimeout(() => process.exit(0), 300); }
