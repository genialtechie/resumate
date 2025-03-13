'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import {
  DiffPart,
  hasTextDifferences,
  generateOptimizedDiff,
} from '@/lib/utils/diff-utils';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';

interface InlineDiffEditorProps {
  oldText: string;
  newText: string;
  className?: string;
  onSave?: (value: string) => void;
  onAccept?: () => void;
  onReject?: () => void;
  placeholder?: string;
  minHeight?: string;
  readOnly?: boolean;
  showTooltips?: boolean;
}

/**
 * Inline Diff Editor component
 * @description A unified component for displaying text diffs with inline editing capabilities.
 * - Shows word-level diffs between old and new text
 * - Allows accepting or rejecting changes
 */
const InlineDiffEditor: React.FC<InlineDiffEditorProps> = ({
  oldText,
  newText,
  className,
  onSave,
  onAccept,
  onReject,
  placeholder = '',
  minHeight,
  readOnly = false,
  showTooltips = true,
}) => {
  const [diffParts, setDiffParts] = useState<DiffPart[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);
  const hasDifferences = hasTextDifferences(oldText, newText);

  // Calculate diff when texts change
  useEffect(() => {
    if (hasDifferences) {
      generateOptimizedDiff(oldText, newText, setDiffParts);
    } else {
      setDiffParts([{ value: newText || '' }]);
    }
  }, [oldText, newText, hasDifferences]);

  // Handle editable div content changes
  const handleContentChange = () => {
    if (!contentRef.current) return;
    const newContent = contentRef.current.innerText;

    if (onSave) {
      onSave(newContent);
    }
  };

  // Accept the changes (use newText)
  const handleAcceptChanges = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSave) {
      onSave(newText);
    }
    if (onAccept) {
      onAccept();
    }
  };

  // Reject the changes (revert to oldText)
  const handleRejectChanges = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSave) {
      onSave(oldText);
    }
    if (onReject) {
      onReject();
    }
  };

  // If no differences exist, just render editable content
  if (!hasDifferences) {
    return (
      <div className={cn('relative group', className)}>
        <div
          ref={contentRef}
          className="p-3 min-w-full outline-none focus:outline-none text-slate-100"
          style={{ minHeight }}
          contentEditable={!readOnly}
          suppressContentEditableWarning={true}
          onBlur={!readOnly ? handleContentChange : undefined}
        >
          {newText || placeholder}
        </div>
      </div>
    );
  }

  // Main diff view with accept/reject controls
  return (
    <TooltipProvider>
      <div className={cn('relative group pt-10', className)}>
        {/* Accept/Reject buttons for diff view */}
        {hasDifferences && !readOnly && (
          <div className="absolute right-2 top-2 z-20 flex items-center gap-1 bg-slate-900/70 backdrop-blur-sm p-1 rounded shadow-sm border border-slate-700">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 hover:bg-emerald-950 border border-slate-800"
                  onClick={handleAcceptChanges}
                >
                  <Check className="h-4 w-4 text-emerald-400" />
                </Button>
              </TooltipTrigger>
              {showTooltips && (
                <TooltipContent>
                  <p>Accept changes</p>
                </TooltipContent>
              )}
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 hover:bg-rose-950 border border-slate-800"
                  onClick={handleRejectChanges}
                >
                  <X className="h-4 w-4 text-rose-400" />
                </Button>
              </TooltipTrigger>
              {showTooltips && (
                <TooltipContent>
                  <p>Reject changes</p>
                </TooltipContent>
              )}
            </Tooltip>
          </div>
        )}

        {/* Editable Diff content*/}
        <div
          ref={contentRef}
          className="p-3 min-w-full outline-none focus:outline-none text-slate-100"
          style={{ minHeight }}
          contentEditable={!readOnly}
          suppressContentEditableWarning={true}
          onBlur={!readOnly ? handleContentChange : undefined}
        >
          {diffParts.map((part, i) => (
            <span
              key={i}
              className={cn(
                part.added && 'text-emerald-300 font-medium bg-emerald-950/60',
                part.removed &&
                  'line-through text-rose-300 bg-rose-950/60 opacity-80'
              )}
            >
              {part.value}
            </span>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default InlineDiffEditor;
