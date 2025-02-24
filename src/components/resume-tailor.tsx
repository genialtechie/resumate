'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TailoredRequirements } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle } from 'lucide-react';

interface ResumeTailorProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  requirements: TailoredRequirements;
  isLoading?: boolean;
  onGenerateResume?: () => void;
}

export function ResumeTailor({
  isOpen,
  onOpenChange,
  requirements,
  isLoading = false,
  onGenerateResume,
}: ResumeTailorProps) {
  return (
    <Sheet
      open={isOpen}
      onOpenChange={onOpenChange}
    >
      <SheetContent className="w-[400px] sm:w-[540px] overflow-hidden flex flex-col">
        <SheetHeader>
          <SheetTitle>Enhance Your Application</SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : requirements ? (
            <div className="space-y-6">
              {/* Requirements Section */}
              <div>
                <h3 className="font-semibold mb-3">Job Requirements</h3>
                <div className="space-y-2">
                  {requirements.keyRequirements.map((req, index) => {
                    const isMissing =
                      requirements.missingRequirements.includes(req);
                    return (
                      <div
                        key={index}
                        className={cn(
                          'p-3 rounded-lg flex items-start gap-3',
                          isMissing ? 'bg-destructive/10' : 'bg-emerald-500/10'
                        )}
                      >
                        {isMissing ? (
                          <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                        ) : (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                        )}
                        <span
                          className={cn(
                            'text-sm',
                            isMissing ? 'text-destructive' : 'text-emerald-700'
                          )}
                        >
                          {req}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Missing Skills Section */}
              {requirements.missingSkills.length > 0 ? (
                <div>
                  <h3 className="font-semibold mb-3">Missing Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {requirements.missingSkills.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className={cn(
                          'bg-destructive/10 text-destructive hover:bg-destructive/20',
                          'cursor-default transition-colors'
                        )}
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground">
                  No missing skills found
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No analysis available
            </div>
          )}
        </ScrollArea>

        <SheetFooter className="flex-shrink-0 px-4 py-4 border-t">
          <Button
            onClick={onGenerateResume}
            disabled={!requirements || isLoading}
            className="ml-auto w-full sm:w-auto"
          >
            Tailor Resume
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
