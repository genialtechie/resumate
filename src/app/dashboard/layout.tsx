'use client';
import { Nav } from '@/components/nav';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex flex-col h-screen w-full">
        <div className="flex justify-end p-4">
          <SidebarTrigger className="scale-125 bg-primary text-primary-foreground" />
        </div>
        <div className="flex h-[calc(100vh-4rem)]">
          <Nav />
          <main className="w-full overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
