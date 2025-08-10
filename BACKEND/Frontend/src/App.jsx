import React, {useState, useEffect} from 'react';
import {ethers} from 'ethers' ;
// Paste ABI after you compile or use hardcoded minimal ABI for used functions
const ABI = [
    "function initiateCeal(address_responder) returns (unit 256)",
    "function deposit(uint256 _dealId) payable",
    "function confirmCompletion(uint256 _dealId)",
    "function cancelDeal(uint256 _dealId)",
    "event DealInitiated(uint256 indexed dealId, address indexed requester, address indexed responder)",
    "event DepositMade(uint256 indexed dealId, address indexed depositor, uint256 amount)",
    "event DealCompleted(uint256 indexed dealId)",
    "event DealCancelled(uint256 indexed dealId, address canceller, uint256 refund, uint256 reward, uint256 escrowFee)"

];

export default function App() {
    const [provider, setProvider] =  useState(null);
    const [signer, setSigner] = useStat(null);
    const [account, setAccount] = useState(null);
    const [contractAddress, setContractAdddress] = useState('');
    const [contract, setContract] = useState(null);
    const [responder, setResponder] = useState('');
    const [dealId, setDealId] = useState('');
    const [depositValue, setDepositValue] = useState('0.01');
    
    useEffect(() => {
        if (window.ethereum) {
            const prov = new ethers.BrowserProvider(window.ethereum);
            setProvider(prov);
        }
    }, []);
    async function connectWallet() {
        if (!window.ethereum) {
            alert("Please install MetaMask!");
          return;
        }
        try {
          await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0xA869' }] }); // Fuji testnet
          const accounts = await provider.send("eth_requestAccounts", []);
          setAccount(accounts[0]);
          const signerInstance = await provider.getSigner();
          setSigner(signerInstance);
        } catch (err) {
          console.error(err);
          alert("Could not connect wallet or switch to Avalanche Fuji testnet.");
        }
      }
    
      function loadContract() {
        if (!signer || !contractAddress) {
          alert("Please connect wallet and enter contract address");
          return;
        }
        const contractInstance = new ethers.Contract(contractAddress, ABI, signer);
        setContract(contractInstance);
      }
    
      async function initiateDeal() {
        if (!contract || !responder) return alert("Contract or responder not set");
        try {
          const tx = await contract.initiateDeal(responder);
          const receipt = await tx.wait();
          console.log("Deal initiated:", receipt);
          alert("Deal initiated successfully!");
        } catch (err) {
          console.error(err);
        }
      }
    
      async function deposit() {
        if (!contract || !dealId) return alert("Contract or dealId not set");
        try {
          const tx = await contract.deposit(dealId, { value: ethers.parseEther(depositValue) });
          await tx.wait();
          alert("Deposit successful!");
        } catch (err) {
          console.error(err);
        }
      }
    
      async function confirmCompletion() {
        if (!contract || !dealId) return alert("Contract or dealId not set");
        try {
          const tx = await contract.confirmCompletion(dealId);
          await tx.wait();
          alert("Deal completed!");
        } catch (err) {
          console.error(err);
        }
      }
    
      async function cancelDeal() {
        if (!contract || !dealId) return alert("Contract or dealId not set");
        try {
          const tx = await contract.cancelDeal(dealId);
          await tx.wait();
          alert("Deal cancelled!");
        } catch (err) {
          console.error(err);
        }
      }
    
      return (
        <div style={{ padding: "20px" }}>
          <h2>Escrow Deal DApp (Avalanche Fuji)</h2>
          <button onClick={connectWallet}>Connect Wallet</button>
          {account && <p>Connected: {account}</p>}
    
          <input
            placeholder="Contract Address"
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
          />
          <button onClick={loadContract}>Load Contract</button>
    
          <h3>Initiate Deal</h3>
          <input
            placeholder="Responder Address"
            value={responder}
            onChange={(e) => setResponder(e.target.value)}
          />
          <button onClick={initiateDeal}>Initiate</button>
    
          <h3>Deposit</h3>
          <input
            placeholder="Deal ID"
            value={dealId}
            onChange={(e) => setDealId(e.target.value)}
          />
          <input
            placeholder="Deposit Value (ETH)"
            value={depositValue}
            onChange={(e) => setDepositValue(e.target.value)}
          />
          <button onClick={deposit}>Deposit</button>
    
          <h3>Confirm Completion</h3>
          <input
            placeholder="Deal ID"
            value={dealId}
            onChange={(e) => setDealId(e.target.value)}
          />
          <button onClick={confirmCompletion}>Confirm Completion</button>
    
          <h3>Cancel Deal</h3>
          <input
            placeholder="Deal ID"
            value={dealId}
            onChange={(e) => setDealId(e.target.value)}
          />
          <button onClick={cancelDeal}>Cancel</button>
        </div>
      );
    }

