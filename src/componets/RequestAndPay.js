/* eslint-disable no-empty-pattern */
import React, { useState } from "react";
import { DollarOutlined } from "@ant-design/icons";
import { Modal, Input, message } from "antd";
import { ethers } from 'ethers';
import ABI from "../abi.json";

function RequestAndPay({ }) {
  const [payModal, setPayModal] = useState(false);
  const [fundingAmount, setFundingAmount] = useState("0"); // Initialize with "0"
  const IERC20 = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function transferFrom(address sender, address recipient, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    " function balanceOf(address account) external view returns (uint256)"
  ];

  const showPayModal = () => setPayModal(true);
  const hidePayModal = () => setPayModal(false);

  const manualSend = async () => {
    if (!window.ethereum) {
      message.error("Please install MetaMask or another Web3 provider.");
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const TokenAddress = process.env.REACT_APP_TOKEN_CONTRACT_ADDRESS;
      const erc20Token = new ethers.Contract(
        TokenAddress,
        IERC20,
        signer
      );

      console.log("Token Address:", process.env.REACT_APP_TOKEN_CONTRACT_ADDRESS);
      console.log("Contract Address:", process.env.REACT_APP_CONTRACT_ADDRESS);

      const amountToApprove = ethers.utils.parseUnits(fundingAmount, 6);
      const approveTx = await erc20Token.approve(process.env.REACT_APP_CONTRACT_ADDRESS, amountToApprove, {
        gasLimit: ethers.utils.hexlify(100000) // Adjust as needed
      });
      console.log("Approval transaction sent:", approveTx.hash);

      await approveTx.wait();
      console.log(`Token approval successful for ${amountToApprove} tokens.`);

      await new Promise(resolve => setTimeout(resolve, 2000));

      const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
      const contract = new ethers.Contract(contractAddress, ABI, signer);

      const currentAllowance = await erc20Token.allowance(process.env.REACT_APP_OWNER_ADDRESS, process.env.REACT_APP_CONTRACT_ADDRESS);
      console.log("Current allowance:", ethers.utils.formatUnits(currentAllowance, 6));

      const amountInSmallestUnit = ethers.utils.parseUnits(fundingAmount, 6);
      const fundTx = await contract.fund(amountInSmallestUnit, {
        gasLimit: ethers.utils.hexlify(100000) // Adjust as needed
      });
      console.log("Funding transaction sent:", fundTx.hash);

      await fundTx.wait();
      console.log(`Funding successful for ${fundingAmount} tokens.`);

      message.success(`Funding transaction completed.`);
      hidePayModal(); // Close modal on success
    } catch (error) {
      console.error("Transaction failed:", error);
      message.error("Transaction failed. Please try again.");
    }
  };

  return (
    <>
      <div className="requestAndPay">
        <DollarOutlined className="custom-dollar-icon" style={{ fontSize: "26px" }} onClick={showPayModal} />

        <div className="quickOption" onClick={showPayModal}>
          <span className="paytext">Pay</span> {/* "Pay" text outside the circle */}
        </div>

      </div>
      <Modal
        title="Confirm Payment"
        visible={payModal}
        onOk={manualSend}
        onCancel={hidePayModal}
        okText="Proceed To Pay"
        cancelText="Cancel"
      >
        <p>Are you sure you want to pay Amount(USD)? This action cannot be undone.</p>
        <Input
          type="text"
          placeholder="Enter amount in USD"
          value={fundingAmount}
          onChange={(e) => setFundingAmount(e.target.value)}
          prefix={<DollarOutlined />}
          style={{ marginBottom: '20px' }}
        />
      </Modal>
    </>
  );
}

export default RequestAndPay;