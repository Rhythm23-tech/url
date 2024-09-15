import { useState, useEffect } from "react";
import "./App.css";
import logo from "./logo.png";
import { Layout, Button } from "antd";
import RequestAndPay from "./componets/RequestAndPay";
import DeliveryTime from "./componets/DeliveryTime";
import Quantity from "./componets/Quantity";
import SetProductQuality from "./componets/Quality";
import SellersApp from "./componets/SellersApp";
import BuyersInput from "./componets/BuyersInput";
import FirstInstallment from "./componets/FirstInstallment";
import DesiredBuyersPrice from "./componets/DesiredBuyersPrice";
import DesiredSellersPrice from "./componets/DesiredSellersPrice";
import OrderShipped from "./componets/orderShippingConfirmation";
import BuyersApp from "./componets/BuyersApp";
import OrderShip from "./componets/ordershipped";
import OrderReceived from "./componets/orderreceived";
import SecondInstallment from "./componets/SecondInstallment";
import Withdraw from "./componets/Withdraw";
import RecentTransaction from "./componets/RecentTransaction";
import BuyersAddress from "./componets/BuyersAddress";
import SellersAddress from "./componets/SellersAddress";
import DeliveryT from "./componets/DT";
import DeliveryD from "./componets/DD";
import Ouantity from "./componets/QuantityN";
import ResetState from "./componets/ResetState";
import { useConnect, useAccount, useDisconnect } from "wagmi";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import axios from "axios";
import { ethers } from 'ethers';
import ABI from "./abi.json";
import { polygon } from '@wagmi/chains';

const { Header, Content } = Layout;

function App() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect } = useConnect({
    connector: new MetaMaskConnector({
      chains: [polygon],
    }),
  });
  const [contractAddress, setContractAddress] = useState("");
  const [account, setaccount] = useState(0);
  const [state, setstate] = useState({
    provider: null,
    signer: null,
    contract: null,
  })
  const [userRole, setUserRole] = useState('');
  const [Transaction, setTransaction] = useState(null);
  const [transactionData, setTransactionData] = useState([]);


  function disconnectAndSetNull() {
    disconnect();
    setTransaction(null);
  }

  async function fund() {

    const res = await axios.get(`http://82.112.237.120:3001/fund`, {
      params: {
        userAddress: address,
      },
    });
    const response = res.data;
    console.log(response.addTransactionInput);
    const count = response.addTransactionInput;

    console.log(response.Baddress);
    const BuyersAddress = response.Baddress;

    console.log(response.owneradd);
    const OwnerAddress = response.owneradd;

    if (address === BuyersAddress) {
      console.log("Connected wallet is a buyer.");
      setUserRole('onlyBuyer');
    } else if (address === OwnerAddress) {
      console.log("Connected wallet is a Owner.");
      setUserRole('onlyOwner');
    } else {
      console.log("Connected wallet is a Seller.");
      setUserRole('onlySeller');
    }



    const secres = await axios.get(`http://82.112.237.120:3001/history`);
    const secresponse = secres.data;
    const validTransactions = secresponse.filter(transaction => transaction.caller[1] !== '' && transaction.caller[2] !== '');
    // Now map over the filtered array
    const flattenedTransactions = validTransactions.map((transaction) => ({
      key: transaction.key,
      caller: transaction.caller[0],
      functionName: transaction.caller[1],
      Input: transaction.caller[2],
    }));

    setTransactionData(flattenedTransactions);
  }


  useEffect(() => {
    if (!isConnected) return;
    // Assuming 'nos' is a state variable or prop that holds the index you want to pass to the backend
    fund();
  }, [isConnected, address]); // Add 'nos' as a dependency if it changes over time


  useEffect(() => {
    const init = async () => {

      // Assuming you have the contract ABI and address available
      const contractAbi = [ABI]; // Replace with your contract ABI
      const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS; // Replace with your contract address
      setContractAddress(contractAddress);
      // Create a provider and signertry {
      try {
        const { ethereum } = window;

        if (ethereum) {
          const account = await ethereum.request({
            method: "eth_requestAccounts",
          });

          window.ethereum.on("chainChanged", () => {
            window.location.reload();
          });

          window.ethereum.on("accountsChanged", () => {
            window.location.reload();
          });


          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();

          // Create a contract instance
          const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
          setaccount(account);
          setstate({ provider, signer, contractInstance });
          console.log('Updated contract address:', contractAddress); // Debugging log
        } else {
          alert("Please install metamask");
        }
      } catch (error) {
        console.log(error);
      }
    };
    init();
  }, [isConnected, address])

  return (
    <div className="App">
      <Layout>
        <Header className="header">
          <div className="headerLeft">
            <img src={logo} alt="logo" className="logo" />
            {isConnected && (
              <>
                <div className="menuOption" style={{ borderBottom: "1.5px solid black" }}>
                  Summary
                </div>
                <div className="menuOption">Activity</div>
                <div className="menuOption">{`Send & Request`}</div>
                <div className="menuOption">Wallet</div>
                <div className="menuOption">Help</div>
              </>
            )}
          </div>
          {isConnected ? (
            <Button type={"primary"} onClick={disconnectAndSetNull}>
              Disconnect Wallet
            </Button>
          ) : (
            <Button type={"primary"} onClick={connect}>
              Connect Wallet
            </Button>
          )}
        </Header>
        <Content className="content">
          {isConnected && contractAddress && (
            <>
              <p style={{ color: 'white' }}>Connected to Contract: {contractAddress}</p>
              {/* Conditionally render components based on userRole */}
              {userRole === 'onlyBuyer' && (
                <>
                  <RequestAndPay />
                  <DesiredBuyersPrice />
                  <DeliveryTime />
                  <OrderShipped />
                  <OrderReceived />
                  <BuyersInput />
                  <SetProductQuality />
                  <Quantity />
                  <BuyersApp />
                </>
              )}
              {userRole === 'onlySeller' && (
                <>
                  <RequestAndPay />
                  <Withdraw />
                  <SellersApp />
                  < FirstInstallment />
                  < DesiredSellersPrice />
                  <SecondInstallment />
                  <OrderShip />
                </>
              )}
              {userRole === 'onlyOwner' && (
                <>
                  <RequestAndPay />
                  <BuyersAddress />
                  <SellersAddress />
                  <DeliveryT />
                  <DeliveryD />
                  <Ouantity />
                  <ResetState />
                </>
              )}


              <div className="secondColumn">
                <RecentTransaction transactionData={transactionData} />
              </div>
            </>
          )}
          {!isConnected && (
            <div>Please Login</div>
          )}
        </Content>
      </Layout>
    </div>
  );
}


export default App;
