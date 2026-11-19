// 消息类型枚举：定义 P2P 网络中节点之间传递的消息种类
const MessageType = {
  REQUEST_LATEST_BLOCK: 0, // 请求最新的区块
  RECEIVE_LATEST_BLOCK: 1, // 收到最新的区块
  REQUEST_LATEST_BLOCKCHAIN: 2, // 请求整条区块链
  RECEIVE_LATEST_BLOCKCHAIN: 3, // 收到整条区块链
  HANDSHAKE: 4, // 握手消息，用于交换监听端口
};

module.exports = MessageType;
