import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User, Key, HelpCircle, ArrowRight } from 'lucide-react';
import axios from 'axios';

const Login = () => {
    const navigate = useNavigate();
    const [isRegistering, setIsRegistering] = useState(false);

    // Login State
    const [loginStep, setLoginStep] = useState('credentials'); // credentials, mfa
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [mfaQuestion, setMfaQuestion] = useState('');
    const [mfaAnswer, setMfaAnswer] = useState('');

    // Register State
    const [regRole, setRegRole] = useState('setter');
    const [regQuestions, setRegQuestions] = useState([
        { q: "What is your pet's name?", a: "" },
        { q: "What city were you born in?", a: "" },
        { q: "What is your favorite food?", a: "" }
    ]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLoginInit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await axios.post('http://localhost:3002/api/login/init', { userId, password });
            if (res.data.step === 'mfa_required') {
                setMfaQuestion(res.data.question);
                setLoginStep('mfa');
            }
        } catch (err) {
            setError(err.response?.data?.error || "Login failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleMfaVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await axios.post('http://localhost:3002/api/login/verify', { userId, answer: mfaAnswer });
            if (res.data.success) {
                localStorage.setItem('userRole', res.data.role);
                localStorage.setItem('userId', userId);
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.error || "MFA Verification Failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validate
        if (regQuestions.some(q => !q.a.trim())) {
            setError("Please answer all security questions.");
            setLoading(false);
            return;
        }

        try {
            await axios.post('http://localhost:3002/api/register', {
                userId,
                password,
                role: regRole,
                questions: regQuestions
            });
            setIsRegistering(false);
            setError('');
            alert("Registration Successful! Please Login.");
            setPassword('');
        } catch (err) {
            setError(err.response?.data?.error || "Registration Failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]" />
            </div>

            <div className="glass-panel p-8 w-full max-w-md z-10 relative">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
                        <Shield className="text-white" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-white">SecureExam Portal</h1>
                    <p className="text-gray-400">
                        {isRegistering ? "Create Secure Account" : "Multi-Factor Authentication"}
                    </p>
                </div>

                {!isRegistering ? (
                    // LOGIN FLOW
                    <>
                        {loginStep === 'credentials' ? (
                            <form onSubmit={handleLoginInit} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">User ID</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-3.5 text-gray-500" size={18} />
                                            <input
                                                type="text"
                                                value={userId}
                                                onChange={e => setUserId(e.target.value)}
                                                className="input-field pl-12"
                                                placeholder="Enter User ID"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-3.5 text-gray-500" size={18} />
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={e => setPassword(e.target.value)}
                                                className="input-field pl-12"
                                                placeholder="••••••••"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                                <button type="submit" className="btn-primary w-full py-3 flex items-center justify-center gap-2" disabled={loading}>
                                    {loading ? "Verifying..." : <>Proceed to Security Check <ArrowRight size={18} /></>}
                                </button>
                            </form>
                        ) : (
                            // MFA FLOW
                            <form onSubmit={handleMfaVerify} className="space-y-6 animate-in fade-in slide-in-from-right-8">
                                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
                                    <h3 className="text-blue-400 text-sm font-semibold mb-1">Security Question</h3>
                                    <p className="text-white text-lg">{mfaQuestion}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Your Answer</label>
                                    <input
                                        type="text"
                                        value={mfaAnswer}
                                        onChange={e => setMfaAnswer(e.target.value)}
                                        className="input-field"
                                        placeholder="Type your answer..."
                                        required
                                        autoFocus
                                    />
                                </div>
                                <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
                                    {loading ? "Authenticating..." : "Verify & Login"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setLoginStep('credentials')}
                                    className="text-sm text-gray-500 hover:text-white w-full text-center"
                                >
                                    Back to Login
                                </button>
                            </form>
                        )}

                        <div className="mt-6 pt-6 border-t border-white/10 text-center">
                            <p className="text-gray-400 text-sm">
                                New User? <button onClick={() => setIsRegistering(true)} className="text-blue-400 hover:text-blue-300 font-medium ml-1">Register Now</button>
                            </p>
                        </div>
                    </>
                ) : (
                    // REGISTER FLOW
                    <form onSubmit={handleRegister} className="space-y-6">
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                {['setter', 'moderator', 'printer', 'admin'].map((r) => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => setRegRole(r)}
                                        className={`p-2 rounded-lg border capitalize text-xs font-medium transition-all
                                            ${regRole === r ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-gray-400'}
                                        `}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">User ID</label>
                                <input value={userId} onChange={e => setUserId(e.target.value)} className="input-field" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Password</label>
                                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field" required />
                            </div>

                            <div className="space-y-4 pt-4 border-t border-white/10">
                                <h4 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                                    <Key size={16} /> Set Security Questions
                                </h4>
                                {regQuestions.map((q, idx) => (
                                    <div key={idx} className="space-y-1">
                                        <label className="text-xs text-gray-400">{q.q}</label>
                                        <input
                                            type="text"
                                            className="input-field py-2 text-sm"
                                            placeholder="Answer..."
                                            value={q.a}
                                            onChange={(e) => {
                                                const newQ = [...regQuestions];
                                                newQ[idx].a = e.target.value;
                                                setRegQuestions(newQ);
                                            }}
                                            required
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
                            {loading ? "Creating Account..." : "Register User"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsRegistering(false)}
                            className="text-sm text-gray-500 hover:text-white w-full text-center"
                        >
                            Cancel
                        </button>
                    </form>
                )}

                {error && (
                    <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm text-center animate-pulse">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;
