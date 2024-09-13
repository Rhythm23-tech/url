import React, { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { Modal, Input, Button } from "antd";
import { usePrepareContractWrite, useContractWrite, useWaitForTransaction } from "wagmi";
import { polygon } from "@wagmi/chains";
import ABI from "../abi.json";
import { notification } from 'antd';

// eslint-disable-next-line no-empty-pattern
function Quantity({ }) {
  const [Quantity, setQuantity] = useState("0");
  const [payModal, setPayModal] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState(null); // New state to track transaction status
  const [notificationShown, setNotificationShown] = useState(false);


  const { config } = usePrepareContractWrite({
    chainId: polygon.id,
    address: process.env.REACT_APP_CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "quantityarrived",
    args: [Quantity],
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
      }, 20000); // Adjust delay as needed
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
  // Modify the openNotification function to check if a notification has already been shown
  const openNotification = (type, message, description) => {
    notification[type]({
      message,
      description,
      duration: 2,
    });
  };



  return (
    <>
      <div className="quantity">
        <div className="quickOption" onClick={showPayModal}>
          <span className="Qty" >Quantity Arrived</span>
        </div>
      </div>
      <Modal
        title="Quantity Received"
        visible={payModal} // You might want to control this visibility based on user interaction
        onOk={() => {
          write?.();
        }}
        onCancel={hidePayModal}
        okText="Submit"
        cancelText="Cancel"
      >
        <p>Enter the quantity received by you:</p>
        <Input
          type="number"
          placeholder="Enter number"
          value={Quantity}
          onChange={(e) => setQuantity(e.target.value)}
          style={{ marginBottom: '20px' }}
        />
      </Modal>
    </>
  );
}

export default Quantity;