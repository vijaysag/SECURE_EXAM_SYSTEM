import React, { useState, useContext } from 'react';
import axios from 'axios';
import { Upload, FileText, ImageIcon, CheckCircle, AlertCircle, Copy, ShieldCheck, Database } from 'lucide-react';
import { BlockchainContext } from '../context/BlockchainContext';

const UploadPaper = () => {
    const { contract, account, connectWallet, role } = useContext(BlockchainContext);
    const [file, setFile] = useState(null);
    const [cover, setCover] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [uploadingToChain, setUploadingToChain] = useState(false);
    const [chainTx, setChainTx] = useState(null);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file || !cover) {
            setError("Please select both a PDF paper and a cover image.");
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);
        setChainTx(null);

        const formData = new FormData();
        formData.append('paper', file);
        formData.append('cover', cover);

        try {
            const response = await axios.post('http://localhost:3002/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResult(response.data);
        } catch (err) {
            setError(err.response?.data?.error || "Upload failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleChainUpload = async () => {
        try {
            setUploadingToChain(true);

            // Use backend to register hash (auto-signed, no MetaMask popup)
            const response = await fetch('http://localhost:3002/api/register-hash', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paperHash: result.paperHash })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            setChainTx(data.txHash);
        } catch (err) {
            console.error(err);
            alert("Blockchain upload failed: " + err.message);
        } finally {
            setUploadingToChain(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold text-white">Upload Examination Paper</h2>
                <p className="text-gray-400">Securely encrypt and embed question papers into digital media.</p>
                {account ? (
                    <div className="text-sm text-emerald-400 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        Connected: {account.slice(0, 6)}...{account.slice(-4)} ({role})
                    </div>
                ) : (
                    <button onClick={connectWallet} className="text-sm text-blue-400 hover:text-blue-300 underline text-left w-fit">
                        Connect Wallet to Registry
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upload Form */}
                <div className="glass-panel p-8 space-y-6">
                    <form onSubmit={handleUpload} className="space-y-6">

                        {/* Paper Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Question Paper (PDF)</label>
                            <div className="relative group">
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => setFile(e.target.files[0])}
                                    className="hidden"
                                    id="paper-upload"
                                />
                                <label
                                    htmlFor="paper-upload"
                                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all
                    ${file ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-blue-400 hover:bg-white/5'}
                  `}
                                >
                                    <FileText className={`mb-2 ${file ? 'text-blue-400' : 'text-gray-500'}`} size={24} />
                                    <span className="text-sm text-gray-400">{file ? file.name : "Choose PDF File"}</span>
                                </label>
                            </div>
                        </div>

                        {/* Cover Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Cover Image (PNG)</label>
                            <div className="relative group">
                                <input
                                    type="file"
                                    accept=".png"
                                    onChange={(e) => setCover(e.target.files[0])}
                                    className="hidden"
                                    id="cover-upload"
                                />
                                <label
                                    htmlFor="cover-upload"
                                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all
                    ${cover ? 'border-purple-500 bg-purple-500/10' : 'border-gray-600 hover:border-purple-400 hover:bg-white/5'}
                  `}
                                >
                                    <ImageIcon className={`mb-2 ${cover ? 'text-purple-400' : 'text-gray-500'}`} size={24} />
                                    <span className="text-sm text-gray-400">{cover ? cover.name : "Choose Cover Image"}</span>
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full flex justify-center items-center gap-2"
                        >
                            {loading ? (
                                <>Processing...</>
                            ) : (
                                <>
                                    <Upload size={18} />
                                    Secure & Upload
                                </>
                            )}
                        </button>
                    </form>

                    {error && (
                        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-200">
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    )}
                </div>

                {/* Results Panel */}
                <div className="glass-panel p-8 space-y-6 flex flex-col justify-center">
                    {!result ? (
                        <div className="text-center text-gray-500 space-y-4">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                                <ShieldCheck size={32} className="opacity-50" />
                            </div>
                            <p>Upload a file to generate secure keys and steganographic media.</p>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in zoom-in duration-300">
                            <div className="flex items-center gap-3 text-emerald-400 bg-emerald-500/10 p-4 rounded-lg border border-emerald-500/20">
                                <CheckCircle size={24} />
                                <h3 className="font-semibold">Encryption Successful!</h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Your Secret Key (SAVE THIS!)</label>
                                    <div className="flex gap-2 mt-1">
                                        <code className="flex-1 bg-black/30 p-3 rounded-lg text-emerald-300 font-mono text-xs break-all border border-emerald-500/30">
                                            {result.secretKey}
                                        </code>
                                        <button className="p-3 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                                            <Copy size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Paper Hash (Blockchain ID)</label>
                                    <code className="block mt-1 bg-black/30 p-3 rounded-lg text-blue-300 font-mono text-xs break-all border border-white/10">
                                        {result.paperHash}
                                    </code>
                                </div>
                            </div>

                            {/* Blockchain Action */}
                            <div className="pt-4 border-t border-white/10">
                                <h4 className="text-sm font-semibold text-gray-300 mb-3">Blockchain Registry</h4>
                                {chainTx ? (
                                    <div className="bg-blue-500/20 text-blue-200 p-3 rounded-lg text-sm break-all border border-blue-500/30">
                                        Tx Hash: {chainTx}
                                    </div>
                                ) : (
                                    <>
                                        <>
                                            {account ? (
                                                <button
                                                    onClick={handleChainUpload}
                                                    disabled={uploadingToChain}
                                                    className="w-full btn-secondary flex justify-center items-center gap-2"
                                                >
                                                    {uploadingToChain ? "Confirming..." : <><Database size={16} /> Register Hash on Chain</>}
                                                </button>
                                            ) : (
                                                <button onClick={connectWallet} className="w-full btn-secondary opacity-50">
                                                    Connect Wallet to Register
                                                </button>
                                            )}
                                        </>
                                    </>
                                )}
                            </div>

                            <div className="pt-4 border-t border-white/10">
                                <h4 className="text-sm font-semibold text-gray-300 mb-3">Generated Stego-Image</h4>
                                <div className="relative aspect-video bg-black/50 rounded-lg overflow-hidden border border-white/10 group">
                                    <img src={`http://localhost:3002${result.stegoUrl}`} alt="Stego" className="w-full h-full object-contain" />
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <a
                                            href={`http://localhost:3002${result.stegoUrl}`}
                                            download
                                            className="btn-secondary text-sm"
                                        >
                                            Download Image
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UploadPaper;
