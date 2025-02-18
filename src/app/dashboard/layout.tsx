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
      <div className="flex flex-col min-h-screen w-full">
        <div className="flex justify-end p-4">
          <SidebarTrigger className="scale-125 bg-primary text-primary-foreground" />
        </div>
        <div className="flex">
          <Nav />
          <main className="min-h-screen w-full">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
