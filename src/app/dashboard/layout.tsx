'use client';
import { Nav } from '@/components/nav';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { TokenDisplay } from '@/components/token-display';

export const metadata = {
  title: 'Dashboard | qualifies.me',
  description: 'Manage your resumes and cover letters',
};

// Improved preload hints for common resources
export const viewport = {
  themeColor: '#ffffff',
};

// Optimize loading
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex flex-col h-screen w-full">
        <div className="flex justify-end p-4">
          <TokenDisplay />
          <SidebarTrigger className="ml-4 scale-125 bg-primary text-primary-foreground" />
        </div>
        <div className="flex h-[calc(100vh-4rem)]">
          <Nav />
          <main className="w-full overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
