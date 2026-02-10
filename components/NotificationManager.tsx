'use client';

import { useEffect, useCallback } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useTracker } from '@/hooks/useTracker';

/**
 * Notification Manager - handles scheduling and triggering of smart notifications
 * Runs in the background and checks notification conditions periodically
 */
export function NotificationManager() {
    const { checkAndNotify, permission } = useNotifications();
    const { trackerData } = useTracker();

    // Check for milestone notifications when tracker data changes
    useEffect(() => {
        if (permission === 'granted') {
            checkAndNotify();
        }
    }, [trackerData, permission, checkAndNotify]);

    // Periodic check every 30 minutes for time-based notifications
    useEffect(() => {
        if (permission !== 'granted') return;

        const interval = setInterval(() => {
            checkAndNotify();
        }, 30 * 60 * 1000); // 30 minutes

        // Initial check
        checkAndNotify();

        return () => clearInterval(interval);
    }, [permission, checkAndNotify]);

    return null; // This component doesn't render anything
}
