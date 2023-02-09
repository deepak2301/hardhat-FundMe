const { assert, expect } = require("chai")
const {
   developments,
   ethers,
   deployments,
   getNamedAccounts,
} = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
!developmentChains.includes(network.name)
   ? describe.skip
   : describe("FundMe", async function () {
        let fundMe
        let deployer
        let mockV3aggregator
        const sendValue = ethers.utils.parseEther("0")
        beforeEach(async function () {
           //deploy our fundMe contract
           //using hardhat-deploy

           //? How to use diffrent accounts for deployer
           //* const accounts = await sthers.getSigners()
           //* const accountZero = sccount []

           deployer = (await getNamedAccounts()).deployer
           await deployments.fixture(["all"])
           fundMe = await ethers.getContract("FundMe", deployer)
           mockV3aggregator = await ethers.getContract(
              "MockV3Aggregator",
              deployer
           )
        })

        describe("constructor", async function () {
           it("sets the aggregator address correctly", async function () {
              const response = await fundMe.getPriceFeed()
              assert.equal(response, mockV3aggregator.address)
           })
        })

        describe("fund", async function () {
           it("Fails if you dont have enough eth", async function () {
              await expect(fundMe.fund(1)).to.be.reverted
           })
        })

        it("updated the amount funded data structure", async function () {
           await fundMe.fund({ value: sendValue })
           const response = await fundMe.getAddressToAmountFunded(deployer)
           assert.equal(response.toString(), sendValue.toString())
        })

        it("adds getFunder to array of getFunder", async function () {
           await fundMe.fund({ value: sendValue })
           const funder = await fundMe.getFunder(0)
           assert.equal(funder, deployer)
        })
        describe("Withdraw ETH", async function () {
           //* first we need to fund contract to test
           beforeEach(async function () {
              await fundMe.fund({ value: sendValue })
           })
           it("Withdraw ETH from a single funder", async function () {
              //*Arrange
              const startingFudMeBalance = await fundMe.provider.getBalance(
                 fundMe.address
              )
              const startingDepeloyerBalance = await fundMe.provider.getBalance(
                 deployer
              )
              //* Act
              const transactionResponse = await fundMe.withdraw()
              const transactionReceipt = await transactionResponse.wait(1)
              const { gasUsed, effectiveGasPrice } = transactionReceipt
              const gasCost = gasUsed.mul(effectiveGasPrice)
              const endingFundMeBalance = await fundMe.provider.getBalance(
                 fundMe.address
              )
              const endingDeployerBalance = await fundMe.provider.getBalance(
                 deployer
              )
              //* Assert
              assert.equal(endingFundMeBalance, 0)
              assert.equal(
                 startingFudMeBalance.add(startingDepeloyerBalance).toString(),
                 endingDeployerBalance.add(gasCost).toString()
              )
           })
           it("allows us to withdraw with multiple accounts", async function () {
              //*Arrange
              const accounts = await ethers.getSigners()
              for (let i = 1; i < 6; i++) {
                 const fundMeconnectedContract = await fundMe.connect(
                    accounts[i]
                 )
                 await fundMeconnectedContract.fund({ value: sendValue })
              }
              const startingFudMeBalance = await fundMe.provider.getBalance(
                 fundMe.address
              )
              const startingDepeloyerBalance = await fundMe.provider.getBalance(
                 deployer
              )
              //* Act
              const transactionResponse = await fundMe.withdraw()
              const transactionReceipt = await transactionResponse.wait(1)
              const { gasUsed, effectiveGasPrice } = transactionReceipt
              const gasCost = gasUsed.mul(effectiveGasPrice)

              const endingFundMeBalance = await fundMe.provider.getBalance(
                 fundMe.address
              )
              const endingDeployerBalance = await fundMe.provider.getBalance(
                 deployer
              )
              //* Assert
              assert.equal(endingFundMeBalance, 0)
              assert.equal(
                 startingFudMeBalance.add(startingDepeloyerBalance).toString(),
                 endingDeployerBalance.add(gasCost).toString()
              )
              //*Make sure that the getFunder are reset properly
              await expect(fundMe.getFunder(0)).to.be.reverted
              for (let i = 1; i < 6; i++) {
                 assert.equal(
                    await fundMe.getAddressToAmountFunded(accounts[i].address),
                    0
                 )
              }
           })

           it("Only Allows the owner to withdraw funds", async function () {
              const accounts = await ethers.getSigners()
              const attacker = accounts[1]
              const attackerConnectedContract = await fundMe.connect(attacker)
              await expect(
                 attackerConnectedContract.withdraw()
              ).to.be.revertedWith("FundMe__NotOwner")
           })
           it("ChaperWithdraw", async function () {
              //*Arrange
              const accounts = await ethers.getSigners()
              for (let i = 1; i < 6; i++) {
                 const fundMeconnectedContract = await fundMe.connect(
                    accounts[i]
                 )
                 await fundMeconnectedContract.fund({ value: sendValue })
              }
              const startingFudMeBalance = await fundMe.provider.getBalance(
                 fundMe.address
              )
              const startingDepeloyerBalance = await fundMe.provider.getBalance(
                 deployer
              )
              //* Act
              const transactionResponse = await fundMe.cheaperWithdraw()
              const transactionReceipt = await transactionResponse.wait(1)
              const { gasUsed, effectiveGasPrice } = transactionReceipt
              const gasCost = gasUsed.mul(effectiveGasPrice)

              const endingFundMeBalance = await fundMe.provider.getBalance(
                 fundMe.address
              )
              const endingDeployerBalance = await fundMe.provider.getBalance(
                 deployer
              )
              //* Assert
              assert.equal(endingFundMeBalance, 0)
              assert.equal(
                 startingFudMeBalance.add(startingDepeloyerBalance).toString(),
                 endingDeployerBalance.add(gasCost).toString()
              )
              //*Make sure that the getFunder are reset properly
              await expect(fundMe.getFunder(0)).to.be.reverted
              for (let i = 1; i < 6; i++) {
                 assert.equal(
                    await fundMe.getAddressToAmountFunded(accounts[i].address),
                    0
                 )
              }
           })
           it("Withdraw ETH from a single funder", async function () {
              //*Arrange
              const startingFudMeBalance = await fundMe.provider.getBalance(
                 fundMe.address
              )
              const startingDepeloyerBalance = await fundMe.provider.getBalance(
                 deployer
              )
              //* Act
              const transactionResponse = await fundMe.cheaperWithdraw()
              const transactionReceipt = await transactionResponse.wait(1)
              const { gasUsed, effectiveGasPrice } = transactionReceipt
              const gasCost = gasUsed.mul(effectiveGasPrice)
              const endingFundMeBalance = await fundMe.provider.getBalance(
                 fundMe.address
              )
              const endingDeployerBalance = await fundMe.provider.getBalance(
                 deployer
              )
              //* Assert
              assert.equal(endingFundMeBalance, 0)
              assert.equal(
                 startingFudMeBalance.add(startingDepeloyerBalance).toString(),
                 endingDeployerBalance.add(gasCost).toString()
              )
           })
        })
     })
