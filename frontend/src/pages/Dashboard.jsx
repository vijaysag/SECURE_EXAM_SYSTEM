import React from 'react';
import { Activity, FileText, Users, AlertTriangle } from 'lucide-react';

const Dashboard = () => {
    // Mock Data
    const stats = [
        { label: "Papers Uploaded", value: "12", icon: FileText, color: "text-blue-400", bg: "bg-blue-500/10" },
        { label: "Pending Approvals", value: "4", icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10" },
        { label: "Active Nodes", value: "8", icon: Activity, color: "text-emerald-400", bg: "bg-emerald-500/10" },
        { label: "Registered Staff", value: "24", icon: Users, color: "text-purple-400", bg: "bg-purple-500/10" },
    ];

    const recentActivity = [
        { id: 1, action: "Paper Uploaded", user: "Setter A", time: "2 mins ago", hash: "0x892...21a" },
        { id: 2, action: "Access Granted", user: "Printing Auth", time: "1 hour ago", hash: "0x12b...90c" },
        { id: 3, action: "Log Audit", user: "System", time: "3 hours ago", hash: "-" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <h2 className="text-3xl font-bold text-white">System Overview</h2>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="glass-panel p-6 flex items-center justify-between hover:bg-white/10 transition-colors">
                        <div>
                            <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                            <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                        </div>
                        <div className={`p-4 rounded-xl ${stat.bg}`}>
                            <stat.icon className={stat.color} size={24} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass-panel p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white">Blockchain Transactions</h3>
                        <div className="flex gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-xs text-emerald-400 font-mono">LIVE</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {recentActivity.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 font-bold text-sm">
                                        {item.user.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-200">{item.action}</h4>
                                        <p className="text-xs text-gray-500">by {item.user}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-mono text-gray-400">{item.hash}</p>
                                    <p className="text-xs text-gray-600">{item.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-panel p-6 bg-gradient-to-b from-blue-900/20 to-transparent">
                    <h3 className="text-lg font-bold text-white mb-4">System Status</h3>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Network Latency</span>
                                <span className="text-emerald-400">12ms</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full w-[20%] bg-emerald-500 rounded-full"></div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Verification Nodes</span>
                                <span className="text-blue-400">9/10 Active</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full w-[90%] bg-blue-500 rounded-full"></div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="text-amber-500 shrink-0" size={20} />
                            <div>
                                <h4 className="text-amber-200 text-sm font-bold">Security Alert</h4>
                                <p className="text-amber-200/70 text-xs mt-1">
                                    2 failed extraction attempts detected from Node #4.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
