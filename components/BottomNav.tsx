'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Layout, BarChart3, Home, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNav() {
    const pathname = usePathname();
    const router = useRouter();

    const handleSubjectsClick = () => {
        if (pathname === '/') {
            // On dashboard - scroll to subjects
            const subjectsSection = document.getElementById('subjects');
            if (subjectsSection) {
                subjectsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } else {
            // Not on dashboard - navigate home first
            router.push('/#subjects');
        }
    };

    const navItems = [
        {
            href: '/',
            label: 'Home',
            icon: Home,
            active: pathname === '/',
            isButton: false
        },
        {
            href: '/stats',
            label: 'Stats',
            icon: BarChart3,
            active: pathname === '/stats',
            isButton: false
        },
        {
            href: '#subjects',
            label: 'Subjects',
            icon: Layout,
            active: pathname.startsWith('/subject/'),
            isButton: true,
            onClick: handleSubjectsClick
        },
        {
            href: '/settings',
            label: 'Settings',
            icon: Settings,
            active: pathname === '/settings',
            isButton: false
        }
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 safe-area-bottom">
            {/* Gradient accent line */}
            <div className="h-0.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-60" />

            <div className="grid grid-cols-4 h-16">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.active;

                    const content = (
                        <>
                            <div className={cn(
                                "relative",
                                isActive && "animate-in zoom-in-50 duration-200"
                            )}>
                                <Icon
                                    size={22}
                                    strokeWidth={isActive ? 2.5 : 2}
                                    className={isActive ? "drop-shadow-sm" : ""}
                                />
                                {isActive && (
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                                )}
                            </div>
                            <span className={cn(
                                "text-[10px] font-medium",
                                isActive ? "font-bold" : ""
                            )}>
                                {item.label}
                            </span>
                        </>
                    );

                    if (item.isButton) {
                        return (
                            <button
                                key={item.label}
                                onClick={item.onClick}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-1 transition-all duration-200 active:scale-95",
                                    isActive
                                        ? "text-indigo-600 dark:text-indigo-400"
                                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                                )}
                            >
                                {content}
                            </button>
                        );
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 transition-all duration-200 active:scale-95",
                                isActive
                                    ? "text-indigo-600 dark:text-indigo-400"
                                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                            )}
                        >
                            {content}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
