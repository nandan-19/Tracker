
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/providers/AuthProvider';

export type ChapterData = { status: string; updatedAt: string };
export type TrackerDataMap = Record<string, ChapterData>;

export function useTracker() {
    const { user, token, updateUser } = useAuth();
    const [trackerData, setTrackerData] = useState<TrackerDataMap>({});
    const [history, setHistory] = useState<{ date: string; count: number }[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
    const hasFetchedRef = useRef(false);

    // Migration helper
    const migrateData = (data: any): TrackerDataMap => {
        if (!data) return {};
        const migrated: TrackerDataMap = {};
        Object.keys(data).forEach(key => {
            const val = data[key];
            if (typeof val === 'string') {
                migrated[key] = { status: val, updatedAt: new Date().toISOString() };
            } else if (val && typeof val === 'object' && val.status) {
                migrated[key] = val;
            }
        });
        return migrated;
    };

    // STEP 1: On mount, immediately fetch from server if logged in
    useEffect(() => {
        if (token && !hasFetchedRef.current) {
            hasFetchedRef.current = true;
            fetchFromServer();
        } else if (!token) {
            // Not logged in - load from local storage only
            loadFromLocalStorage();
        }
    }, [token]);

    const loadFromLocalStorage = () => {
        const saved = localStorage.getItem('ca-final-tracker-v3');
        if (saved) {
            setTrackerData(migrateData(JSON.parse(saved)));
        } else {
            const oldSaved = localStorage.getItem('ca-final-tracker-v2');
            if (oldSaved) {
                setTrackerData(migrateData(JSON.parse(oldSaved)));
            }
        }

        const savedHistory = localStorage.getItem('ca-final-tracker-history');
        if (savedHistory) {
            setHistory(JSON.parse(savedHistory));
        }
        setIsLoaded(true);
    };

    // Fetch data from server (GET - no sync, just fetch)
    const fetchFromServer = async () => {
        if (!token) {
            loadFromLocalStorage();
            return;
        }

        setSyncStatus('syncing');
        try {
            console.log('📥 Fetching data from server...');
            const response = await fetch('/api/sync', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Fetch failed');
            }

            const result = await response.json();
            console.log('📥 Server data received:', result);

            const serverData = migrateData(result.data);
            const serverHistory = result.history || [];

            // Apply server data
            setTrackerData(serverData);
            setHistory(serverHistory);

            // Save to local storage
            localStorage.setItem('ca-final-tracker-v3', JSON.stringify(serverData));
            localStorage.setItem('ca-final-tracker-history', JSON.stringify(serverHistory));
            localStorage.setItem('ca-final-tracker-last-synced', new Date(result.lastUpdated).toISOString());

            setSyncStatus('synced');
            setTimeout(() => setSyncStatus('idle'), 2000);

        } catch (error) {
            console.error('Fetch error:', error);
            // Fallback to local storage if server fetch fails
            loadFromLocalStorage();
            setSyncStatus('error');
        } finally {
            setIsLoaded(true);
        }
    };

    // Save to local storage when data changes
    useEffect(() => {
        if (isLoaded && Object.keys(trackerData).length > 0) {
            localStorage.setItem('ca-final-tracker-v3', JSON.stringify(trackerData));
            localStorage.setItem('ca-final-tracker-history', JSON.stringify(history));
        }
    }, [trackerData, history, isLoaded]);

    // Push changes to server
    const pushToServer = useCallback(async (dataToSync: TrackerDataMap, historyToSync: { date: string; count: number }[]) => {
        if (!token) return;

        setSyncStatus('syncing');
        try {
            const now = new Date().toISOString();
            const response = await fetch('/api/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    data: dataToSync,
                    history: historyToSync,
                    lastUpdated: now
                })
            });

            if (!response.ok) throw new Error('Sync failed');

            const result = await response.json();
            console.log('📤 Sync result:', result.action);

            if (result.action === 'synced_from_server') {
                // Server had newer data
                const serverData = migrateData(result.data);
                setTrackerData(serverData);
                if (result.history) setHistory(result.history);
            }

            localStorage.setItem('ca-final-tracker-last-synced', now);
            setSyncStatus('synced');
            setTimeout(() => setSyncStatus('idle'), 2000);

        } catch (error) {
            console.error('Sync error:', error);
            setSyncStatus('error');
        }
    }, [token]);

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

            // Handle History
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

            // Debounced push to server
            if (token) {
                if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
                syncTimeoutRef.current = setTimeout(() => {
                    pushToServer(newData, newHistory);
                }, 1000);
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
        getUpdatedAt,
        syncStatus,
        syncData: fetchFromServer,
        history
    };
}
