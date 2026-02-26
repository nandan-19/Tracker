import DashboardClient from '@/components/DashboardClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'View your overall CA Final study progress and daily goals.',
};

export default function Page() {
  return <DashboardClient />;
}
