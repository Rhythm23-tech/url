import React, { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { Modal, Input, Button } from "antd";
import { usePrepareContractWrite, useContractWrite, useWaitForTransaction } from "wagmi";
import { polygon } from "@wagmi/chains";
import ABI from "../abi.json";
import { notification } from 'antd';

// eslint-disable-next-line no-empty-pattern
function DeliveryTime({ }) {
  const [daysForDelivery, setDaysForDelivery] = useState("");
  const [payModal, setPayModal] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState(null); // New state to track transaction status
  const [notificationShown, setNotificationShown] = useState(false);


  const { config } = usePrepareContractWrite({
    chainId: polygon.id,
    address: process.env.REACT_APP_CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "deliveryTime",
    args: [daysForDelivery],
  });

  const { write, data } = useContractWrite(config);

  const { isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

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
      <div className="deliverytime">
        <div className="quickOption" onClick={showPayModal}>
          <span className="Time" >Delivery Time</span>
        </div>
      </div>
      <Modal
        title="Set Delivery Time"
        visible={payModal} // You might want to control this visibility based on user interaction
        onOk={() => {
          write?.();
        }}
        onCancel={hidePayModal}
        okText="Submit"
        cancelText="Cancel"
      >
        <p>Enter the number of days for delivery:</p>
        <Input
          type="number"
          placeholder="Enter number of days"
          value={daysForDelivery}
          onChange={(e) => setDaysForDelivery(e.target.value)}
          style={{ marginBottom: '20px' }}
        />
      </Modal>
    </>
  );
}

export default DeliveryTime;