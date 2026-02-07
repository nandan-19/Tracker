
import { useState, useEffect, useCallback, useRef } from 'react';
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

    // Save to local storage immediately
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('ca-final-tracker-v2', JSON.stringify(trackerData));
        }
    }, [trackerData, isLoaded]);

    // Sync only on mount to get latest data
    useEffect(() => {
        if (token && isLoaded) {
            syncData();
        }
    }, [token, isLoaded]); // Runs once when token/loaded becomes true

    const syncData = useCallback(async (dataToSync?: Record<string, string>) => {
        if (!token) return;

        setSyncStatus('syncing');
        try {
            const currentData = dataToSync || trackerData;
            const response = await fetch('/api/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    data: currentData,
                    lastUpdated: new Date().toISOString()
                })
            });

            if (!response.ok) throw new Error('Sync failed');

            const result = await response.json();

            if (result.action === 'synced_from_server') {
                console.log('Syncing from server:', result.data);
                // Only update if different to avoid loop
                if (JSON.stringify(result.data) !== JSON.stringify(currentData)) {
                    setTrackerData(result.data);
                    updateUser(result.data, new Date(result.lastUpdated));
                }
            } else {
                updateUser(currentData, new Date());
            }

            setSyncStatus('synced');
            setTimeout(() => setSyncStatus('idle'), 2000);

        } catch (error) {
            console.error('Sync error:', error);
            setSyncStatus('error');
        }
    }, [trackerData, token, updateUser]);

    // Debounced trigger for manual actions
    const triggerSync = useCallback((newData: Record<string, string>) => {
        if (!token) return;

        // Clear existing timeout if any (simple debounce)
        // Note: For a proper debounce in a hook we'd need a ref, 
        // but for now we'll just allow the update and let the user trigger it.
        // Actually, let's use a timeout ref to prevent rapid spamming.
    }, [token]);

    // We need a ref to hold the timeout ID across renders
    const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

            const newData = { ...prev, [chapterName]: nextStatus };

            // Trigger sync with debounce
            if (token) {
                if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
                syncTimeoutRef.current = setTimeout(() => {
                    syncData(newData); // Pass the new data directly to sync
                }, 2000);
            }

            return newData;
        });
    };

    const getStatus = (chapterName: string) => trackerData[chapterName] || 'NOT_STARTED';

    return {
        trackerData,
        isLoaded,
        toggleStatus,
        getStatus,
        syncStatus,
        syncData: () => syncData() // Expose manual sync
    };
}
