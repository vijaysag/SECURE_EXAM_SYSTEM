import React, { createContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import ExamPaperRegistry from '../contracts/ExamPaperRegistry.json';

export const BlockchainContext = createContext();

export const BlockchainProvider = ({ children }) => {
    const [account, setAccount] = useState(null);
    const [contract, setContract] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Don't auto-connect - user must click Connect Wallet button
        setLoading(false);

        if (typeof window !== 'undefined' && window.ethereum) {
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', () => window.location.reload());
        }

        return () => {
            if (typeof window !== 'undefined' && window.ethereum) {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            }
        };
    }, []);

    const handleAccountsChanged = async (accounts) => {
        if (accounts.length > 0) {
            const acc = accounts[0];
            setAccount(acc);
            await loadContract(acc);
        } else {
            console.log("No accounts found");
            setAccount(null);
            setContract(null);
            setRole(null);
        }
    };

    const connectWallet = async () => {
        if (typeof window === 'undefined' || !window.ethereum) {
            alert("Please install MetaMask to use this feature!");
            return;
        }

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await provider.send("eth_requestAccounts", []);
            const acc = accounts[0];
            setAccount(acc);

            // Auto-fund new accounts with test ETH
            try {
                await fetch('http://localhost:3002/api/faucet', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ address: acc })
                });
            } catch (e) {
                console.log("Faucet unavailable (backend may be down)");
            }

            await loadContract(acc);
        } catch (error) {
            console.error("Connect failed", error);
        }
    };

    const checkIfWalletIsConnected = async () => {
        if (typeof window === 'undefined' || !window.ethereum) {
            setLoading(false);
            return;
        }

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await provider.send("eth_accounts", []);

            if (accounts.length > 0) {
                const acc = accounts[0];
                setAccount(acc);
                await loadContract(acc);
            }
        } catch (error) {
            console.error("Check wallet failed", error);
        } finally {
            setLoading(false);
        }
    };

    const loadContract = async (acc) => {
        try {
            if (!ExamPaperRegistry.address) {
                console.error("Contract not deployed");
                setLoading(false);
                return;
            }

            if (!window.ethereum) return;
            const provider = new ethers.BrowserProvider(window.ethereum);

            // Check Network (Localhost)
            const network = await provider.getNetwork();
            if (Number(network.chainId) !== 1337 && Number(network.chainId) !== 31337) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: '0x539' }], // 1337 in hex
                    });
                } catch (switchError) {
                    // This error code indicates that the chain has not been added to MetaMask.
                    if (switchError.code === 4902) {
                        // Add Hardhat Network
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [
                                {
                                    chainId: '0x539',
                                    chainName: 'Localhost 8545',
                                    rpcUrls: ['http://localhost:8545'],
                                    nativeCurrency: {
                                        name: 'ETH',
                                        symbol: 'ETH',
                                        decimals: 18,
                                    },
                                },
                            ],
                        });
                    }
                }
            }

            const signer = await provider.getSigner();
            const contractInstance = new ethers.Contract(
                ExamPaperRegistry.address,
                ExamPaperRegistry.abi,
                signer
            );
            setContract(contractInstance);

            // Check Role
            // Enum: None, Setter, Moderator, Printer, Admin
            const roleIndex = await contractInstance.userRoles(acc);
            const roles = ['None', 'Setter', 'Moderator', 'Printer', 'Admin'];
            const roleName = roles[Number(roleIndex)];
            setRole(roleName);

        } catch (error) {
            console.error("Contract load failed", error);
        } finally {
            setLoading(false);
        }
    };

    const signOut = () => {
        setAccount(null);
        setContract(null);
        setRole(null);
    };

    return (
        <BlockchainContext.Provider value={{ account, connectWallet, signOut, contract, role, loading }}>
            {children}
        </BlockchainContext.Provider>
    );
};
