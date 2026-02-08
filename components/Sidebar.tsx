
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Layout, Trophy, X, Sun, Moon, Trash2, BarChart3 } from 'lucide-react';
import { SYLLABUS } from '@/lib/syllabus';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();
    const { logout, user } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch
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

    return (
        <>
            <div
                className={cn(
                    "fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-white flex items-center justify-center text-white dark:text-zinc-900">
                            <Trophy size={16} strokeWidth={3} />
                        </div>
                        <span className="font-bold text-lg tracking-tight">CA Tracker</span>
                    </div>

                    <div className="flex items-center gap-2">
                        {mounted && (
                            <button
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors"
                                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                                aria-label="Toggle theme"
                            >
                                <div className="relative w-5 h-5 flex items-center justify-center">
                                    <Sun className="absolute h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                    <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                                </div>
                                <span className="sr-only">Toggle theme</span>
                            </button>
                        )}
                        <button onClick={onClose} className="md:hidden text-zinc-400">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto py-2 px-3 space-y-1">
                    <Link
                        href="/"
                        onClick={onClose}
                        className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                            pathname === '/'
                                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                                : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 dark:text-zinc-400"
                        )}
                    >
                        <Layout size={18} />
                        Dashboard
                    </Link>

                    <Link
                        href="/stats"
                        onClick={onClose}
                        className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                            pathname === '/stats'
                                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                                : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 dark:text-zinc-400"
                        )}
                    >
                        <BarChart3 size={18} />
                        Stats
                    </Link>

                    <div className="pt-4 pb-2 px-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Subjects
                    </div>

                    {SYLLABUS.map(sub => (
                        <Link
                            key={sub.id}
                            href={`/subject/${sub.id}`}
                            onClick={onClose}
                            className={cn(
                                "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group",
                                pathname === `/subject/${sub.id}`
                                    ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                                    : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 dark:text-zinc-400"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <span className={cn("w-2 h-2 rounded-full", sub.bgColor)}></span>
                                {sub.shortName}
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
                    {user ? (
                        <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors justify-center"
                        >
                            <Trash2 size={16} />
                            {isLoggingOut ? 'Logging out...' : 'Log Out'}
                        </button>
                    ) : (
                        <Link href="/login" className="w-full block text-center px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">
                            Start Tracking
                        </Link>
                    )}
                </div>
            </aside>
        </>
    );
}
