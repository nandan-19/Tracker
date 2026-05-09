
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/providers/AuthProvider";
import { SettingsProvider } from "@/providers/SettingsProvider";
import ClientLayout from "@/components/ClientLayout";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"] });
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'CA Final Tracker',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'INR',
  },
  description: 'A comprehensive study tracker and syllabus planner for ICAI CA Final students.',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://cafinaltracker.vercel.app'),
  alternates: {
    canonical: '/',
  },
  title: {
    default: "CA Final Tracker - Dashboard & Study Planner",
    template: "%s | CA Final Tracker"
  },
  description: "Track your CA Final preparation progress, set goals, and smash your exams.",
  keywords: ["CA Final", "Chartered Accountant", "Study Tracker", "Exam Prep", "Syllabus Tracker", "ICAI"],
  authors: [{ name: "CA Tracker App" }],
  creator: "CA Tracker App",
  verification: {
    google: "j_kssWnaeZPSVrdxpok8ds5e7wT-8F4TzYpIo4WQkE4",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://cafinaltracker.vercel.app",
    title: "CA Final Tracker",
    description: "Track your CA Final preparation progress, set goals, and smash your exams.",
    siteName: "CA Final Tracker",
    images: [
      {
        url: '/icons/icon.png',
        width: 512,
        height: 512,
        alt: 'CA Final Tracker Logo',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CA Final Tracker",
    description: "Track your CA Final preparation progress, set goals, and smash your exams.",
    images: ['/icons/icon.png'],
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: '#18181b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <SettingsProvider>
              <ClientLayout>{children}</ClientLayout>
            </SettingsProvider>
          </AuthProvider>
        </ThemeProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
