
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Layout, Trophy, X, Sun, Moon, LogOut, BarChart3 } from 'lucide-react';
import { SYLLABUS } from '@/lib/syllabus';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useTracker } from '@/hooks/useTracker';

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();
    const { logout, user } = useAuth();
    const { trackerData } = useTracker();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleLogout = () => {
        if (confirm('Are you sure you want to logout?')) {
            setIsLoggingOut(true);
            logout();
            window.location.href = '/login';
        }
    };

    // Calculate subject progress for indicators
    const subjectProgress = useMemo(() => {
        const progress: Record<string, number> = {};
        SYLLABUS.forEach(sub => {
            const total = sub.chapters.length;
            const completed = sub.chapters.filter(ch => trackerData[ch]?.status === 'COMPLETED').length;
            progress[sub.id] = Math.round((completed / total) * 100);
        });
        return progress;
    }, [trackerData]);

    return (
        <>
            {/* Overlay */}
            <div
                className={cn(
                    "fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-all duration-300",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-out md:relative md:translate-x-0",
                "bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col shadow-lg dark:shadow-none",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Header with gradient accent */}
                <div className="relative">
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-60" />

                    <div className="p-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
                                <Trophy size={18} strokeWidth={2.5} />
                            </div>
                            <div>
                                <span className="font-bold text-base tracking-tight text-zinc-900 dark:text-white">CA Tracker</span>
                                <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">CA Final 2027</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            {mounted && (
                                <button
                                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                    className="p-2.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 transition-all active:scale-95"
                                    title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                                    aria-label="Toggle theme"
                                >
                                    <div className="relative w-4 h-4 flex items-center justify-center">
                                        <Sun className="absolute h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                                    </div>
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="md:hidden p-2.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/50 text-zinc-400 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
                    <Link
                        href="/"
                        onClick={onClose}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                            pathname === '/'
                                ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50"
                                : "text-zinc-600 hover:bg-zinc-100/80 dark:text-zinc-400 dark:hover:bg-zinc-800/50"
                        )}
                    >
                        <Layout size={18} />
                        Dashboard
                    </Link>

                    <Link
                        href="/stats"
                        onClick={onClose}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                            pathname === '/stats'
                                ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50"
                                : "text-zinc-600 hover:bg-zinc-100/80 dark:text-zinc-400 dark:hover:bg-zinc-800/50"
                        )}
                    >
                        <BarChart3 size={18} />
                        Statistics
                    </Link>

                    <div className="pt-5 pb-2 px-4 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
                        Subjects
                    </div>

                    {SYLLABUS.map(sub => {
                        const progress = subjectProgress[sub.id] || 0;
                        const hasProgress = progress > 0;

                        return (
                            <Link
                                key={sub.id}
                                href={`/subject/${sub.id}`}
                                onClick={onClose}
                                className={cn(
                                    "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                                    pathname === `/subject/${sub.id}`
                                        ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50"
                                        : "text-zinc-600 hover:bg-zinc-100/80 dark:text-zinc-400 dark:hover:bg-zinc-800/50"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={cn(
                                        "w-2 h-2 rounded-full transition-all",
                                        hasProgress ? sub.bgColor : "bg-zinc-300 dark:bg-zinc-700"
                                    )} />
                                    {sub.shortName}
                                </div>

                                {/* Mini progress indicator */}
                                {hasProgress && (
                                    <div className="flex items-center gap-2">
                                        <div className="w-12 h-1 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                            <div
                                                className={cn("h-full rounded-full transition-all", sub.bgColor)}
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] text-zinc-400 font-mono w-6">{progress}%</span>
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-zinc-200/50 dark:border-zinc-800/50">
                    {user ? (
                        <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors"
                        >
                            <LogOut size={16} />
                            {isLoggingOut ? 'Logging out...' : 'Log Out'}
                        </button>
                    ) : (
                        <Link
                            href="/login"
                            className="w-full block text-center px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/25"
                        >
                            Start Tracking
                        </Link>
                    )}
                </div>
            </aside>
        </>
    );
}
