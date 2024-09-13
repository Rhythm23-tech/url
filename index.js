const express = require("express");
const app = express();
const port = 3001;
const Moralis = require("moralis").default;
const cors = require("cors");
const ABI = require("./abi.json");
require("dotenv").config({ path: ".env" });

app.use(cors());
app.use(express.json());

const MORALIS_API_KEY = process.env.MORALIS_API_KEY;


function convertArrayToObjects(arr) {
    const dataArray = arr.map((transaction, index) => ({
        key: (arr.length + 1 - index).toString(),
        caller: transaction[0], // Assuming the first element is the caller address
        functionName: transaction[1], // Assuming the second element is the function name
        Input: transaction[2],
    }));

    return dataArray.reverse();
}

app.get("/fund", async (req, res) => {
    const { userAddress } = req.query;

    // Convert the amount to Wei if necessary
    // const amountInWei = web3.utils.toWei(amountInEther.toString(), 'ether');

    const response = await Moralis.EvmApi.utils.runContractFunction({
        chain: "137", // Example chain ID, replace with actual
        address: process.env.Contract_Address, // Use the actual contract address
        functionName: "getAddresstoAmountFunded",
        abi: ABI, // Use the actual ABI
        params: { fundingAddress: userAddress }, // Pass the converted amount in Wei
    });

    // Assuming you want to send back the raw response or a specific field from it
    const jsonResponsefund = response.raw / Math.pow(10, 18);

    console.log("First response:", jsonResponsefund);

    const secresponse = await Moralis.EvmApi.utils.runContractFunction({
        chain: "137", // Example chain ID, replace with actual
        address: process.env.Contract_Address, // Use the actual contract address
        functionName: "getBuyersAddress",
        abi: ABI, // Use the actual ABI
    });

    const jsonResponseBAddress = secresponse.raw;

    console.log("Second response:", jsonResponseBAddress);


    const thirdresponse = await Moralis.EvmApi.utils.runContractFunction({
        chain: "137", // Example chain ID, replace with actual
        address: process.env.Contract_Address, // Use the actual contract address
        functionName: "getOwner",
        abi: ABI, // Use the actual ABI
        // params: {}, // Pass the day as a uint256
    });

    const jsonResponseowneradd = thirdresponse.raw;



    const jsonResponse = {
        fund: jsonResponsefund,
        Baddress: jsonResponseBAddress,
        owneradd: jsonResponseowneradd,
        //addTransactionInput: jsonResponsecount
    }

    return res.json(jsonResponse);


});

app.get("/history", async (req, res) => {
    const countResponse = await Moralis.EvmApi.utils.runContractFunction({
        chain: "137", // Example chain ID, replace with actual
        address: process.env.Contract_Address, // Use the actual contract address
        functionName: "getTransactionCount",
        abi: ABI, // Use the actual ABI
    });

    const transactionCount = countResponse.raw;

    const transactionsPromises = Array.from({ length: transactionCount }).map(async (_, index) => {
        const id = transactionCount - index; // Calculate the correct ID for each transaction
        const transactionResponse = await Moralis.EvmApi.utils.runContractFunction({
            chain: "137", // Example chain ID, replace with actual
            address: process.env.Contract_Address, // Use the actual contract address
            functionName: "getTransaction",
            abi: ABI, // Use the actual ABI
            params: { id: id },

        })
        return transactionResponse.raw;
    });

    const transactionsData = await Promise.all(transactionsPromises);

    const Transactions = convertArrayToObjects(transactionsData);
    return res.json(Transactions);
});



//const transactionsData = await Promise.all(transactionsPromises);

// Reverse the transactions to get the most recent first
//transactionsData.reverse();

//res.json({ Transactions: transactionsData });



Moralis.start({
    apiKey: MORALIS_API_KEY,
}).then(() => {
    app.listen(port, () => {
        console.log(`Listening for API Calls`);
    });
});