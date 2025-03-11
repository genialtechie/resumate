'use client';
import { Nav } from '@/components/nav';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { TokenDisplay } from '@/components/dashboard/token-display';

// Optimize loading
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex flex-col h-screen w-full overflow-hidden">
        <div className="flex justify-between items-center p-4 border-slate-800/30">
          {/* Portal target for document tabs */}
          <div
            id="document-tabs-container"
            className="flex-1 flex items-center gap-2"
          ></div>

          <div className="flex items-center">
            {/* Portal target for upload button */}
            <div
              id="upload-button-container"
              className="mr-2"
            ></div>
            <TokenDisplay />
            <SidebarTrigger className="ml-4 scale-125 bg-primary text-primary-foreground" />
          </div>
        </div>
        <div className="flex flex-1 overflow-hidden">
          <Nav />
          <main className="w-full h-full overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
