import React, { useState, useEffect } from "react";
import ABI from "../abi.json";
import { message } from "antd"; // Import Ant Design message component for notifications
import { ethers } from 'ethers';

function SecondInstallment() {
    const [transactionHash, setTransactionHash] = useState('');
    const [loading, setLoading] = useState(false);

    const callSecondInstallment = async () => {
        setLoading(true);
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(process.env.REACT_APP_CONTRACT_ADDRESS, ABI, signer);

            // Call the FirstInstallment function
            const transactionResponse = await contract.SecondInstallment();
            setTransactionHash(transactionResponse.hash);
            message.info(`Transaction initiated. Hash: ${transactionResponse.hash}`);

            // Wait for the transaction to be mined
            const receipt = await transactionResponse.wait();
            if (receipt.status === 1) {
                // Transaction was successful
                message.success('Transaction successful!');
            } else {
                // Transaction failed
                message.error('Transaction failed.');
            }
        } catch (error) {
            console.error('Transaction failed:', error);
            message.error('Transaction failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="Secondinstall">
                <button className="quickOption" onClick={callSecondInstallment}>
                    <span className="Secin"> Second Installment</span>
                </button>
            </div>
            {/* Removed Modal and Input components */}
        </>
    );
}
export default SecondInstallment;