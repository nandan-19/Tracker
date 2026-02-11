'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface NotificationSettings {
    enabled: boolean;
    eveningNudge: boolean;
    eveningNudgeTime: string; // "18:00" format
    streakAlert: boolean;
    streakAlertTime: string;
    milestones: boolean;
}

interface StudySettings {
    dailyGoal: number; // chapters per day
    weeklyGoal: number;
    reminderEnabled: boolean;
    reminderTime: string;
}

interface ProfileSettings {
    name: string;
    examDate: string; // ISO date
    targetRank: string;
}

interface AppSettings {
    notifications: NotificationSettings;
    study: StudySettings;
    profile: ProfileSettings;
}

const defaultSettings: AppSettings = {
    notifications: {
        enabled: true,
        eveningNudge: true,
        eveningNudgeTime: '18:00',
        streakAlert: true,
        streakAlertTime: '10:00',
        milestones: true
    },
    study: {
        dailyGoal: 3,
        weeklyGoal: 20,
        reminderEnabled: true,
        reminderTime: '09:00'
    },
    profile: {
        name: 'Future CA',
        examDate: '2027-01-15',
        targetRank: 'Top 100'
    }
};

interface SettingsContextType {
    settings: AppSettings;
    updateSettings: (updates: Partial<AppSettings>) => void;
    resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<AppSettings>(defaultSettings);

    // Load settings from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('app_settings');
        if (stored) {
            try {
                setSettings(JSON.parse(stored));
            } catch (error) {
                console.error('Failed to parse settings:', error);
            }
        }
    }, []);

    // Save settings to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('app_settings', JSON.stringify(settings));
    }, [settings]);

    const updateSettings = (updates: Partial<AppSettings>) => {
        setSettings(prev => ({
            ...prev,
            ...updates,
            notifications: {
                ...prev.notifications,
                ...(updates.notifications || {})
            },
            study: {
                ...prev.study,
                ...(updates.study || {})
            },
            profile: {
                ...prev.profile,
                ...(updates.profile || {})
            }
        }));
    };

    const resetSettings = () => {
        setSettings(defaultSettings);
        localStorage.removeItem('app_settings');
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within SettingsProvider');
    }
    return context;
}
