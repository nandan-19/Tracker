
'use client';

import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';

interface HeaderProps {
    title?: string;
    subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
    const { user } = useAuth();

    return (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                    {title || (user ? `Welcome back.` : 'Welcome, Future CA.')}
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-2">
                    {subtitle || 'Here is an overview of your preparation status.'}
                </p>
                {!user && (
                    <div className="mt-4">
                        <Link href="/login" className="text-sm text-blue-600 hover:text-blue-500 font-medium">
                            Log in to sync your progress &rarr;
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
