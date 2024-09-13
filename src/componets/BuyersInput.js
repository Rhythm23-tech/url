import React, { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { Modal, Input, Button } from "antd";
import { usePrepareContractWrite, useContractWrite, useWaitForTransaction } from "wagmi";
import { polygon } from "@wagmi/chains";
import ABI from "../abi.json";
import { notification } from 'antd';

// eslint-disable-next-line no-empty-pattern
function BuyersInput({ }) {
    const [yoursInput, setyoursInput] = useState("");
    const [payModal, setPayModal] = useState(false);
    const [shouldRender, setShouldRender] = useState(false); // State to control rendering
    const [transactionStatus, setTransactionStatus] = useState(null); // New state to track transaction status
    const [notificationShown, setNotificationShown] = useState(false);
    useEffect(() => {
        const storedQuality = localStorage.getItem('productQuality');
        const storedQuantity = localStorage.getItem('Quantity');

        // Check if quality is not 1
        const qualityConditionMet = storedQuality && parseInt(storedQuality, 10) !== 1;
        // Check if quantity is less than 100
        const quantityConditionMet = storedQuantity && parseInt(storedQuantity, 10) < 100;

        // Set shouldRender based on the above conditions
        setShouldRender(qualityConditionMet || quantityConditionMet);
    }, []);


    const { config } = usePrepareContractWrite({
        chainId: polygon.id,
        address: process.env.REACT_APP_CONTRACT_ADDRESS,
        abi: ABI,
        functionName: "giveInput",
        args: [yoursInput],
    });

    const { write, data } = useContractWrite(config);

    const { isSuccess } = useWaitForTransaction({
        hash: data?.hash,
    });

    useEffect(() => {
        if (data?.hash && !isSuccess) {
            setTimeout(() => {
                if (!isSuccess) {
                    setTransactionStatus("failed"); // Infer failure if no success after a delay
                }
            }, 25000); // Adjust delay as needed
        }
    }, [data?.hash, isSuccess]);

    useEffect(() => {
        if (isSuccess) {
            setTransactionStatus("success");
            hidePayModal();
            // Only show the notification if it hasn't been shown yet
            if (!notificationShown) {
                openNotification("success", "Transaction Successful!", "Your transaction has been successfully completed.");
                setNotificationShown(true); // Mark notification as shown to prevent duplicates
            }
        } else if (transactionStatus === "failed" && !notificationShown) {
            openNotification("error", "Transaction Failed", "Your transaction could not be completed. Please try again.");
            setNotificationShown(true); // Mark notification as shown to prevent duplicates
        }
    }, [isSuccess, transactionStatus, notificationShown]);
    const showPayModal = () => {
        setPayModal(true);
    };

    const hidePayModal = () => {
        setPayModal(false);
    };

    if (!shouldRender) {
        return null; // Don't render anything if shouldRender is false
    }

    const openNotification = (type, message, description) => {
        notification[type]({
            message,
            description,
            duration: 2,
        });
    };

    return (
        <>
            <div className="YourInput">
                <div className="quickOption" onClick={showPayModal}>
                    <span className="Inp" >Input</span>
                </div>
            </div>
            <Modal
                title="Give Input"
                visible={payModal} // You might want to control this visibility based on user interaction
                onOk={() => {
                    write?.();
                }}
                onCancel={hidePayModal}
                okText="Submit"
                cancelText="Cancel"
            >
                <p>Based on your input the contract is going to deduct the amount or will hold the payment:</p>
                <Input
                    type="number"
                    placeholder="Enter 0 for amount deduction, else the payment will get hold"
                    value={yoursInput}
                    onChange={(e) => setyoursInput(e.target.value)}
                    style={{ marginBottom: '20px' }}
                />
            </Modal>
        </>
    );
}

export default BuyersInput;