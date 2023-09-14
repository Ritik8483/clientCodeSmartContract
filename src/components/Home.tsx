import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "../utils/constants";

const Home = () => {
  const { ethereum }: any = window;
  const [accountAddress, setAccountAddress] = useState("");
  const [transactionHash, setTransactionHash] = useState<any>("");
  const [transactionsArr, setTransactionsArr] = useState([]);

  console.log("transactionsArr", transactionsArr);
  console.log("transactionHash", transactionHash);

  const connectWallet = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.");
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccountAddress(accounts[0]);
    } catch (error) {
      console.log(error);
      throw new Error("No ethereum object");
    }
  };

  const createEthereumContract = async () => {
    const { ethereum }: any = window;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const transactionsContract = new ethers.Contract(
      contractAddress,
      contractABI,
      signer
    );
    return transactionsContract;
  };

  const sendTransaction = async () => {
    try {
      if (ethereum) {
        const amount = "0.00001";
        const keyword = "final 22";
        const addressTo = "0x0D6C2B675F25Be92B183fbF8a4cB47CF8Bc77587";
        const message = "Hi! final. 22";
        const transactionsContract = await createEthereumContract();
        const parsedAmount = ethers.utils.parseEther(amount);
        const resp = await ethereum.request({
          method: "eth_sendTransaction",
          params: [
            {
              from: accountAddress,
              to: addressTo,
              gas: "0x5208", //2100 GWEI
              value: parsedAmount._hex,
            },
          ],
        });
        const transactionHash = await transactionsContract?.addToBlockChain(
          addressTo,
          parsedAmount,
          message,
          keyword
        );
        const response = await transactionHash.wait();
        setTransactionHash(response?.blockHash);
      } else {
        console.log("No ethereum object");
      }
    } catch (error) {
      console.log(error);
      throw new Error("No ethereum object");
    }
  };

  const getAllTheTransactions = async () => {
    try {
      if (ethereum) {
        const transactionsContract = await createEthereumContract();
        const availableTransactions =
          await transactionsContract.getAllTransactions();
        const structuredTransactions = availableTransactions?.map(
          (transaction: any) => {
            return {
              addressTo: transaction.receiver,
              addressFrom: transaction.sender,
              timestamp: new Date(
                transaction.timestamp.toNumber() * 1000
              ).toLocaleString(),
              message: transaction.message,
              keyword: transaction.keyword,
              amount: parseInt(transaction.amount._hex) / 10 ** 18,
            };
          }
        );
        setTransactionsArr(structuredTransactions);
      } else {
        console.log("Ethereum is not present");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfWalletIsConnect = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.");
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length) {
        getAllTheTransactions();
      } else {
        console.log("No accounts found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfTransactionsExists = async () => {
    try {
      if (ethereum) {
        const transactionsContract = await createEthereumContract();
        const currentTransactionCount =
          await transactionsContract.getTransactionCount();
        console.log("currentTransactionCount", currentTransactionCount);
      }
    } catch (error) {
      console.log(error);

      throw new Error("No ethereum object");
    }
  };

  useEffect(() => {
    checkIfWalletIsConnect();
    checkIfTransactionsExists();
  }, [transactionHash]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        gap: "20px",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <button onClick={connectWallet}>
        {accountAddress ? "Disconnect" : "Connect"} Wallet
      </button>

      {accountAddress && (
        <button onClick={sendTransaction}>Send Transaction</button>
      )}
      {transactionsArr.length && (
        <h5>Total Transactions : {transactionsArr.length - 1}</h5>
      )}
      {transactionsArr.length &&
        transactionsArr?.map((item: any) => {
          return (
            <>
              <div style={{ border: "1px solid black" }}>
                <p>Sender Address : {item.addressFrom}</p>
                <p>Receiver Address : {item.addressTo}</p>
                <p>Amount : {item.amount}</p>
                <p>Message : {item.message}</p>
                <p>Keyword : {item.keyword}</p>
                <p>Timestamp : {item.timestamp}</p>
              </div>
            </>
          );
        })}
    </div>
  );
};

export default Home;
