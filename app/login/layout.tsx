import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Login to your Account',
    description: 'Log in to your CA Final Tracker account to resume your preparation journey.',
};

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
