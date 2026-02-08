
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/providers/AuthProvider';

// New data type: stores status and the date it was last modified
export type ChapterData = { status: string; updatedAt: string };
export type TrackerDataMap = Record<string, ChapterData>;

export function useTracker() {
    const { user, token, updateUser } = useAuth();
    const [trackerData, setTrackerData] = useState<TrackerDataMap>({});
    const [history, setHistory] = useState<{ date: string; count: number }[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');

    // Migration helper: convert old format to new format
    const migrateData = (data: any): TrackerDataMap => {
        if (!data) return {};
        const migrated: TrackerDataMap = {};
        Object.keys(data).forEach(key => {
            const val = data[key];
            if (typeof val === 'string') {
                // Old format: just a status string
                migrated[key] = { status: val, updatedAt: new Date().toISOString() };
            } else if (val && typeof val === 'object' && val.status) {
                // New format already
                migrated[key] = val;
            }
        });
        return migrated;
    };

    // Load initial data
    useEffect(() => {
        const saved = localStorage.getItem('ca-final-tracker-v3'); // New version key
        if (saved) {
            const localData = JSON.parse(saved);
            setTrackerData(migrateData(localData));
        } else {
            // Try to migrate from old v2 key
            const oldSaved = localStorage.getItem('ca-final-tracker-v2');
            if (oldSaved) {
                const oldData = JSON.parse(oldSaved);
                setTrackerData(migrateData(oldData));
            } else if (user) {
                setTrackerData(migrateData(user.data));
            }
        }

        const savedHistory = localStorage.getItem('ca-final-tracker-history');
        if (savedHistory) {
            setHistory(JSON.parse(savedHistory));
        } else if (user && user.history) {
            setHistory(user.history);
        }
        setIsLoaded(true);
    }, [user]);

    // Save to local storage immediately
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('ca-final-tracker-v3', JSON.stringify(trackerData));
            localStorage.setItem('ca-final-tracker-history', JSON.stringify(history));
        }
    }, [trackerData, history, isLoaded]);

    // Sync only on mount to get latest data
    useEffect(() => {
        if (token && isLoaded) {
            syncData();
        }
    }, [token, isLoaded]);

    const syncData = useCallback(async (dataToSync?: TrackerDataMap, historyToSync?: { date: string; count: number }[]) => {
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
                    history: historyToSync || history,
                    lastUpdated: new Date().toISOString()
                })
            });

            if (!response.ok) throw new Error('Sync failed');

            const result = await response.json();

            if (result.action === 'synced_from_server') {
                console.log('Syncing from server:', result.data);
                const migratedServerData = migrateData(result.data);
                if (JSON.stringify(migratedServerData) !== JSON.stringify(currentData)) {
                    setTrackerData(migratedServerData);
                    if (result.history) setHistory(result.history);
                    updateUser(migratedServerData, new Date(result.lastUpdated));
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
    }, [trackerData, history, token, updateUser]);

    const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const toggleStatus = (chapterName: string) => {
        setTrackerData(prev => {
            const currentEntry = prev[chapterName];
            const currentStatus = currentEntry?.status || 'NOT_STARTED';
            let nextStatus;

            switch (currentStatus) {
                case 'NOT_STARTED': nextStatus = 'IN_PROGRESS'; break;
                case 'IN_PROGRESS': nextStatus = 'REV_1'; break;
                case 'REV_1': nextStatus = 'REV_2'; break;
                case 'REV_2': nextStatus = 'COMPLETED'; break;
                case 'COMPLETED': nextStatus = 'NOT_STARTED'; break;
                default: nextStatus = 'NOT_STARTED';
            }

            const now = new Date().toISOString();
            const newData: TrackerDataMap = {
                ...prev,
                [chapterName]: { status: nextStatus, updatedAt: now }
            };

            // Handle History (Streaks)
            const today = now.split('T')[0];
            let newHistory = [...history];
            const todayEntryIndex = newHistory.findIndex(h => h.date === today);

            if (['COMPLETED', 'REV_1', 'REV_2'].includes(nextStatus)) {
                if (todayEntryIndex >= 0) {
                    newHistory[todayEntryIndex].count += 1;
                } else {
                    newHistory.push({ date: today, count: 1 });
                }
            }

            setHistory(newHistory);

            // Trigger sync with debounce
            if (token) {
                if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
                syncTimeoutRef.current = setTimeout(() => {
                    syncData(newData, newHistory);
                }, 2000);
            }

            return newData;
        });
    };

    const getStatus = (chapterName: string): string => {
        const entry = trackerData[chapterName];
        return entry?.status || 'NOT_STARTED';
    };

    const getUpdatedAt = (chapterName: string): string | null => {
        const entry = trackerData[chapterName];
        return entry?.updatedAt || null;
    };

    return {
        trackerData,
        isLoaded,
        toggleStatus,
        getStatus,
        getUpdatedAt, // New helper
        syncStatus,
        syncData: () => syncData(),
        history
    };
}
