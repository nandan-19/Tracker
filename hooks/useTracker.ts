
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/providers/AuthProvider';

export function useTracker() {
    const { user, token, updateUser } = useAuth();
    const [trackerData, setTrackerData] = useState<Record<string, string>>({});
    const [isLoaded, setIsLoaded] = useState(false);
    const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');

    // Load initial data
    useEffect(() => {
        const saved = localStorage.getItem('ca-final-tracker-v2');
        if (saved) {
            const localData = JSON.parse(saved);
            setTrackerData(localData);
        } else if (user) {
            // If no local data but user is logged in, use user data
            setTrackerData(user.data);
        }
        setIsLoaded(true);
    }, [user]); // Re-run if user logs in to merge?

    // Save to local storage whenever data changes
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('ca-final-tracker-v2', JSON.stringify(trackerData));

            // Attempt sync if logged in
            if (token) {
                syncData();
            }
        }
    }, [trackerData, isLoaded, token]);

    const syncData = useCallback(async () => {
        if (!token) return;

        setSyncStatus('syncing');
        try {
            const response = await fetch('/api/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    data: trackerData,
                    lastUpdated: new Date().toISOString() // Current time as last updated locally
                })
            });

            if (!response.ok) throw new Error('Sync failed');

            const result = await response.json();

            if (result.action === 'synced_from_server') {
                // Server has newer data, update local
                console.log('Syncing from server:', result.data);
                setTrackerData(result.data);
                // Update user context as well
                updateUser(result.data, new Date(result.lastUpdated));
            } else {
                // Synced to server successfully
                updateUser(trackerData, new Date());
            }

            setSyncStatus('synced');
            setTimeout(() => setSyncStatus('idle'), 2000);

        } catch (error) {
            console.error('Sync error:', error);
            setSyncStatus('error');
        }
    }, [trackerData, token, updateUser]);

    const toggleStatus = (chapterName: string) => {
        setTrackerData(prev => {
            const currentStatus = prev[chapterName] || 'NOT_STARTED';
            let nextStatus;

            switch (currentStatus) {
                case 'NOT_STARTED': nextStatus = 'IN_PROGRESS'; break;
                case 'IN_PROGRESS': nextStatus = 'REV_1'; break;
                case 'REV_1': nextStatus = 'REV_2'; break;
                case 'REV_2': nextStatus = 'COMPLETED'; break;
                case 'COMPLETED': nextStatus = 'NOT_STARTED'; break;
                default: nextStatus = 'NOT_STARTED';
            }

            return { ...prev, [chapterName]: nextStatus };
        });
    };

    const getStatus = (chapterName: string) => trackerData[chapterName] || 'NOT_STARTED';

    return {
        trackerData,
        isLoaded,
        toggleStatus,
        getStatus,
        syncStatus,
        syncData
    };
}
