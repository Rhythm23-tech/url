import React, { useState, useEffect } from "react";
import { Modal, Input } from "antd"; // Removed Button as it's not used
import { usePrepareContractWrite, useContractWrite, useWaitForTransaction } from "wagmi";
import { polygon } from "@wagmi/chains";
import ABI from "../abi.json";
import { notification } from 'antd';

function SetProductQuality() {
  const [productQuality, setProductQuality] = useState("");
  const [payModal, setPayModal] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState(null); // New state to track transaction status
  const [notificationShown, setNotificationShown] = useState(false); // Track if the notification has been shown

  const { config } = usePrepareContractWrite({
    chainId: polygon.id,
    address: process.env.REACT_APP_CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "qualityofReceivedProduct",
    args: [productQuality], // Assuming productQuality is a string or number
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
    if (isSuccess && !notificationShown) {
      localStorage.setItem('productQuality', productQuality);
      hidePayModal();
      setTransactionStatus("success");
      openNotification("success", "Transaction Successful!", "Your transaction has been successfully completed.");
      setNotificationShown(true); // Mark notification as shown to prevent duplicates
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
      <div className="productQuality">
        <div className="quickOption" onClick={showPayModal}>
          <span className="Quality" >Set Product Quality</span>
        </div>
      </div>
      <Modal
        title="Set Product Quality"
        visible={payModal}
        onOk={() => {
          write?.();
        }}
        onCancel={hidePayModal}
        okText="Submit"
        cancelText="Cancel"
      >
        <p>Enter the quality score for the product:</p>
        <Input
          type="number"
          placeholder="Enter quality score"
          value={productQuality}
          onChange={(e) => setProductQuality(e.target.value)}
          style={{ marginBottom: '20px' }}
        />
      </Modal>
    </>
  );
}

export default SetProductQuality;