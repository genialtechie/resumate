import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <>
      {/* Top navbar with simple tab placeholders */}
      <div className="fixed top-0 left-0 right-0 z-10 flex justify-between items-center p-4 border-b border-slate-800/30 bg-background">
        {/* Simple skeleton for tabs */}
        <div className="flex-1 flex items-center gap-2">
          <div className="flex items-center">
            <Skeleton className="h-10 w-36 md:w-52 rounded-sm bg-slate-800/50" />
          </div>
        </div>

        {/* Basic right side action icons */}
        <div className="flex items-center">
          <Skeleton className="h-8 w-8 md:w-32 rounded-md bg-slate-800/50 mr-2" />
          <Skeleton className="h-8 w-12 rounded-md bg-slate-800/50" />
          <Skeleton className="h-8 w-8 rounded-full bg-slate-800/50 ml-4" />
        </div>
      </div>

      {/* Simple initial dashboard content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto mt-16">
          <Skeleton className="h-10 w-64 mb-6 bg-slate-800/50" />

          <div className="">
            <Skeleton className="h-7 w-3/4 mb-6 bg-slate-800/50" />

            <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 flex flex-col items-center justify-center">
              <Skeleton className="h-12 w-12 rounded-full mb-4 bg-slate-800/50" />
              <Skeleton className="h-5 w-48 mb-2 bg-slate-800/50" />
              <Skeleton className="h-4 w-64 bg-slate-800/50" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
