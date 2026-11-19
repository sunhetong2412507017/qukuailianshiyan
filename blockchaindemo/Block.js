const crypto = require("crypto");

/**
 * 区块类：描述区块链中单个区块的数据结构
 */
class Block {
  constructor(index, previousHash, timestamp, data, hash, nonce) {
    this.index = index; // 区块高度（索引）
    this.previousHash = previousHash; // 前一个区块的哈希值
    this.timestamp = timestamp; // 区块生成时间戳（毫秒）
    this.data = data; // 区块承载的数据
    this.hash = hash; // 当前区块的哈希值
    this.nonce = nonce; // 工作量证明的随机数
  }

  /**
   * 计算区块哈希值（SHA-256）
   */
  static calculateHash(index, previousHash, timestamp, data, nonce) {
    return crypto
      .createHash("sha256")
      .update(index + previousHash + timestamp + data + nonce)
      .digest("hex");
  }

  /**
   * 创世区块：全局唯一，固定参数，保证所有节点启动时链完全一致
   */
  static getGenesisBlock() {
    return new Block(
      0,
      "0",
      1508270000000,
      "Genesis Block",
      "000dc75a315c77a1f9c98fb6247d03dd18ac52632d7dc6a9920261d8109b37cf",
      604,
    );
  }
}

module.exports = Block;
