'use client';

import { useState } from 'react';
import { Bell, BellOff, X } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

export function NotificationPrompt() {
    const [dismissed, setDismissed] = useState(false);
    const { permission, isSupported, requestPermission } = useNotifications();

    // Don't show if already granted, denied, or dismissed
    if (!isSupported || permission !== 'default' || dismissed) {
        return null;
    }

    const handleEnable = async () => {
        const granted = await requestPermission();
        if (!granted) {
            setDismissed(true);
        }
    };

    const handleDismiss = () => {
        setDismissed(true);
    };

    return (
        <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-8 md:w-96 z-50 animate-in slide-in-from-bottom-4 duration-300">
            <div className="glass rounded-2xl p-4 shadow-xl border-2 border-indigo-200 dark:border-indigo-900">
                {/* Close button */}
                <button
                    onClick={handleDismiss}
                    className="absolute top-3 right-3 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    aria-label="Dismiss"
                >
                    <X size={16} />
                </button>

                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                        <Bell size={20} className="text-indigo-600 dark:text-indigo-400" />
                    </div>

                    <div className="flex-1 pr-4">
                        <h3 className="font-bold text-sm text-zinc-900 dark:text-white mb-1">
                            Stay on Track
                        </h3>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-3">
                            Get smart reminders to maintain your streak. We'll only notify you when needed (max 2/day).
                        </p>

                        <div className="flex gap-2">
                            <button
                                onClick={handleEnable}
                                className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors active:scale-95"
                            >
                                Enable Alerts
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="px-3 py-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium rounded-lg transition-colors"
                            >
                                Not Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
