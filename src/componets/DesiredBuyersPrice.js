import React, { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { Modal, Input, Button } from "antd";
import { usePrepareContractWrite, useContractWrite, useWaitForTransaction } from "wagmi";
import { polygon } from "@wagmi/chains";
import ABI from "../abi.json";
import { notification } from 'antd';

// eslint-disable-next-line no-empty-pattern
function DesiredBuyersPrice({ }) {
    const [desiredprice, setdesiredprice] = useState("");
    const [payModal, setPayModal] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);
    const [transactionStatus, setTransactionStatus] = useState(null); // New state to track transaction status
    const [notificationShown, setNotificationShown] = useState(false);



    useEffect(() => {
        const storedInput = localStorage.getItem('yoursInput');
        if (storedInput && parseInt(storedInput, 10) === 0) {
            setShouldRender(true); // Render the component if quality is not 1
        } else {
            setShouldRender(false); // Don't render if quality is 1 or not set
        }
    }, []);


    const { config } = usePrepareContractWrite({
        chainId: polygon.id,
        address: process.env.REACT_APP_CONTRACT_ADDRESS,
        abi: ABI,
        functionName: "desiredPricebybuyer",
        args: [desiredprice],
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
            <div className="DesiredBuyerprice">
                <div className="quickOption" onClick={showPayModal}>
                    <span className="DBP" >Desired Price</span>
                </div>
            </div>
            <Modal
                title="Input your desired price"
                visible={payModal} // You might want to control this visibility based on user interaction
                onOk={() => {
                    write?.();
                }}
                onCancel={hidePayModal}
                okText="Submit"
                cancelText="Cancel"
            >
                <p>The Amount you'll input will be deducted from the total purchase amount:</p>
                <Input
                    type="number"
                    placeholder="PS: After Seller Approval"
                    value={desiredprice}
                    onChange={(e) => setdesiredprice(e.target.value)}
                    style={{ marginBottom: '20px' }}
                />
            </Modal>
        </>
    );
}

export default DesiredBuyersPrice;