'use client';

import { useEffect, useState } from 'react';
import { useTracker } from './useTracker';
import { useSettings } from '@/providers/SettingsProvider';

interface NotificationState {
    permission: NotificationPermission;
    isSupported: boolean;
}

export function useNotifications() {
    const [state, setState] = useState<NotificationState>({
        permission: 'default',
        isSupported: false
    });
    const { history, trackerData } = useTracker();
    const { settings } = useSettings();

    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setState({
                permission: Notification.permission,
                isSupported: true
            });
        }
    }, []);

    const requestPermission = async () => {
        if (!state.isSupported) return false;

        try {
            const permission = await Notification.requestPermission();
            setState(prev => ({ ...prev, permission }));
            return permission === 'granted';
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return false;
        }
    };

    const sendNotification = (title: string, options?: NotificationOptions) => {
        if (state.permission !== 'granted') return;

        try {
            new Notification(title, {
                icon: '/icons/icon.png',
                badge: '/icons/icon.png',
                ...options
            });
        } catch (error) {
            console.error('Error sending notification:', error);
        }
    };

    // Smart notification logic - determines if notification should be sent
    const checkAndNotify = () => {
        // Check if notifications are globally enabled
        if (!settings.notifications.enabled || state.permission !== 'granted') return;

        const today = new Date().toISOString().split('T')[0];
        const todayActivity = history?.find(h => h.date === today)?.count || 0;
        const currentHour = new Date().getHours();

        // Calculate streak
        let streak = 0;
        if (history && history.length > 0) {
            const sorted = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            let checkDate = new Date();

            for (const entry of sorted) {
                const entryDate = new Date(entry.date);
                entryDate.setHours(0, 0, 0, 0);
                checkDate.setHours(0, 0, 0, 0);

                const diffDays = Math.floor((checkDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));

                if (diffDays === streak && entry.count > 0) {
                    streak++;
                    checkDate.setDate(checkDate.getDate() - 1);
                } else {
                    break;
                }
            }
        }

        const notificationKey = `lastNotification_${today}`;
        const sentToday = localStorage.getItem(notificationKey);
        const sentCount = sentToday ? parseInt(sentToday) : 0;

        // Rule: Max 2 notifications per day
        if (sentCount >= 2) return;

        // SCENARIO 1: Evening nudge (6 PM - 9 PM) - if no activity today
        if (settings.notifications.eveningNudge && currentHour >= 18 && currentHour < 21 && todayActivity === 0 && !sentToday) {
            sendNotification('CA Tracker Reminder', {
                body: 'Haven\'t studied today? Even 30 minutes counts. Keep your streak alive! 🔥',
                tag: 'evening-nudge'
            });
            localStorage.setItem(notificationKey, '1');
            return;
        }

        // SCENARIO 2: Streak alert (morning 10 AM) - if yesterday had activity but today doesn't
        if (settings.notifications.streakAlert && currentHour === 10 && todayActivity === 0 && streak >= 3 && sentCount === 0) {
            sendNotification('Don\'t Break Your Streak!', {
                body: `You have a ${streak}-day streak. Study now to keep it going! 💪`,
                tag: 'streak-alert'
            });
            localStorage.setItem(notificationKey, '1');
            return;
        }

        // SCENARIO 3: Milestone celebration - happens immediately when milestone hit
        if (settings.notifications.milestones) {
            const milestones = [10, 25, 50, 75, 100, 136];
            const totalCompleted = Object.values(trackerData).filter(c => c.status === 'COMPLETED').length;

            const lastMilestone = localStorage.getItem('lastMilestone');
            const lastMilestoneNum = lastMilestone ? parseInt(lastMilestone) : 0;

            const newMilestone = milestones.find(m => totalCompleted >= m && m > lastMilestoneNum);
            if (newMilestone && sentCount < 2) {
                sendNotification('Milestone Achieved! 🎉', {
                    body: `You've completed ${newMilestone} chapters! You're crushing it!`,
                    tag: 'milestone'
                });
                localStorage.setItem('lastMilestone', newMilestone.toString());
                localStorage.setItem(notificationKey, (sentCount + 1).toString());
            }
        }
    };

    return {
        permission: state.permission,
        isSupported: state.isSupported,
        requestPermission,
        sendNotification,
        checkAndNotify
    };
}
