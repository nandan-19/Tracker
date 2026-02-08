
'use client';

import { Sidebar } from '@/components/Sidebar';
import { useState } from 'react';
import { Menu, Cloud, CloudOff, Check, Loader2 } from 'lucide-react';
import { useTracker } from '@/hooks/useTracker';
import { useAuth } from '@/providers/AuthProvider';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { syncStatus } = useTracker();
    const { user } = useAuth();

    const SyncBadge = () => {
        if (!user) return null;

        const statusConfig = {
            syncing: { icon: Loader2, color: 'text-indigo-500', spin: true },
            synced: { icon: Check, color: 'text-emerald-500', spin: false },
            error: { icon: CloudOff, color: 'text-red-500', spin: false },
            idle: { icon: Cloud, color: 'text-zinc-400', spin: false },
        };

        const config = statusConfig[syncStatus] || statusConfig.idle;
        const Icon = config.icon;

        return (
            <div className={`p-2 ${config.color}`}>
                <Icon size={16} className={config.spin ? 'animate-spin' : ''} />
            </div>
        );
    };

    return (
        <div className="flex h-screen w-full font-sans antialiased bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <main className="flex-1 overflow-y-auto h-full bg-zinc-50 dark:bg-zinc-950/50">
                {/* Glassmorphism Mobile Header */}
                <div className="md:hidden sticky top-0 z-30">
                    {/* Gradient accent line */}
                    <div className="h-0.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-80" />

                    {/* Glass navbar */}
                    <div className="glass p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {/* Logo */}
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                                <span className="text-xs font-bold">CA</span>
                            </div>
                            <div>
                                <div className="font-bold text-sm tracking-tight text-zinc-900 dark:text-white">
                                    CA Tracker
                                </div>
                                <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                                    CA Final 2027
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            <SyncBadge />
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="p-2.5 -mr-1 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors active:scale-95"
                                aria-label="Open menu"
                            >
                                <Menu size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Page content with subtle animation */}
                <div className="animate-in fade-in duration-300">
                    {children}
                </div>
            </main>
        </div>
    );
}
