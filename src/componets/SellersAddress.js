import React, { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { Modal, Input, Button } from "antd";
import { usePrepareContractWrite, useContractWrite, useWaitForTransaction } from "wagmi";
import { polygon } from "@wagmi/chains";
import ABI from "../abi.json";
import { notification } from 'antd';

// eslint-disable-next-line no-empty-pattern
function SellersAddress({ }) {
    const [Address, setAddress] = useState("");
    const [payModal, setPayModal] = useState(false);
    const [transactionStatus, setTransactionStatus] = useState(null); // New state to track transaction status
    const [notificationShown, setNotificationShown] = useState(false);


    const { config } = usePrepareContractWrite({
        chainId: polygon.id,
        address: process.env.REACT_APP_CONTRACT_ADDRESS,
        abi: ABI,
        functionName: "SellersAddress",
        args: [Address],
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

    const openNotification = (type, message, description) => {
        notification[type]({
            message,
            description,
            duration: 2,
        });
    };

    return (
        <>
            <div className="SellersAdd">
                <div className="quickOption" onClick={showPayModal}>
                    <span className="Sadd" >Sellers Address </span>
                </div>
            </div>
            <Modal
                title="Order Shipped"
                visible={payModal} // You might want to control this visibility based on user interaction
                onOk={() => {
                    write?.();
                }}
                onCancel={hidePayModal}
                okText="Submit"
                cancelText="Cancel"
            >
                <p>Enter Sellers Address:</p>
                <Input
                    type="text"
                    placeholder="Address"
                    value={Address}
                    onChange={(e) => setAddress(e.target.value)}
                    style={{ marginBottom: '20px' }}
                />
            </Modal>
        </>
    );
}

export default SellersAddress;