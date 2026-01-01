import React, { useState, useContext } from 'react';
import axios from 'axios';
import { Upload, Key, FileLock, Download, AlertCircle, ShieldCheck, XCircle, CheckCircle } from 'lucide-react';
import { BlockchainContext } from '../context/BlockchainContext';

const ExtractPaper = () => {
    const { contract } = useContext(BlockchainContext);
    const [file, setFile] = useState(null);
    const [key, setKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [verificationStatus, setVerificationStatus] = useState('idle'); // idle, checking, verified, not_found, error

    const handleVerify = async () => {
        if (!file) return setError("Upload an image first.");

        setError('');
        setVerificationStatus('checking');
        try {
            const buffer = await file.arrayBuffer();
            const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            // Use backend to verify (no wallet required)
            const response = await fetch('http://localhost:3002/api/verify-hash', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paperHash: hashHex })
            });
            const data = await response.json();

            if (data.exists) {
                setVerificationStatus('verified');
            } else {
                setVerificationStatus('not_found');
                axios.post('http://localhost:3002/api/audit/alert', {
                    type: 'INTEGRITY_FAILURE',
                    details: { hash: hashHex, reason: 'Hash not found on blockchain' },
                    severity: 'HIGH'
                }).catch(console.error);
                alert("SECURITY ALERT: This paper's hash does not match the blockchain registry. The administrator has been notified.");
            }
        } catch (e) {
            console.error(e);
            setVerificationStatus('error');
            setError("Verification failed: " + e.message);

            axios.post('http://localhost:3002/api/audit/alert', {
                type: 'VERIFICATION_ERROR',
                details: { error: e.message },
                severity: 'MEDIUM'
            }).catch(console.error);
        }
    };

    const handleExtract = async (e) => {
        e.preventDefault();
        if (!file || !key) {
            setError("Please provide the Stego-Image and the Secret Key.");
            return;
        }

        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('stego', file);
        formData.append('key', key);

        try {
            const response = await axios.post('http://localhost:3002/api/extract', formData, {
                responseType: 'blob' // Important for file download
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `exam-paper-decrypted-${Date.now()}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove(); // Cleanup

        } catch (err) {
            console.error(err);
            setError("Extraction failed. Invalid Key or Corrupted Image.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-white">Extract Examination Paper</h2>
                <p className="text-gray-400">Unlock the hidden question paper using your secure key.</p>
            </div>

            <div className="glass-panel p-8">
                <form onSubmit={handleExtract} className="space-y-8">

                    {/* Image Input */}
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-300">1. Upload Steganographic Image</label>
                        <div className="relative group">
                            <input
                                type="file"
                                accept=".png"
                                onChange={(e) => { setFile(e.target.files[0]); setVerificationStatus('idle'); }}
                                className="hidden"
                                id="stego-upload"
                            />
                            <label
                                htmlFor="stego-upload"
                                className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all
                    ${file ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-blue-400 hover:bg-white/5'}
                  `}
                            >
                                {file ? (
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt="Preview"
                                        className="h-32 object-contain opacity-80"
                                    />
                                ) : (
                                    <>
                                        <FileLock className="mb-3 text-gray-500" size={32} />
                                        <span className="text-sm text-gray-400">Drop Stego-Image Here</span>
                                    </>
                                )}
                            </label>
                        </div>
                        {/* Verification Status */}
                        {file && (
                            <div className="flex flex-col gap-2 bg-white/5 p-3 rounded-lg border border-white/10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <ShieldCheck size={18} className="text-gray-400" />
                                        <span className="text-sm text-gray-300">Blockchain Integrity</span>
                                    </div>

                                    {verificationStatus === 'idle' && (
                                        <button type="button" onClick={handleVerify} className="text-xs btn-secondary py-1 px-3">
                                            Verify Hash
                                        </button>
                                    )}
                                    {verificationStatus === 'checking' && <span className="text-xs text-yellow-400 animate-pulse">Checking...</span>}
                                    {verificationStatus === 'verified' && (
                                        <span className="text-xs text-emerald-400 flex items-center gap-1">
                                            <CheckCircle size={14} /> Verified on Chain
                                        </span>
                                    )}
                                    {verificationStatus === 'not_found' && (
                                        <span className="text-xs text-red-400 flex items-center gap-1">
                                            <XCircle size={14} /> Not Found / Unverified
                                        </span>
                                    )}
                                    {verificationStatus === 'error' && <span className="text-xs text-red-400">Error</span>}
                                </div>
                                <div className="text-[10px] text-gray-600 font-mono text-right">
                                    Contract: {contract ? contract.target : "Connecting..."}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Key Input */}
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-300">2. Enter Decryption Key</label>
                        <div className="relative">
                            <Key className="absolute left-4 top-3.5 text-gray-500" size={20} />
                            <input
                                type="text"
                                value={key}
                                onChange={(e) => setKey(e.target.value)}
                                placeholder="Paste the 64-character hex key here..."
                                className="input-field pl-12 font-mono text-sm"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full py-4 text-lg shadow-xl shadow-blue-900/20"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2 justify-center">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Decrypting & Extracting...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2 justify-center">
                                <Download size={20} />
                                Reveal Exam Paper
                            </span>
                        )}
                    </button>

                    {error && (
                        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-200 animate-in slide-in-from-top-2">
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};


export default ExtractPaper;
