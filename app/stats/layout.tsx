import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Study Stats',
    description: 'View your detailed study statistics and progress.',
    robots: {
        index: false,
        follow: false,
    },
};

export default function StatsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
