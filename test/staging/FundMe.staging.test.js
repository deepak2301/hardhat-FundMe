const { assert } = require("chai")
const { getNamedAccounts, ethers, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

developmentChains.includes(network.name)
   ? describe.skip
   : describe("FundMe", async function () {
        let fundMe
        let deployer
        const sendValue = ethers.utils.parseEther("0")
        beforeEach(async function () {
           deployer = (await getNamedAccounts()).deployer
           fundMe = await ethers.getContract("FundMe", deployer)
        })

        it("allows people to fund and wthdraw", async function () {
           await fundMe.fund({ value: sendValue })
           await fundMe.withdraw()
           const endingBalance = await fundMe.provider.getBalance(
              fundMe.address
           )
           assert.equal(endingBalance.toString(), ethers.utils.parseEther("0"))
        })
     })
