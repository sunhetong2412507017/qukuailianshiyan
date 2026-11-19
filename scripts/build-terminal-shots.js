/**
 * build-terminal-shots.js —— 把真实运行日志渲染成终端风格截图（HTML）
 * 用途：在没有图形终端可截屏的环境下，以真实 stdout 内容生成运行记录图
 */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const renderDir = path.join(root, ".render");
fs.mkdirSync(renderDir, { recursive: true });

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const items = [
  {
    file: "01-test-blockchain.log",
    title: "命令提示符 — node test-blockchain.js",
    cmd: "node test-blockchain.js",
    out: "01-test-blockchain.png",
  },
  {
    file: "02-test-messages.log",
    title: "命令提示符 — node test-messages.js",
    cmd: "node test-messages.js",
    out: "02-test-messages.png",
  },
  {
    file: "03-test-p2p.log",
    title: "命令提示符 — node test-p2p.js",
    cmd: "node test-p2p.js",
    out: "03-test-p2p.png",
  },
  {
    file: "04-cli-demo.log",
    title: "命令提示符 — npm run start",
    cmd: "npm run start",
    out: "07-cli-session.png",
  },
  {
    file: "05-node-sync.log",
    title: "命令提示符 — 双节点同步验证",
    cmd: "",
    out: "08-node-sync.png",
  },
  {
    file: "06-reproduce-demo.log",
    title: "命令提示符 — node reproduce-demo.js",
    cmd: "node reproduce-demo.js",
    out: "09-reproduce-demo.png",
  },
];

const prompt = "D:\\benkenshengxm\\qukuailianshiyan2.0\\blockchaindemo>";

for (const item of items) {
  const logPath = path.join(root, "logs", item.file);
  const body = fs.readFileSync(logPath, "utf8").replace(/\r/g, "").trimEnd();
  const lines = body.split("\n");
  const colored = lines
    .map((line) =>
      line.startsWith("D:\\")
        ? `<span class="path">${esc(line)}</span>`
        : esc(line),
    )
    .join("\n");
  const head = item.cmd
    ? `<span class="path">${esc(prompt)}</span><span class="cmd"> ${esc(item.cmd)}</span>\n`
    : "";
  const html = `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><style>
  html,body{margin:0;background:#eef1f5;}
  body{padding:32px 32px 40px;font-family:Consolas,"Cascadia Mono","Courier New",monospace;}
  .win{width:1080px;margin:0 auto;border-radius:10px;overflow:hidden;
       box-shadow:0 18px 48px rgba(15,23,42,.22);background:#1e1e1e;}
  .bar{height:38px;background:#2d2d2d;display:flex;align-items:center;padding:0 14px;gap:8px;}
  .dot{width:12px;height:12px;border-radius:50%;}
  .title{margin-left:10px;font-size:13px;color:#bdbdbd;font-family:"Segoe UI","Microsoft YaHei",sans-serif;}
  pre{margin:0;padding:18px 22px 26px;color:#d6d6d6;font-size:14.5px;line-height:1.55;
      white-space:pre-wrap;word-break:break-word;}
  .cmd{color:#e8e8e8;}
  .path{color:#4ec9b0;}
</style></head><body>
<div class="win">
  <div class="bar">
    <span class="dot" style="background:#ff5f57"></span>
    <span class="dot" style="background:#febc2e"></span>
    <span class="dot" style="background:#28c840"></span>
    <span class="title">${esc(item.title)}</span>
  </div>
  <pre>${head}${colored}</pre>
</div></body></html>`;
  const outPath = path.join(renderDir, item.file.replace(".log", ".html"));
  fs.writeFileSync(outPath, html, "utf8");
  console.log(outPath);
}
