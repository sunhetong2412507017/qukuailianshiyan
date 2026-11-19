# 区块链可视化网站 2.0（qukuailianshiyan2.0）

基于 Node.js 的简易区块链 + P2P 网络 + Vue 3 可视化前端，完整复刻课程演示链路：
从命令行挖矿、多节点同步，到浏览器页面实时展示区块链结构。

## 一、目录结构

```
qukuailianshiyan2.0/
├─ blockchaindemo/            # 后端：区块链核心 + P2P + CLI + REST API
│  ├─ Block.js                # 区块数据结构、哈希计算、创世区块
│  ├─ Blockchain.js           # 链维护、挖矿（PoW）、校验、最长链替换
│  ├─ messages-type.js        # P2P 消息类型枚举
│  ├─ messages.js             # 消息工厂
│  ├─ P2p.js                  # TCP P2P 网络（握手、广播、同步）
│  ├─ cli.js                  # vorpal 命令行 + express API
│  ├─ index.js                # CLI 入口（npm run start）
│  ├─ test-blockchain.js      # 区块链单元测试
│  ├─ test-messages.js        # 消息模块测试
│  ├─ test-p2p.js             # P2P 实例测试
│  └─ demo-node.js            # 演示辅助：等价于 open / api / connect 的批量启动版
├─ frontend/                  # 前端：Vue 3 + Vite
│  ├─ src/BlockList.vue       # 区块链可视化主组件
│  ├─ src/App.vue
│  ├─ src/main.js
│  └─ src/style.css           # 已清空（样式全部写在组件内）
├─ logs/                      # 真实运行日志（生成截图的数据来源）
├─ screenshots/               # 运行结果截图
├─ scripts/                   # 截图辅助脚本（非业务代码）
└─ README.md
```

## 二、后端运行

```bash
cd blockchaindemo
npm install          # 依赖：cors / express / vorpal
npm run start        # 启动 CLI
```

CLI 内置命令：

| 命令 | 说明 |
| --- | --- |
| `help` | 查看全部命令 |
| `blockchain`（`bc`） | 打印当前区块链 |
| `mine <data>`（`m`） | 挖一个新区块并广播 |
| `open <port>`（`o`） | 启动 P2P 监听端口 |
| `api <port>`（`a`） | 启动 REST API（前端数据来源） |
| `connect <host> <port>`（`c`） | 连接其它节点 |
| `peers`（`p`） | 查看已连接节点 |

单元测试：

```bash
node test-blockchain.js
node test-messages.js
node test-p2p.js
```

三组测试均通过，日志见 `logs/`，截图见 `screenshots/01~03`。

### 演示链（demo-chain.json）

`cli.js` 里用 `new Blockchain({ withDemoChain: true })` 启动，因此 `npm run start` 后
会读取 `blockchaindemo/demo-chain.json`，把 3 个预置区块（创世区块 + `wqeqeq` + `asdadsadas`）
按链式校验后接入，页面打开即显示 3 个区块。预置区块是固定时间戳下真实挖出的合法区块，
`Blockchain.isValidNextBlock` 会逐块校验，校验不通过则自动回退为仅创世区块。

- 想回到「只有创世区块」的初始状态：删除 `demo-chain.json`，重启节点；
- 单元测试（`test-blockchain.js` 等）不受影响，仍是仅创世区块的干净环境；
- nonce 与 hash 由 `(index, previousHash, timestamp, data, nonce)` 决定，`timestamp` 取挖矿瞬间的
  毫秒时间，所以**正常挖矿每次结果都不同**；`node reproduce-demo.js` 可复现演示链的 nonce/hash。

### 双节点演示（P2P 同步）

```bash
# 终端 1
cd blockchaindemo && node demo-node.js --p2p 3535 --api 3001
# 终端 2
cd blockchaindemo && node demo-node.js --p2p 3636 --api 3002 --connect 3535
# 挖矿（等价于 CLI 的 mine "..."）
curl -X POST http://localhost:3001/mineBlock -H "Content-Type: application/json" -d "{\"data\":\"wqeqeq\"}"
```

挖矿后两个节点的 `/nodeInfo` 均返回 `blockCount: 3`，后挖的区块会通过 `broadcastLatest`
实时同步到对端，验证了 P2P 广播与最长链替换逻辑。

## 三、前端运行

```bash
cd frontend
npm install          # vue / axios / dayjs / vite
npm run dev          # http://localhost:5173
```

页面能力：

- 顶部显示当前节点 P2P 端口与连接状态；
- 自动扫描 3001/3002 两个 API 端口，列出可用节点及其区块数，点击即可切换数据源；
- 区块卡片按链式顺序渲染：索引、时间、Hash、Prev Hash、Data、Nonce；
- 「刷新区块链」手动拉取，勾选自动刷新后每 2 秒轮询一次。

`npm run build` 已通过，产物在 `frontend/dist`。

## 四、运行结果截图

| 文件 | 内容 |
| --- | --- |
| `screenshots/01-test-blockchain.png` | 区块链单元测试（创世区块、挖矿、链校验） |
| `screenshots/02-test-messages.png` | 消息类型与消息工厂测试 |
| `screenshots/03-test-p2p.png` | P2P 实例创建测试 |
| `screenshots/07-cli-session.png` | `npm run start` 后的 CLI 交互（help / blockchain / mine） |
| `screenshots/08-node-sync.png` | 双节点 API 校验：两个节点区块数一致、peer 已连接 |
| `screenshots/05-frontend-node3535.png` | 前端页面（当前节点 P2P 3535） |
| `screenshots/06-frontend-node3636.png` | 前端页面（切换到节点 P2P 3636，终版效果） |

> 说明：终端类截图由真实 stdout 日志（`logs/*.log`）经 `scripts/build-terminal-shots.js`
> 渲染生成；网页截图由无头浏览器经 `scripts/capture.js`（CDP）实拍。

## 五、已知现象

区块时间显示为 `49765-03-05` 一类年份：后端 `timestamp` 为毫秒（`Date.now()`），
前端 `formateTime` 按秒处理（`timestamp * 1000`），沿用课程原始代码，属于预期内的显示差异，
不影响链结构与同步逻辑。如需正确显示，把 `BlockList.vue` 中改为 `dayjs(timestamp)` 即可。

同一份代码在不同时刻挖矿，nonce 与 hash 必然不同（nonce 是工作量证明计数器，输入包含挖矿时刻），
这不是错误；若要与示范图逐位一致，见 `demo-chain.json` 与 `reproduce-demo.js`。

## 六、改动点清单（相对课程原始代码）

| 文件 | 改动 | 是否影响主流程 |
| --- | --- | --- |
| `Blockchain.js` | 构造函数增加 `options.withDemoChain`，新增 `loadDemoChain()`，逐块校验后接入预置区块 | 不影响，默认关闭 |
| `cli.js` | 第 5 行改为 `new Blockchain({ withDemoChain: true })` | 启动即为 3 个区块 |
| `demo-node.js` | 支持 `--demo` 参数加载演示链 | 仅自动化辅助脚本 |
| `demo-chain.json` | 新增，存放 3 个预置区块 | 删除即恢复创世状态 |
| `reproduce-demo.js` | 新增，固定时间戳复现 nonce/hash | 纯验证脚本 |

