
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

export const metadata: Metadata = {
  metadataBase: new URL('https://cafinaltracker.vercel.app'),
  title: {
    default: "CA Final Tracker",
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
  },
  twitter: {
    card: "summary_large_image",
    title: "CA Final Tracker",
    description: "Track your CA Final preparation progress, set goals, and smash your exams.",
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
