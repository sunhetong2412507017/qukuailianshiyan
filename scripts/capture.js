/**
 * capture.js —— 通过 Chrome DevTools Protocol 截图
 * 用法：node capture.js <url> <输出路径> [宽] [高] [点击文本]
 * 说明：用于项目验收截图，不属于业务代码。
 */
const fs = require("fs");
const http = require("http");

const [, , url, out, w = "1280", h = "1400", clickText = ""] = process.argv;

function getJSON(path) {
  return new Promise((resolve, reject) => {
    http
      .get({ host: "127.0.0.1", port: 9222, path }, (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on("error", reject);
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const targets = await getJSON("/json/list");
  const page = targets.find((t) => t.type === "page");
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();

  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg.result);
      pending.delete(msg.id);
    }
  };

  const send = (method, params = {}) =>
    new Promise((resolve) => {
      const msgId = ++id;
      pending.set(msgId, resolve);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });

  await new Promise((r) => (ws.onopen = r));

  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", {
    width: Number(w),
    height: Number(h),
    deviceScaleFactor: 2,
    mobile: false,
  });
  await send("Page.navigate", { url });
  await sleep(3500);

  if (clickText) {
    await send("Runtime.evaluate", {
      expression: `(() => {
        const btn = [...document.querySelectorAll('button')].find(b => b.textContent.includes(${JSON.stringify(clickText)}));
        if (btn) { btn.click(); return 'clicked'; }
        return 'not-found';
      })()`,
    });
    await sleep(2000);
  }

  const { data } = await send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
    fromSurface: true,
  });
  fs.writeFileSync(out, Buffer.from(data, "base64"));
  console.log("saved:", out);
  ws.close();
  process.exit(0);
})();
