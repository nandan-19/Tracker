'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '@/providers/SettingsProvider';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell, User, Target, Download, Info, RotateCcw, ChevronRight, Save, Check } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';

export default function SettingsPage() {
    const { settings: globalSettings, updateSettings } = useSettings();
    const { permission, requestPermission } = useNotifications();
    const { user } = useAuth();
    const [activeSection, setActiveSection] = useState<string | null>(null);

    // Local state - holds unsaved changes
    const [localSettings, setLocalSettings] = useState(globalSettings);
    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showSavedMessage, setShowSavedMessage] = useState(false);
    const [initialized, setInitialized] = useState(false);

    // Initialize from global settings ONCE when they load
    useEffect(() => {
        if (!initialized && globalSettings) {
            setLocalSettings(globalSettings);
            setInitialized(true);
        }
    }, [globalSettings, initialized]);

    // Detect changes
    useEffect(() => {
        const isDifferent = JSON.stringify(localSettings) !== JSON.stringify(globalSettings);
        setHasChanges(isDifferent);
    }, [localSettings, globalSettings]);

    // ACTUALLY SAVE to localStorage via context
    const handleSave = () => {
        setIsSaving(true);

        // Persist to global state (auto-saves to localStorage)
        updateSettings(localSettings);

        setTimeout(() => {
            setIsSaving(false);
            setShowSavedMessage(true);
            setHasChanges(false);
            setLocalSettings(localSettings); // Sync local state after successful save

            // Hide message
            setTimeout(() => {
                setShowSavedMessage(false);
            }, 2000);
        }, 500);
    };

    // Discard unsaved changes
    const handleReset = () => {
        setLocalSettings(globalSettings);
        setHasChanges(false);
    };

    const sections = [
        {
            id: 'profile',
            title: 'Profile',
            icon: User,
            description: 'Personalize your experience'
        },
        {
            id: 'notifications',
            title: 'Notifications',
            icon: Bell,
            description: 'Manage alerts and reminders'
        },
        {
            id: 'study',
            title: 'Study Goals',
            icon: Target,
            description: 'Set your targets'
        },
        {
            id: 'data',
            title: 'Data & Privacy',
            icon: Download,
            description: 'Export and manage data'
        },
        {
            id: 'about',
            title: 'About',
            icon: Info,
            description: 'App information'
        }
    ];

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-12 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Settings</h1>
                <p className="text-zinc-600 dark:text-zinc-400">Customize your CA Tracker experience</p>
            </div>

            {/* Settings Sections */}
            <div className="space-y-3">
                {/* Profile Section */}
                <SettingsSection
                    title="Profile"
                    icon={User}
                    isOpen={activeSection === 'profile'}
                    onToggle={() => setActiveSection(activeSection === 'profile' ? null : 'profile')}
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                Display Name
                            </label>
                            <input
                                type="text"
                                value={localSettings.profile.name}
                                onChange={(e) => setLocalSettings({
                                    ...localSettings,
                                    profile: { ...localSettings.profile, name: e.target.value }
                                })}
                                className="w-full px-4 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Future CA"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                CA Final Exam Date
                            </label>
                            <input
                                type="date"
                                value={localSettings.profile.examDate}
                                onChange={(e) => setLocalSettings({
                                    ...localSettings,
                                    profile: { ...localSettings.profile, examDate: e.target.value }
                                })}
                                className="w-full px-4 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                Target Rank
                            </label>
                            <input
                                type="text"
                                value={localSettings.profile.targetRank}
                                onChange={(e) => setLocalSettings({
                                    ...localSettings,
                                    profile: { ...localSettings.profile, targetRank: e.target.value }
                                })}
                                className="w-full px-4 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Top 100"
                            />
                        </div>
                    </div>
                </SettingsSection>

                {/* Notifications Section */}
                <SettingsSection
                    title="Notifications"
                    icon={Bell}
                    isOpen={activeSection === 'notifications'}
                    onToggle={() => setActiveSection(activeSection === 'notifications' ? null : 'notifications')}
                >
                    <div className="space-y-4">
                        {/* Permission Status */}
                        {permission !== 'granted' && (
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                                <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">
                                    Notifications are currently {permission === 'denied' ? 'blocked' : 'not enabled'}
                                </p>
                                {permission !== 'denied' && (
                                    <button
                                        onClick={requestPermission}
                                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg transition-colors"
                                    >
                                        Enable Notifications
                                    </button>
                                )}
                            </div>
                        )}

                        <ToggleSetting
                            label="Enable All Notifications"
                            description="Receive smart reminders to stay on track"
                            checked={localSettings.notifications.enabled}
                            onChange={(checked) => setLocalSettings({
                                ...localSettings,
                                notifications: { ...localSettings.notifications, enabled: checked }
                            })}
                        />

                        <ToggleSetting
                            label="Evening Nudge"
                            description="Remind me if I haven't studied (6-9 PM)"
                            checked={localSettings.notifications.eveningNudge}
                            onChange={(checked) => setLocalSettings({
                                ...localSettings,
                                notifications: { ...localSettings.notifications, eveningNudge: checked }
                            })}
                            disabled={!localSettings.notifications.enabled}
                        />

                        <ToggleSetting
                            label="Streak Alerts"
                            description="Warn me if my streak is at risk (10 AM)"
                            checked={localSettings.notifications.streakAlert}
                            onChange={(checked) => setLocalSettings({
                                ...localSettings,
                                notifications: { ...localSettings.notifications, streakAlert: checked }
                            })}
                            disabled={!localSettings.notifications.enabled}
                        />

                        <ToggleSetting
                            label="Milestone Celebrations"
                            description="Celebrate when I hit chapter milestones"
                            checked={localSettings.notifications.milestones}
                            onChange={(checked) => setLocalSettings({
                                ...localSettings,
                                notifications: { ...localSettings.notifications, milestones: checked }
                            })}
                            disabled={!localSettings.notifications.enabled}
                        />
                    </div>
                </SettingsSection>

                {/* Study Goals Section */}
                <SettingsSection
                    title="Study Goals"
                    icon={Target}
                    isOpen={activeSection === 'study'}
                    onToggle={() => setActiveSection(activeSection === 'study' ? null : 'study')}
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                Daily Goal (chapters)
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="20"
                                value={localSettings.study.dailyGoal}
                                onChange={(e) => setLocalSettings({
                                    ...localSettings,
                                    study: { ...localSettings.study, dailyGoal: parseInt(e.target.value) || 1 }
                                })}
                                className="w-full px-4 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                Weekly Goal (chapters)
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="50"
                                value={localSettings.study.weeklyGoal}
                                onChange={(e) => setLocalSettings({
                                    ...localSettings,
                                    study: { ...localSettings.study, weeklyGoal: parseInt(e.target.value) || 1 }
                                })}
                                className="w-full px-4 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>
                </SettingsSection>

                {/* Data Section */}
                <SettingsSection
                    title="Data & Privacy"
                    icon={Download}
                    isOpen={activeSection === 'data'}
                    onToggle={() => setActiveSection(activeSection === 'data' ? null : 'data')}
                >
                    <div className="space-y-3">
                        <button className="w-full text-left px-4 py-3 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors">
                            <div className="font-medium text-zinc-900 dark:text-white">Export Progress Data</div>
                            <div className="text-sm text-zinc-500 dark:text-zinc-400">Download your study history as JSON</div>
                        </button>
                        <button
                            onClick={handleReset}
                            className="w-full text-left px-4 py-3 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors text-red-600 dark:text-red-400"
                        >
                            <div className="flex items-center gap-2 font-medium">
                                <RotateCcw size={16} />
                                Discard Changes
                            </div>
                            <div className="text-sm">Reset to last saved state</div>
                        </button>
                    </div>
                </SettingsSection>

                {/* About Section */}
                <SettingsSection
                    title="About"
                    icon={Info}
                    isOpen={activeSection === 'about'}
                    onToggle={() => setActiveSection(activeSection === 'about' ? null : 'about')}
                >
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-zinc-600 dark:text-zinc-400">Version</span>
                            <span className="font-medium text-zinc-900 dark:text-white">1.0.0</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-zinc-600 dark:text-zinc-400">User ID</span>
                            <span className="font-mono text-xs text-zinc-500">{user?.email?.slice(0, 12)}...</span>
                        </div>
                        <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800">
                            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                Built for CA aspirants to track their Final preparation journey with offline support and smart reminders.
                            </p>
                        </div>
                    </div>
                </SettingsSection>
            </div>

            {/* Floating Save Button */}
            {(hasChanges || showSavedMessage) && (
                <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-300">
                    <button
                        onClick={handleSave}
                        disabled={!hasChanges}
                        className={`
                            flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white shadow-2xl
                            transition-all duration-300 active:scale-95
                            ${showSavedMessage
                                ? 'bg-emerald-600 hover:bg-emerald-700'
                                : 'bg-indigo-600 hover:bg-indigo-700'
                            }
                        `}
                    >
                        {showSavedMessage ? (
                            <>
                                <Check size={20} className="animate-in zoom-in-50 duration-200" />
                                <span>Saved!</span>
                            </>
                        ) : (
                            <>
                                {isSaving ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Save size={20} />
                                )}
                                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}

// Helper Components
function SettingsSection({
    title,
    icon: Icon,
    isOpen,
    onToggle,
    children
}: {
    title: string;
    icon: any;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}) {
    return (
        <div className="glass rounded-2xl overflow-hidden">
            <button
                onClick={onToggle}
                className="w-full p-5 flex items-center justify-between hover:bg-white/50 dark:hover:bg-zinc-800/30 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <Icon size={20} className="text-indigo-600 dark:text-indigo-400" />
                    <span className="font-semibold text-zinc-900 dark:text-white">{title}</span>
                </div>
                <ChevronRight
                    size={20}
                    className={`text-zinc-400 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                />
            </button>
            {isOpen && (
                <div className="px-5 pb-5 border-t border-zinc-200/50 dark:border-zinc-700/50 pt-4">
                    {children}
                </div>
            )}
        </div>
    );
}

function ToggleSetting({
    label,
    description,
    checked,
    onChange,
    disabled = false
}: {
    label: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
}) {
    return (
        <label className={`flex items-start gap-3 ${disabled ? 'opacity-50' : 'cursor-pointer'}`}>
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => !disabled && onChange(e.target.checked)}
                disabled={disabled}
                className="mt-1 w-5 h-5 rounded border-zinc-300 dark:border-zinc-600 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex-1">
                <div className="font-medium text-zinc-900 dark:text-white">{label}</div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">{description}</div>
            </div>
        </label>
    );
}
