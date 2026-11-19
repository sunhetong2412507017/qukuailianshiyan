const messageType = require("./messages-type.js");
const Messages = require("./messages.js");
const Block = require("./Block.js");

console.log("*******************消息类型和消息工厂测试开始*******************");

try {
  // 1. 测试消息类型枚举
  console.log("1. 测试消息类型枚举");
  console.log("   REQUEST_LATEST_BLOCK:", messageType.REQUEST_LATEST_BLOCK);
  console.log("   RECEIVE_LATEST_BLOCK:", messageType.RECEIVE_LATEST_BLOCK);
  console.log(
    "   REQUEST_LATEST_BLOCKCHAIN:",
    messageType.REQUEST_LATEST_BLOCKCHAIN,
  );
  console.log(
    "   RECEIVE_LATEST_BLOCKCHAIN:",
    messageType.RECEIVE_LATEST_BLOCKCHAIN,
  );
  console.log("   HANDSHAKE:", messageType.HANDSHAKE);

  // 2. 测试请求最新区块消息
  console.log("2. 测试请求最新区块消息");
  const requestLatestBlockMsg = Messages.getLatestBlock();
  console.log("   消息对象:", requestLatestBlockMsg);
  console.log(
    "   消息类型是否为 REQUEST_LATEST_BLOCK:",
    requestLatestBlockMsg.type === messageType.REQUEST_LATEST_BLOCK,
  );

  // 3. 测试发送最新区块消息
  console.log("3. 测试发送最新区块消息");
  const testBlock = Block.getGenesisBlock();
  const sendLatestBlockMsg = Messages.sendLatestBlock(testBlock);
  console.log("   消息类型:", sendLatestBlockMsg.type);
  console.log("   是否携带区块数据:", sendLatestBlockMsg.data.index === 0);
  console.log(
    "   数据是否为创世区块:",
    sendLatestBlockMsg.data.hash === testBlock.hash,
  );

  // 4. 测试请求整条区块链消息
  console.log("4. 测试请求整条区块链消息");
  const requestBlockchainMsg = Messages.getBlockchain();
  console.log("   消息对象:", requestBlockchainMsg);
  console.log(
    "   消息类型是否为 REQUEST_LATEST_BLOCKCHAIN:",
    requestBlockchainMsg.type === messageType.REQUEST_LATEST_BLOCKCHAIN,
  );

  // 5. 测试发送整条区块链消息
  console.log("5. 测试发送整条区块链消息");
  const sendBlockchainMsg = Messages.sendBlockchain([testBlock]);
  console.log("   消息类型:", sendBlockchainMsg.type);
  console.log("   是否携带区块链数据:", Array.isArray(sendBlockchainMsg.data));
  console.log("   区块链长度:", sendBlockchainMsg.data.length);

  // 6. 测试握手消息
  console.log("6. 测试握手消息");
  const handshakeMsg = Messages.sendHandshake(2727);
  console.log("   消息对象:", handshakeMsg);
  console.log(
    "   消息类型是否为 HANDSHAKE:",
    handshakeMsg.type === messageType.HANDSHAKE,
  );
  console.log("   携带的端口:", handshakeMsg.data.port);
  console.log(
    "   端口是否正确:",
    handshakeMsg.data.port === 2727,
  );

  console.log("*******************消息类型和消息工厂测试结束*******************");
} catch (err) {
  console.log(err);
}
