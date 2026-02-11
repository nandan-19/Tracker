
'use client';

import { Sidebar } from '@/components/Sidebar';
import { BottomNav } from '@/components/BottomNav';
import { NotificationPrompt } from '@/components/NotificationPrompt';
import { NotificationManager } from '@/components/NotificationManager';
import { NotificationTester } from '@/components/NotificationTester';
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
        <div className="flex h-screen w-full font-sans antialiased bg-[#f4f6f8] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main className="flex-1 overflow-y-auto h-full">
                {/* Page content with bottom padding for mobile nav */}
                <div className="animate-in fade-in duration-300 pb-20 md:pb-0">
                    {children}
                </div>

                {/* Bottom Navigation for Mobile */}
                <BottomNav />

                {/* Notification Components */}
                <NotificationPrompt />
                <NotificationManager />

                {/* DEV ONLY: Notification Tester - Remove in production */}
                {process.env.NODE_ENV === 'development' && <NotificationTester />}
            </main>
        </div>
    );
}
