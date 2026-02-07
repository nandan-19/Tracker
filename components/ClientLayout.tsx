
'use client';

import { Sidebar } from '@/components/Sidebar';
import { useState } from 'react';
import { Menu } from 'lucide-react';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen w-full font-sans antialiased bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <main className="flex-1 overflow-y-auto h-full bg-zinc-50 dark:bg-zinc-950/50">
                <div className="md:hidden p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center gap-2 font-bold">
                        CA Tracker
                    </div>
                    <button onClick={() => setSidebarOpen(true)} className="p-2 -mr-2 text-zinc-500">
                        <Menu size={20} />
                    </button>
                </div>
                {children}
            </main>
        </div>
    );
}
