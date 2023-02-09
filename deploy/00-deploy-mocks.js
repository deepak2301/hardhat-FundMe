//* If the contract doesn't exits, we deploy a minimal version
//* for our local testing
const { network } = require("hardhat")
const {
    developmentChains,
    DECIMALS,
    INTIAL_ANSWER,
} = require("../helper-hardhat-config")
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    if (developmentChains.includes(network.name)) {
        log("Local network detected! Deploying mocks...")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INTIAL_ANSWER],
        })
        log("Mocks deployed!")
        log("---------------------------------------------")
    }
}

//* to only run mocks
module.exports.tags = ["all", "mocks"]

//* to deploy cmd `yarn hardhat deploy --tags mocks`
