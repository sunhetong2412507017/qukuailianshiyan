const messageType = require("./messages-type.js");
const {
  REQUEST_LATEST_BLOCK,
  RECEIVE_LATEST_BLOCK,
  REQUEST_LATEST_BLOCKCHAIN,
  RECEIVE_LATEST_BLOCKCHAIN,
  HANDSHAKE,
} = messageType;

// 消息工厂：统一生成各类消息对象
class Messages {
  // 请求最新区块
  static getLatestBlock() {
    return {
      type: REQUEST_LATEST_BLOCK,
    };
  }

  // 发送最新区块
  static sendLatestBlock(block) {
    return {
      type: RECEIVE_LATEST_BLOCK,
      data: block,
    };
  }

  // 请求整条区块链
  static getBlockchain() {
    return {
      type: REQUEST_LATEST_BLOCKCHAIN,
    };
  }

  // 发送整条区块链
  static sendBlockchain(blockchain) {
    return {
      type: RECEIVE_LATEST_BLOCKCHAIN,
      data: blockchain,
    };
  }

  // 发送握手消息：告知对端本节点的监听端口
  static sendHandshake(port) {
    return {
      type: HANDSHAKE,
      data: { port },
    };
  }
}

module.exports = Messages;
