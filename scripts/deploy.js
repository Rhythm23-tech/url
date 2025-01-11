// scripts/deploy.ts

async function main() {

    const [deployer] = await ethers.getSigners();
    const BasicSCM = await ethers.getContractFactory("BasicSCM");
    const basicSCM = await BasicSCM.deploy();

    console.log("FinMarq deployed to:", basicSCM.address);


    /* const TokenAddress = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"; // Fill this with the actual address of the ERC20Token contract
     const spenderAddress = basicSCM.address;
 
     // Get the instance of the ERC20Token contract
     const erc20Token = new ethers.Contract(
         TokenAddress,
         IERC20,
         deployer // Assuming basicSCM is the signer/owner that will interact with the ERC20Token
     );
 
     // Now you can interact with the ERC20Token contract through the erc20Token instance
     // Example: Approving the BasicSCM contract to spend tokens on behalf of the owner
     const amountToApprove = ethers.utils.parseUnits("10000000", 6); // Adjust the amount and decimals as needed
     const approveTx = await erc20Token.approve(spenderAddress, amountToApprove);
 
     await approveTx.wait();
     console.log("Token approval successful");*/
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

