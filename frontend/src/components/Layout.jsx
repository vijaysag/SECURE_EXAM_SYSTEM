import React, { useContext } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Home, Upload, FileLock, ShieldCheck, LogOut, Wallet } from 'lucide-react';
import { BlockchainContext } from '../context/BlockchainContext';

const Layout = () => {
    const location = useLocation();
    const { account, connectWallet, signOut, role } = useContext(BlockchainContext);

    const navItems = [
        { path: '/', label: 'Overview', icon: Home },
        { path: '/upload', label: 'Secure Upload', icon: Upload },
        { path: '/extract', label: 'Paper Extraction', icon: FileLock },
    ];

    // Get web login role from localStorage
    const webRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;

    // Filter nav items - hide upload for Printer and Moderator
    const filteredNavItems = navItems.filter(item => {
        if (item.path === '/upload') {
            // Hide upload page for Printer and Moderator (case-insensitive)
            const lowerRole = (webRole || '').toLowerCase();
            if (lowerRole === 'printer' || lowerRole === 'moderator') {
                return false;
            }
        }
        return true;
    });

    return (
        <div className="flex h-screen bg-dark text-gray-100 font-sans selection:bg-blue-500/30">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 flex flex-col glass-panel m-4 mt-4 mb-4 rounded-2xl">
                <div className="p-6 border-b border-white/10 flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
                        <ShieldCheck className="text-white" size={24} />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight">SecureExam</h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {filteredNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-blue-600/20 text-blue-400 font-medium'
                                    : 'hover:bg-white/5 text-gray-400 hover:text-gray-200'
                                    }`}
                            >
                                <Icon size={20} className={isActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/10 space-y-3">
                    {/* Web User Info */}
                    <div className="px-4 py-3 bg-white/5 rounded-xl border border-white/5">
                        <div className="text-xs text-gray-400 uppercase font-semibold tracking-wider mb-1">Logged In As</div>
                        <div className="text-sm font-medium text-white truncate">{localStorage.getItem('userId') || 'Guest'}</div>
                        <div className="text-xs text-blue-400 mt-1 capitalize">{localStorage.getItem('userRole') || 'Viewer'}</div>
                    </div>

                    {account ? (
                        <div className="space-y-2">
                            <div className="px-4 py-3 bg-white/5 rounded-xl border border-white/5">
                                <div className="text-xs text-gray-400 uppercase font-semibold tracking-wider mb-1">Connected As</div>
                                <div className="text-sm font-mono text-emerald-400 truncate">{account.slice(0, 6)}...{account.slice(-4)}</div>
                                <div className="text-xs text-blue-400 mt-1 capitalize">{role || 'User'}</div>
                            </div>
                            <button
                                onClick={signOut}
                                className="flex items-center gap-2 w-full px-4 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors border border-red-500/20 text-sm"
                            >
                                <Wallet size={16} />
                                Disconnect Wallet
                            </button>
                        </div>
                    ) : (
                        !window.ethereum ? (
                            <a
                                href="https://metamask.io/download/"
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors border border-amber-500/30"
                            >
                                <Wallet size={20} />
                                Install Wallet
                            </a>
                        ) : (
                            <button
                                onClick={connectWallet}
                                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-colors border border-blue-500/30"
                            >
                                <Wallet size={20} />
                                Connect Wallet
                            </button>
                        )
                    )}

                    <button
                        onClick={() => {
                            signOut();
                            localStorage.removeItem('userRole');
                            localStorage.removeItem('userId');
                            window.location.href = '/login';
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-red-400 transition-colors"
                    >
                        <LogOut size={20} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-8">
                <div className="max-w-6xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
