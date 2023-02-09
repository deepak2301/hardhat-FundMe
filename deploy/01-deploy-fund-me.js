//*async function deployfunc(hre){}

// const { deployments, network } = require("hardhat")

//is same as

//*module.exports = async (hre) => {
// *const { getNamedAccounts, deployment } = hre

//* it is same as hre.getNamedAccounts
//* hre.getdeployments

//*}

//*or

//* It is 👆 same as

//* const helperConfig = require("../helper-hardhat-config") or

//* const networkConfig = helperConfig.networkConfig
const { network } = require("hardhat")
const {
    networkConfig,
    deploymentChains,
    developmentChains,
} = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    //? what happens when we want to change chains?

    /*if chainID is X use address Y
    if chainID is Z use address A 👇*/

    //const ethUsdPriceFeedAddress = networkConfig[chainId][ethUsdPriceFeed]

    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    //* when going for localhost or hardhat network we want to use a mock
    const args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args, //* put pricefeed address
        log: true,
        waitCOnfirmations: network.config.bockConfirmations || 1,
    })

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args)
    }

    log("----------------------------------------------------------------")
}
module.exports.tags = ["all", "fundMe"]
