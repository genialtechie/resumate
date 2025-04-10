import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Suspense } from 'react';
import localFont from 'next/font/local';
import { Bricolage_Grotesque } from 'next/font/google';
// import { cn } from '@/lib/utils';

const satoshi = localFont({
  src: './fonts/satoshi/Satoshi-Variable.woff2',
  variable: '--font-satoshi',
  display: 'swap',
});

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  display: 'swap',
});

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'https://qualifies.me';

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'qualifies.me | AI-Powered Job Application Suite',
  description:
    'Your all-in-one job application toolkit. Optimize resumes, generate cover letters, track applications, and analyze job descriptions with AI to increase your success rate.',
  keywords: [
    'resume',
    'resume builder',
    'resume template',
    'resume maker',
    'ai resume',
    'ai resume builder',
    'ai resume maker',
    'ai resume template',
    'ai resume editor',
    'ai resume generator',
    'ai resume writer',
    'ai resume optimizer',
    'ai resume analyzer',
    'career qualification',
    'resume optimization',
    'skills analysis',
    'job matching',
    'career advancement',
    'professional development',
    'AI career tools',
    'job application tracker',
    'application management',
    'job description analyzer',
    'job search tools',
    'career toolkit',
    'cover letter generator',
    'cover letter maker',
    'cover letter template',
    'cover letter editor',
    'cover letter writer',
    'cover letter optimizer',
    'cover letter analyzer',
  ],
  authors: [{ name: 'qualifies.me' }],
  creator: 'qualifies.me',
  publisher: 'qualifies.me',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'qualifies.me',
    title: 'qualifies.me | AI-Powered Job Application Suite',
    description:
      'Streamline your job search with our comprehensive AI toolkit. From resume optimization and cover letter generation to application tracking, we help you manage and improve every step of your job applications.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'qualifies.me - AI-Powered Job Application Suite',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'qualifies.me | AI-Powered Job Application Suite',
    description:
      'Streamline your job search with our comprehensive AI toolkit. From resume optimization and cover letter generation to application tracking, we help you manage and improve every step of your job applications.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="dark"
    >
      <body className={`${satoshi.variable} ${bricolage.variable}`}>
        <Providers>
          <Suspense
            fallback={
              <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            }
          >
            {children}
          </Suspense>
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
