require("@nomiclabs/hardhat-waffle")
require("hardhat-gas-reporter")
require("@nomiclabs/hardhat-etherscan")
require("dotenv").config()
require("solidity-coverage")
require("hardhat-deploy")

/** @type import('hardhat/config').HardhatUserConfig */
const RPC_URL_GOERLI = process.env.RPC_URL_GOERLI
const PRIVATE_KEY = process.env.PRIVATE_KEY
const COINMARKET = process.env.COINMARKET
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY

module.exports = {
   defaultNetwork: "hardhat",
   networks: {
      hardhat: {
         chainId: 31337,
         // gasPrice: 130000000000,
      },
      goerli: {
         url: RPC_URL_GOERLI,
         accounts: [PRIVATE_KEY],
         chainId: 5,
         blockConfirmations: 6,
         gas: 6000000,
      },
   },
   solidity: {
      //* it is used to so we can use diffrent soidity versions in our code
      compilers: [
         {
            version: "0.8.8",
         },
         {
            version: "0.6.6",
         },
      ],
   },
   etherscan: {
      apiKey: ETHERSCAN_API_KEY,
      // customChains: [], // uncomment this line if you are getting a TypeError: customChains is not iterable
   },
   gasReporter: {
      enabled: true,
      currency: "USD",
      outputFile: "gas-report.txt",
      noColors: true,
      coinmarketcap: COINMARKET,
      token: "ETH",
   },
   namedAccounts: {
      deployer: {
         default: 0,
      },
   },
   mocha: {
      timeout: 500000,
   },
}
