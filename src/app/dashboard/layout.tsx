'use client';
import { Nav } from '@/components/nav';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { TokenDisplay } from '@/components/token-display';
import Image from 'next/image';
import Link from 'next/link';

// Optimize loading
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex flex-col h-screen w-full">
        <div className="flex justify-between items-center p-4">
          <Link
            href="/dashboard"
            className="flex-shrink-0"
          >
            <Image
              src="/og-icon.svg"
              alt="qualifies.me"
              width={40}
              height={40}
              priority
              className="h-8 w-8 text-gray-900"
            />
          </Link>
          <div className="flex items-center">
            <TokenDisplay />
            <SidebarTrigger className="ml-4 scale-125 bg-primary text-primary-foreground" />
          </div>
        </div>
        <div className="flex h-[calc(100vh-4rem)]">
          <Nav />
          <main className="w-full overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
