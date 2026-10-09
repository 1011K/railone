import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { writeFileSync, mkdirSync } from 'node:fs';

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9222;
const USER_DATA_DIR = join(tmpdir(), 'edge-cdp-profile-' + Date.now());

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('Spawning Edge headless with remote debugging port', PORT);
  const edge = spawn(EDGE_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${USER_DATA_DIR}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    'about:blank'
  ], {
    stdio: 'ignore'
  });

  edge.on('error', (err) => {
    console.error('Failed to start Edge:', err);
  });

  // Wait for DevTools endpoint
  let ready = false;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (res.ok) {
        ready = true;
        break;
      }
    } catch {
      await sleep(300);
    }
  }

  if (!ready) {
    console.error('Edge DevTools endpoint did not become ready');
    edge.kill();
    process.exit(1);
  }

  console.log('Edge DevTools is ready!');

  // Create a target
  const newTabRes = await fetch(`http://127.0.0.1:${PORT}/json/new?http://localhost:3000`, { method: 'PUT' });
  const tabData = await newTabRes.json();
  console.log('Tab created:', tabData.id, tabData.webSocketDebuggerUrl);

  const ws = new WebSocket(tabData.webSocketDebuggerUrl);

  let msgId = 1;
  const pending = new Map();

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pending.has(data.id)) {
      const { resolve, reject } = pending.get(data.id);
      pending.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
    }
  };

  const send = (method, params = {}) => {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  };

  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  console.log('WebSocket connected. Initializing page...');
  await send('Page.enable');
  await send('Runtime.enable');

  // Wait for React app to render
  console.log('Waiting 3s for React hydration...');
  await sleep(3000);

  const viewports = [
    { name: 'galaxy-s24-360x780', width: 360, height: 780, mobile: true },
    { name: 'iphone-se-375x667', width: 375, height: 667, mobile: true },
    { name: 'iphone-16-pro-393x852', width: 393, height: 852, mobile: true },
    { name: 'pixel-8-412x892', width: 412, height: 892, mobile: true },
    { name: 'desktop-1280x800', width: 1280, height: 800, mobile: false }
  ];

  mkdirSync('artifacts/screenshots', { recursive: true });

  for (const vp of viewports) {
    console.log(`Setting viewport: ${vp.name} (${vp.width}x${vp.height})`);
    await send('Emulation.setDeviceMetricsOverride', {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: 2,
      mobile: vp.mobile
    });
    await sleep(800);

    const shot = await send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false
    });

    const filename = `artifacts/screenshots/${vp.name}.png`;
    writeFileSync(filename, Buffer.from(shot.data, 'base64'));
    console.log(`Saved screenshot: ${filename}`);
  }

  // 6. Capture Scrolled View on iPhone 16 Pro (showing full 22-service grid)
  console.log('Capturing scrolled view of 22-service grid...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 393,
    height: 852,
    deviceScaleFactor: 2,
    mobile: true
  });
  await send('Runtime.evaluate', {
    expression: "const el = document.querySelector('.overflow-y-auto'); if (el) el.scrollTop = 350;"
  });
  await sleep(600);
  const scrolledShot = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync('artifacts/screenshots/iphone-16-pro-scrolled-grid.png', Buffer.from(scrolledShot.data, 'base64'));
  console.log('Saved screenshot: artifacts/screenshots/iphone-16-pro-scrolled-grid.png');

  // 7. Capture Dark Mode View
  console.log('Toggling dark mode and capturing...');
  await send('Runtime.evaluate', {
    expression: "document.documentElement.classList.toggle('dark');"
  });
  await sleep(600);
  const darkShot = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync('artifacts/screenshots/iphone-16-pro-dark-mode.png', Buffer.from(darkShot.data, 'base64'));
  console.log('Saved screenshot: artifacts/screenshots/iphone-16-pro-dark-mode.png');

  ws.close();
  edge.kill();
  console.log('Done capturing screenshots!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
