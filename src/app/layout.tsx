import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'qualifies.me | Smart Career Qualification',
  description:
    'Transform your career journey with qualifies.me. Our AI-powered platform provides smart resume tailoring, skills gap analysis, and job matching to help you stand out in your job applications.',
  keywords: [
    'career qualification',
    'resume optimization',
    'skills analysis',
    'job matching',
    'career advancement',
    'professional development',
    'AI career tools',
  ],
  authors: [{ name: 'qualifies.me' }],
  creator: 'qualifies.me',
  publisher: 'qualifies.me',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'qualifies.me',
    title: 'qualifies.me | Smart Career Qualification Platform',
    description:
      'Transform your career journey with intelligent resume optimization, skills analysis, and job matching.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'qualifies.me - Smart Career Qualification Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'qualifies.me | Smart Career Qualification Platform',
    description:
      'Transform your career journey with intelligent resume optimization, skills analysis, and job matching.',
    images: ['/og-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
