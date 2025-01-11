/** @type import('hardhat/config').HardhatUserConfig */


require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
const ALCHEMY_API_KEY = "HpFPdPnxBkGMK6prza-OldcoygHmptjV";
const PRIVATE_KEY = "e8baf2561ee7fcbaa3afaf9d6b356b70fccde23c03c28cad449874f8de5a36a1";
module.exports = {
  solidity: "0.8.19",

  networks: {
    polygon: {
      url: `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [`${PRIVATE_KEY}`],
    }
  },

  etherscan: {
    apiKey: {
      polygon: "IRNYTHI37GCHA357G34G6XAEUIXWTMN9PJ"
    }
  },
};
