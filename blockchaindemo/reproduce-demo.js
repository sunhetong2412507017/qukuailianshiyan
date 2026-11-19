/**
 * reproduce-demo.js —— 复现示范截图中的三个区块
 *
 * 结论先说：nonce 不是随机数，而是工作量证明的计数器，它的输入包含
 * (index, previousHash, timestamp, data, nonce)；其中 timestamp 是"挖矿那一刻"的毫秒时间。
 * 因此同一份代码在不同时刻挖矿，nonce 与 hash 必然不同 —— 不是代码写错了。
 *
 * 只要把 timestamp 固定成示范图那一刻的值，算出来的 nonce / hash 就能逐位一致。
 * 下面两个 timestamp 由页面显示时间（dayjs(timestamp * 1000)）反推得到。
 *
 * 运行：node reproduce-demo.js
 */
const Block = require("./Block");
const Blockchain = require("./Blockchain");

// 示范图中的挖矿时刻（毫秒）
const PRESET = [
  { timestamp: 1793257768028, data: "wqeqeq" },
  { timestamp: 1793258036547, data: "asdadsadas" },
];

// 示范图中的期望值，用于自动比对
const EXPECTED = [
  {
    index: 0,
    nonce: 604,
    hash: "000dc75a315c77a1f9c98fb6247d03dd18ac52632d7dc6a9920261d8109b37cf",
  },
  {
    index: 1,
    nonce: 2775,
    hash: "000b776d4f2cc94004322ee6b3d73e6a1a4050f4a84a737fd966fed535ef65c4",
  },
  {
    index: 2,
    nonce: 1614,
    hash: "00091ec64451dac6f98d16b20948373de772890443226c6bfa0a9abc64f2a559",
  },
];

const chain = new Blockchain();
const blocks = [chain.latestBlock];

for (const item of PRESET) {
  const prev = blocks[blocks.length - 1];
  const index = prev.index + 1;
  let nonce = 0;
  let hash = Block.calculateHash(
    index,
    prev.hash,
    item.timestamp,
    item.data,
    nonce,
  );
  while (!hash.startsWith("0".repeat(chain.difficulty))) {
    nonce++;
    hash = Block.calculateHash(
      index,
      prev.hash,
      item.timestamp,
      item.data,
      nonce,
    );
  }
  const block = new Block(
    index,
    prev.hash,
    item.timestamp,
    item.data,
    hash,
    nonce,
  );
  if (!chain.isValidNextBlock(block, prev)) {
    throw new Error(`区块 ${index} 复现失败：不满足链式校验`);
  }
  blocks.push(block);
}

console.log("=========== 按固定时间戳复现示范区块 ===========");
let allMatch = true;
blocks.forEach((b) => {
  const exp = EXPECTED[b.index];
  const ok = exp.nonce === b.nonce && exp.hash === b.hash;
  allMatch = allMatch && ok;
  console.log(`区块 #${b.index}`);
  console.log(`  timestamp : ${b.timestamp}  (页面显示 ${new Date(b.timestamp * 1000).toLocaleString("en-GB")})`);
  console.log(`  data      : ${b.data}`);
  console.log(`  nonce     : ${b.nonce}${ok ? "  ✓ 与示范一致" : "  ✗ 不一致"}`);
  console.log(`  hash      : ${b.hash}`);
  console.log(`  prevHash  : ${b.previousHash}`);
  console.log("  ------------------------------------------");
});
console.log(`整链是否合法: ${chain.isValidChain(blocks)}`);
console.log(`与示范图完全一致: ${allMatch}`);
