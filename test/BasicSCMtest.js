let chai;
import('chai').then((chaiModule) => {
    chai = chaiModule;
});
const { ethers } = require("hardhat");

describe("Token Transfer Verification", function () {
    let Token, token, BasicSCM, basicSCM, owner, addr1;

    beforeEach(async function () {
        // Deploy the mock ERC20 token
        Token = await ethers.getContractFactory("BasicSCM"); // Replace "MockERC20" with your ERC20 token contract name if different
        [owner, addr1] = await ethers.getSigners();

        token = await Token.deploy("Mock Token", "MTK", 6, ethers.utils.parseEther("1000000")); // Mock token with 1M supply
        await token.deployed();

        // Deploy your contract
        BasicSCM = await ethers.getContractFactory("BasicSCM");
        basicSCM = await BasicSCM.deploy(/* constructor args if any */);
        await basicSCM.deployed();

        // Transfer some tokens to addr1 for testing
        await token.transfer(addr1.address, ethers.utils.parseEther("100"));

        // Approve the contract to spend tokens on behalf of addr1
        await token.connect(addr1).approve(basicSCM.address, ethers.utils.parseEther("50"));
    });

    it("Should transfer the correct amount of tokens to the contract", async function () {
        const fundAmount = ethers.utils.parseEther("10"); // Amount to fund with

        // Check initial balances
        let initialContractBalance = await token.balanceOf(basicSCM.address);
        expect(initialContractBalance).to.equal(0);

        let initialSenderBalance = await token.balanceOf(addr1.address);
        console.log(`Initial sender balance: ${ethers.utils.formatEther(initialSenderBalance)} tokens`);

        // Call the fund function
        await basicSCM.connect(addr1).fund(fundAmount);

        // Check updated balances
        let finalContractBalance = await token.balanceOf(basicSCM.address);
        let finalSenderBalance = await token.balanceOf(addr1.address);

        console.log(`Final contract balance: ${ethers.utils.formatEther(finalContractBalance)} tokens`);
        console.log(`Final sender balance: ${ethers.utils.formatEther(finalSenderBalance)} tokens`);

        // Verify the contract received the funds
        expect(finalContractBalance).to.equal(fundAmount);
        expect(finalSenderBalance).to.equal(initialSenderBalance.sub(fundAmount));

        // Optionally, verify the contract's internal tracking matches expectations
        // Assuming your contract exposes a way to check the funded amount for an address
        // let fundedAmount = await basicSCM.s_addressToAmountFunded(addr1.address);
        // expect(fundedAmount).to.equal(fundAmount);
    });
});