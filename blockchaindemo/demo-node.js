/**
 * demo-node.js —— 自动化演示辅助脚本
 *
 * 说明：本脚本等价于在 CLI 中依次执行
 *   npm run start
 *   open <p2pPort>
 *   api <apiPort>
 *   connect localhost <peerPort>
 * 目的只是把同样的能力封装成可批量启动的形式，方便一次性拉起多个节点、
 * 自动挖矿并截图，核心逻辑（Blockchain / P2p / REST 接口）与 cli.js 完全一致。
 *
 * 用法：
 *   node demo-node.js --p2p 3535 --api 3001
 *   node demo-node.js --p2p 3636 --api 3002 --connect 3535
 */
const express = require("express");
const cors = require("cors");
const Blockchain = require("./Blockchain");
const P2p = require("./P2p");

// 解析命令行参数
function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 2) {
    const key = argv[i].replace(/^--/, "");
    args[key] = argv[i + 1];
  }
  return args;
}

const args = parseArgs(process.argv);
const p2pPort = Number(args.p2p || 2727);
const apiPort = Number(args.api || 3001);
const connectPort = args.connect ? Number(args.connect) : null;

const blockchain = new Blockchain({ withDemoChain: args.demo === "true" || process.argv.includes("--demo") });
const p2p = new P2p(blockchain);

// 1. 启动 P2P 监听（对应 CLI 的 open 命令）
p2p.startServer(p2pPort);

// 2. 启动 HTTP API（对应 CLI 的 api 命令）
const app = express();
app.use(cors());
app.use(express.json());

app.get("/blocks", (req, res) => {
  res.send(blockchain.blockchain);
});

app.post("/mineBlock", (req, res) => {
  const data = req.body.data;
  if (data == null) {
    res.status(400).send("data parameter is missing.");
    return;
  }
  blockchain.mine(data);
  const newBlock = blockchain.latestBlock;
  p2p.broadcastLatest();
  res.send(newBlock);
});

app.get("/peers", (req, res) => {
  res.send(
    p2p.peers.map((s) => {
      const host = s.peerInfo?.host || s.remoteAddress;
      const port = s.peerInfo?.port || s.remotePort;
      return `${host}:${port}`;
    }),
  );
});

app.get("/nodeInfo", (req, res) => {
  res.send({
    p2pPort: p2p.serverPort,
    apiPort: apiPort,
    blockCount: blockchain.blockchain.length,
  });
});

app.post("/addPeer", (req, res) => {
  p2p.connectToPeer(req.body.peer);
  res.send();
});

app.listen(apiPort, () => {
  console.log(
    `[node p2p:${p2pPort}] api server listening on http://localhost:${apiPort}`,
  );
});

// 3. 连接其它节点（对应 CLI 的 connect 命令）
if (connectPort) {
  setTimeout(() => {
    console.log(`[node p2p:${p2pPort}] connecting to localhost:${connectPort}`);
    p2p.connectToPeer("localhost", connectPort);
  }, 300);
}
