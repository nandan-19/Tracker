import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Settings | CA Tracker',
    description: 'Manage your CA Tracker settings, profile, and study goals.',
    robots: {
        index: false,
        follow: false,
    },
};

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
