const Blockchain = require("./Blockchain");
const Block = require("./Block");

console.log("=================Blockchain 文件测试开始=================");

try {
  const blockchain = new Blockchain();

  // 1. 测试创世区块
  console.log("1. 测试创世区块");
  console.log("--创世区块的索引:", blockchain.get()[0].index);
  console.log("--创世区块的前一个哈希:", blockchain.get()[0].previousHash);
  console.log("--创世区块的数据:", blockchain.get()[0].data);
  console.log("--创世区块的哈希:", blockchain.get()[0].hash);
  console.log("--创世区块的 nonce:", blockchain.get()[0].nonce);
  console.log("--创世区块的时间:", new Date(blockchain.get()[0].timestamp).toLocaleString("zh-CN"));
  console.log("");

  // 2. 测试区块链初始化状态
  console.log("2. 测试区块链初始化状态");
  console.log("--当前链长度:", blockchain.get().length);
  console.log("--当前难度:", blockchain.difficulty);
  console.log("--最新区块索引:", blockchain.latestBlock.index);
  console.log("");

  // 3. 测试哈希计算
  console.log("3. 测试哈希计算");
  const testHash = blockchain.calculateHash(0, "0", 1234567890, "测试", 0);
  console.log("-- 计算的哈希值:", testHash);
  console.log("-- 哈希长度:", testHash.length, "字符");
  console.log("-- 哈希计算正常");
  console.log("");

  // 4. 测试区块合法性校验
  console.log("4. 测试区块合法性校验");
  console.log("-- 链是否合法:", blockchain.isValidChain(blockchain.get()));
  console.log("-- 创世区块是否满足难度:", blockchain.isValidHash(blockchain.get()[0].hash));
  console.log("");

  // 5. 测试挖一个区块，也是挖矿
  console.log("5. 测试挖一个区块，也是挖矿");
  console.time("挖矿耗时");
  blockchain.mine("一个区块");
  console.timeEnd("挖矿耗时");
  console.log("-- 新区块的索引:", blockchain.latestBlock.index);
  console.log("-- 新区块的哈希值:", blockchain.latestBlock.hash);
  console.log("-- 新区块的数据:", blockchain.latestBlock.data);
  console.log("-- 新区块的 nonce:", blockchain.latestBlock.nonce);
  console.log("-- 当前区块的长度:", blockchain.get().length);
  console.log("");

  // 6. 测试显示完整的区块链
  console.log("6. 测试显示完整的区块链");
  blockchain.get().forEach((block, index) => {
    console.log(`  区块 #${index}`);
    console.log(`  索引: ${block.index}`);
    console.log(`  前一个哈希: ${block.previousHash}`);
    console.log(`  时间戳: ${block.timestamp}`);
    console.log(`  数据: ${block.data}`);
    console.log(`  哈希值: ${block.hash}`);
    console.log(`  nonce: ${block.nonce}`);
    console.log("  时间:", new Date(block.timestamp).toLocaleString("zh-CN"));
    console.log("  --------------------");
  });

  // 7. 区块验证
  console.log("7. 区块验证");
  const block0 = blockchain.get()[0];
  const block1 = blockchain.get()[1];
  const isNextBlockValid = blockchain.isValidNextBlock(block1, block0);
  console.log(`  新区块 ${block1.index} 是否有效: ${isNextBlockValid}`);
} catch (err) {
  console.log(err);
}
