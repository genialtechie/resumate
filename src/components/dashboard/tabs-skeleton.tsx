import { Skeleton } from '@/components/ui/skeleton';
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';

/**
 * TabsSkeleton component
 * Creates skeleton loaders for tabs and action icons that
 * will display while content is loading
 */
export function TabsSkeleton() {
  const [mounted, setMounted] = useState(false);
  const [containers, setContainers] = useState<{
    tabs: HTMLElement | null;
    upload: HTMLElement | null;
  }>({ tabs: null, upload: null });

  // Only run portal creation after component mounts to avoid SSR issues
  useEffect(() => {
    setMounted(true);

    // Find the portal targets
    const tabsContainer = document.getElementById('document-tabs-container');
    const uploadContainer = document.getElementById('upload-button-container');

    if (tabsContainer && uploadContainer) {
      setContainers({
        tabs: tabsContainer,
        upload: uploadContainer,
      });
    }

    return () => {
      // Clean up function not needed for portals as React handles this
    };
  }, []);

  if (!mounted) return null;

  // Tab skeleton content
  const tabSkeletonContent = (
    <div className="flex-1 flex items-center gap-2">
      <div className="flex items-center">
        <Skeleton className="h-10 w-36 md:w-52 rounded-sm bg-slate-800/50" />
      </div>
    </div>
  );

  // Upload button skeleton content
  const uploadSkeletonContent = (
    <div className="flex items-center">
      <Skeleton className="h-8 w-8 md:w-32 rounded-md bg-slate-800/50 mr-2" />
    </div>
  );

  // Create portals when targets are available
  return (
    <>
      {containers.tabs && createPortal(tabSkeletonContent, containers.tabs)}
      {containers.upload &&
        createPortal(uploadSkeletonContent, containers.upload)}
    </>
  );
}
