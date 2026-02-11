'use client';

import { useState } from 'react';
import { Bell, TestTube, Flame, Trophy, Dumbbell } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

/**
 * Notification Test Panel - for testing notifications in development
 * Remove or hide this in production
 */
export function NotificationTester() {
    const { permission, isSupported, requestPermission, sendNotification } = useNotifications();
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) {
        return (
            <button
                onClick={() => setIsVisible(true)}
                className="fixed bottom-28 right-4 p-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 z-50"
                title="Open notification tester"
            >
                <TestTube size={20} />
            </button>
        );
    }

    const testNotifications = [
        {
            title: 'Evening Nudge Test',
            body: 'Haven\'t studied today? Even 30 minutes counts. Keep your streak alive! 🔥',
            icon: Dumbbell,
            tag: 'evening-test'
        },
        {
            title: 'Streak Alert Test',
            body: 'You have a 7-day streak. Study now to keep it going! 💪',
            icon: Flame,
            tag: 'streak-test'
        },
        {
            title: 'Milestone Test',
            body: 'You\'ve completed 10 chapters! You\'re crushing it! 🎉',
            icon: Trophy,
            tag: 'milestone-test'
        }
    ];

    return (
        <div className="fixed bottom-28 right-4 w-80 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 z-50 overflow-hidden">
            {/* Header */}
            <div className="bg-purple-600 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <TestTube size={20} />
                    <h3 className="font-bold">Notification Tester</h3>
                </div>
                <button
                    onClick={() => setIsVisible(false)}
                    className="text-white/80 hover:text-white text-sm"
                >
                    Hide
                </button>
            </div>

            <div className="p-4 space-y-3">
                {/* Permission Status */}
                <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3">
                    <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Status</div>
                    <div className="flex items-center gap-2">
                        <Bell size={16} className={permission === 'granted' ? 'text-green-500' : 'text-amber-500'} />
                        <span className="text-sm font-medium">
                            {!isSupported && 'Not Supported'}
                            {isSupported && permission === 'default' && 'Not Requested'}
                            {isSupported && permission === 'denied' && 'Denied'}
                            {isSupported && permission === 'granted' && 'Granted ✓'}
                        </span>
                    </div>
                </div>

                {/* Request Permission Button */}
                {permission === 'default' && (
                    <button
                        onClick={requestPermission}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                        Request Permission
                    </button>
                )}

                {/* Test Buttons */}
                {permission === 'granted' && (
                    <div className="space-y-2">
                        <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2">
                            Test Notifications
                        </div>
                        {testNotifications.map((notif) => {
                            const Icon = notif.icon;
                            return (
                                <button
                                    key={notif.tag}
                                    onClick={() => sendNotification(notif.title, {
                                        body: notif.body,
                                        tag: notif.tag
                                    })}
                                    className="w-full flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors text-left"
                                >
                                    <Icon size={18} className="text-purple-600 dark:text-purple-400 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                                            {notif.title}
                                        </div>
                                        <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                                            Click to test
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}

                {permission === 'denied' && (
                    <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                        Reset permission in browser settings to test
                    </div>
                )}
            </div>
        </div>
    );
}
