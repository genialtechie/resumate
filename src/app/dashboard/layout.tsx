'use client';
import { Nav } from '@/components/nav';
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarOverlay,
} from '@/components/ui/sidebar';
import { TokenDisplay } from '@/components/dashboard/token-display';

// Optimize loading
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex flex-col h-[100dvh] w-full overflow-hidden">
        <SidebarOverlay />
        <div className="flex flex-wrap justify-between items-center p-4 shrink-0">
          {/* Sidebar trigger - now first element */}
          <div className="flex items-center shrink-0 order-1 mr-2">
            <SidebarTrigger className="scale-125 bg-primary text-primary-foreground" />
          </div>

          {/* Portal target for document tabs */}
          <div
            id="document-tabs-container"
            className="flex-grow flex items-center gap-2 min-w-0 order-2 max-w-[70%] xs:max-w-[80%] sm:ml-1"
          ></div>

          {/* Portal target for upload button - full width on very small screens */}
          <div
            id="upload-button-container"
            className="order-3 mt-2 sm:mt-0 sm:order-3 sm:mr-2 w-full sm:w-auto flex justify-end"
          ></div>

          {/* Token display */}
          <div className="flex items-center shrink-0 order-2 sm:order-4">
            <TokenDisplay />
          </div>
        </div>
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <Nav />
          <main className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-auto min-h-0">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
