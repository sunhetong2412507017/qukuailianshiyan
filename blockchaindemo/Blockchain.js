const fs = require("fs");
const path = require("path");
const Block = require("./Block");

// 演示链数据文件（预置区块）：文件存在且启用演示模式时才会被加载
const DEMO_CHAIN_FILE = path.join(__dirname, "demo-chain.json");

/**
 * 区块链类：负责链的维护、挖矿、校验与替换
 */
class Blockchain {
  constructor(options = {}) {
    this.blockchain = [Block.getGenesisBlock()]; // 初始化时只包含创世区块
    this.difficulty = 3; // 挖矿难度：哈希值需要以 3 个 0 开头

    // 演示模式：启动时把 demo-chain.json 里的预置区块按顺序接入链
    // 默认关闭，单元测试与普通挖矿流程不受影响
    if (options.withDemoChain) {
      this.loadDemoChain();
    }
  }

  /**
   * 加载演示链：逐块做链式校验，校验通过才入链，保证预置数据本身是合法的
   */
  loadDemoChain() {
    if (!fs.existsSync(DEMO_CHAIN_FILE)) {
      console.log("未找到 demo-chain.json，本次从创世区块开始。");
      return;
    }
    try {
      const preset = JSON.parse(fs.readFileSync(DEMO_CHAIN_FILE, "utf8"));
      preset.forEach((item) => {
        const block = new Block(
          item.index,
          item.previousHash,
          item.timestamp,
          item.data,
          item.hash,
          item.nonce,
        );
        if (!this.isValidNextBlock(block, this.latestBlock)) {
          throw new Error(`预置区块 #${item.index} 未通过链式校验`);
        }
        this.blockchain.push(block);
      });
      console.log(
        `已加载演示链：当前共 ${this.blockchain.length} 个区块（含创世区块，来源 demo-chain.json）`,
      );
    } catch (err) {
      this.blockchain = [Block.getGenesisBlock()]; // 回滚，避免半截数据入链
      console.error(`加载演示链失败，已回退到仅创世区块：${err.message}`);
    }
  }

  // 获取整条链
  get() {
    return this.blockchain;
  }

  // 获取最新区块
  get latestBlock() {
    return this.blockchain[this.blockchain.length - 1];
  }

  // 对外暴露哈希计算能力
  calculateHash(index, previousHash, timestamp, data, nonce) {
    return Block.calculateHash(index, previousHash, timestamp, data, nonce);
  }

  // 判断哈希是否满足难度要求
  isValidHash(hash) {
    const prefix = "0".repeat(this.difficulty);
    return hash.startsWith(prefix);
  }

  // 生成下一个区块（工作量证明：不断调整 nonce 直到哈希满足难度）
  generateNextBlock(data) {
    const nextIndex = this.latestBlock.index + 1;
    const previousHash = this.latestBlock.hash;
    const timestamp = new Date().getTime();
    let nonce = 0;
    let nextHash = this.calculateHash(
      nextIndex,
      previousHash,
      timestamp,
      data,
      nonce,
    );
    while (!this.isValidHash(nextHash)) {
      nonce++;
      nextHash = this.calculateHash(
        nextIndex,
        previousHash,
        timestamp,
        data,
        nonce,
      );
    }
    return new Block(nextIndex, previousHash, timestamp, data, nextHash, nonce);
  }

  // 挖矿：生成新区块并加入链
  mine(data) {
    const newBlock = this.generateNextBlock(data);
    try {
      this.addBlock(newBlock);
    } catch (err) {
      throw err;
    }
  }

  // 添加区块（添加前做一次合法性校验）
  addBlock(newBlock) {
    if (this.isValidNextBlock(newBlock, this.latestBlock)) {
      this.blockchain.push(newBlock);
    } else {
      throw new Error("Invalid block.");
    }
  }

  // 校验"候选区块"是否为"前一个区块"的合法后继
  isValidNextBlock(newBlock, previousBlock) {
    if (previousBlock.index + 1 !== newBlock.index) {
      return false;
    } else if (previousBlock.hash !== newBlock.previousHash) {
      return false;
    } else if (
      newBlock.hash !==
      this.calculateHash(
        newBlock.index,
        newBlock.previousHash,
        newBlock.timestamp,
        newBlock.data,
        newBlock.nonce,
      )
    ) {
      return false;
    } else if (!this.isValidHash(newBlock.hash)) {
      return false;
    }
    return true;
  }

  // 校验整条链是否合法（创世区块固定可信，从索引 1 开始校验）
  isValidChain(chain) {
    const genesisBlock = Block.getGenesisBlock();
    if (JSON.stringify(chain[0]) !== JSON.stringify(genesisBlock)) {
      return false;
    }
    for (let i = 1; i < chain.length; i++) {
      if (!this.isValidNextBlock(chain[i], chain[i - 1])) {
        return false;
      }
    }
    return true;
  }

  // 用网络中最长且合法的链替换本地链
  replaceChain(newChain) {
    if (
      newChain.length > this.blockchain.length &&
      this.isValidChain(newChain)
    ) {
      this.blockchain = JSON.parse(JSON.stringify(newChain));
      console.log("本地区块链已被网络中的最长链替换。");
    } else {
      console.log("收到的区块链不满足替换条件，保留本地区块链。");
    }
  }
}

module.exports = Blockchain;
