import Upload from "./artifacts/contracts/NegawattIncentiveCurtailment.sol/NegawattIncentiveCurtailment.json";
import { useState, useEffect } from "react";
import { ethers } from "ethers";

import './App.css';
import InputData from './components/InputData';

function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const loadProvider = async () => {
      if (provider) {
        window.ethereum.on("chainChanged", () => {
          window.location.reload();
        });

        window.ethereum.on("accountsChanged", () => {
          window.location.reload();
        });
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        let contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
        setAccount(address);

        const contract = new ethers.Contract(
          contractAddress,
          Upload.abi,
          signer
        );
        console.log()
        //console.log(contract);
        setContract(contract);
        setProvider(provider);
      } else {
        console.error("Metamask is not installed");
      }
    };
    provider && loadProvider();
  }, []);
  return (
    <>
      <InputData contract={contract}></InputData>
      {/* <Display contract={contract} account={account}></Display> */}
    </>
  );
}

export default App;
