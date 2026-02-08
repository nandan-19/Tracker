
'use client';

import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { useTracker } from '@/hooks/useTracker';
import { useState, useEffect, useMemo } from 'react';
import { Cloud, CloudOff, Check, Loader2 } from 'lucide-react';

interface HeaderProps {
    title?: string;
    subtitle?: string;
}

const MOTIVATIONAL_SUBTITLES = [
    "Every chapter completed brings you closer to your goal.",
    "Consistency is the key to success.",
    "Small progress is still progress.",
    "Your future self will thank you.",
    "Focus on progress, not perfection.",
];

export function Header({ title, subtitle }: HeaderProps) {
    const { user } = useAuth();
    const { syncStatus } = useTracker();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const greeting = useMemo(() => {
        if (!mounted) return 'Welcome';
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return 'Good morning';
        if (hour >= 12 && hour < 17) return 'Good afternoon';
        if (hour >= 17 && hour < 21) return 'Good evening';
        return 'Burning the midnight oil';
    }, [mounted]);

    const dynamicSubtitle = useMemo(() => {
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
        return MOTIVATIONAL_SUBTITLES[dayOfYear % MOTIVATIONAL_SUBTITLES.length];
    }, []);

    const SyncIndicator = () => {
        if (!user) return null;

        return (
            <div className="flex items-center gap-1.5 text-xs font-medium">
                {syncStatus === 'syncing' && (
                    <span className="flex items-center gap-1.5 text-indigo-500 animate-pulse-soft">
                        <Loader2 size={12} className="animate-spin" />
                        <span className="hidden sm:inline">Syncing</span>
                    </span>
                )}
                {syncStatus === 'synced' && (
                    <span className="flex items-center gap-1.5 text-emerald-500">
                        <Check size={12} />
                        <span className="hidden sm:inline">Synced</span>
                    </span>
                )}
                {syncStatus === 'error' && (
                    <span className="flex items-center gap-1.5 text-red-500">
                        <CloudOff size={12} />
                        <span className="hidden sm:inline">Offline</span>
                    </span>
                )}
                {syncStatus === 'idle' && (
                    <span className="flex items-center gap-1.5 text-zinc-400">
                        <Cloud size={12} />
                    </span>
                )}
            </div>
        );
    };

    return (
        <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                        {title || (
                            <>
                                <span className="text-gradient">{greeting}</span>
                                <span className="text-zinc-900 dark:text-white">, {user ? 'Champion' : 'Future CA'}.</span>
                            </>
                        )}
                    </h1>
                    <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 mt-1.5">
                        {subtitle || dynamicSubtitle}
                    </p>
                </div>
                <SyncIndicator />
            </div>
            {!user && (
                <div className="mt-3">
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-medium group"
                    >
                        Log in to sync your progress
                        <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                    </Link>
                </div>
            )}
        </div>
    );
}
