import { memo } from 'react';
import { Button } from '@/components/ui/button';
import {
  FileEdit,
  Upload,
  Save,
  LoaderPinwheel,
  Download,
  ListRestart,
  Check,
  X,
  Repeat,
  MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ActionButtonsProps {
  activeView: 'none' | 'editor' | 'upload' | 'cover-letter';
  isUploading: boolean;
  isDownloading: boolean;
  isSaving: boolean;
  hasOriginalResume: boolean;
  hasCoverLetter: boolean;
  isDownloadingCoverLetter: boolean;
  onToggleView: (view: 'editor' | 'upload' | 'cover-letter') => void;
  onCloseEditor: () => void;
  onDownloadPDF: () => void;
  onResetEdits: () => void;
  onAcceptAllChanges: () => void;
  onRejectAllChanges: () => void;
  onSaveChanges: () => void;
  onDownloadCoverLetter: () => void;
}

export const ActionButtons = memo(function ActionButtons({
  activeView,
  isUploading,
  isDownloading,
  isSaving,
  hasOriginalResume,
  hasCoverLetter,
  isDownloadingCoverLetter,
  onToggleView,
  onCloseEditor,
  onDownloadPDF,
  onResetEdits,
  onAcceptAllChanges,
  onRejectAllChanges,
  onSaveChanges,
  onDownloadCoverLetter,
}: ActionButtonsProps) {
  return (
    <div className="flex gap-2 mb-4 flex-wrap items-center">
      <Button
        onClick={() => onToggleView('upload')}
        disabled={isUploading}
        variant="ghost"
        size="icon"
        className="rounded-none hover:text-primary transition-all duration-300 ease-in-out transform hover:scale-105"
        title="Change Resume"
      >
        {isUploading ? (
          <div className="animate-spin">
            <LoaderPinwheel className="h-4 w-4" />
          </div>
        ) : (
          <Upload className="h-4 w-4" />
        )}
      </Button>

      <Button
        onClick={
          activeView === 'editor' || activeView === 'cover-letter'
            ? onCloseEditor
            : () => onToggleView('editor')
        }
        variant="outline"
        className="rounded-none hover:text-primary hover:border-primary transition-all duration-300 ease-in-out transform hover:scale-105"
      >
        <FileEdit className="mr-2 h-4 w-4" />
        {activeView === 'editor' || activeView === 'cover-letter'
          ? 'Close Editor'
          : 'Edit Document'}
      </Button>

      {activeView === 'editor' && (
        <>
          {hasCoverLetter && (
            <Button
              onClick={() => onToggleView('cover-letter')}
              variant="outline"
              className="rounded-none hover:text-primary hover:border-primary transition-all duration-300 ease-in-out transform hover:scale-105"
              title="Switch to Cover Letter"
            >
              <Repeat className="h-4 w-4" />
            </Button>
          )}

          {/* Primary actions visible only on desktop */}
          <div className="hidden md:flex gap-4">
            <Button
              onClick={onDownloadPDF}
              disabled={isDownloading}
              variant="outline"
              className="rounded-none hover:text-primary hover:border-primary transition-all duration-300 ease-in-out transform hover:scale-105"
              title="Download PDF"
            >
              {isDownloading ? (
                <div className="animate-spin">
                  <LoaderPinwheel className="h-4 w-4" />
                </div>
              ) : (
                <Download className="h-4 w-4" />
              )}
            </Button>

            <Button
              onClick={onSaveChanges}
              disabled={isSaving}
              variant="default"
              className="rounded-none transition-all duration-300 ease-in-out transform hover:scale-105"
              title="Save Changes"
            >
              {isSaving ? (
                <div className="animate-spin">
                  <LoaderPinwheel className="h-4 w-4" />
                </div>
              ) : (
                <Save className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Actions in dropdown on mobile */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-none hover:text-primary hover:border-primary"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={onSaveChanges}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <LoaderPinwheel className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Changes
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={onDownloadPDF}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <LoaderPinwheel className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  Download PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onResetEdits}>
                  <ListRestart className="mr-2 h-4 w-4" />
                  Reset Changes
                </DropdownMenuItem>
                {hasOriginalResume && (
                  <>
                    <DropdownMenuItem onClick={onAcceptAllChanges}>
                      <Check className="mr-2 h-4 w-4" />
                      Accept All Changes
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onRejectAllChanges}>
                      <X className="mr-2 h-4 w-4" />
                      Reject All Changes
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Secondary actions visible on desktop */}
          <div className="hidden md:flex gap-4">
            <Button
              onClick={onResetEdits}
              variant="outline"
              title="Reset Changes"
              className="rounded-none hover:text-primary hover:border-primary transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              <ListRestart className="h-4 w-4" />
            </Button>

            {hasOriginalResume && (
              <>
                <Button
                  onClick={onAcceptAllChanges}
                  variant="outline"
                  title="Accept All Changes"
                  className="rounded-none hover:text-green-600 hover:border-green-600 transition-all duration-300 ease-in-out transform hover:scale-105"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  onClick={onRejectAllChanges}
                  variant="outline"
                  title="Reject All Changes"
                  className="rounded-none hover:text-red-600 hover:border-red-600 transition-all duration-300 ease-in-out transform hover:scale-105"
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </>
      )}

      {activeView === 'cover-letter' && hasCoverLetter && (
        <>
          <Button
            onClick={() => onToggleView('editor')}
            variant="outline"
            className="rounded-none hover:text-primary hover:border-primary transition-all duration-300 ease-in-out transform hover:scale-105"
            title="Switch to Resume"
          >
            <Repeat className="h-4 w-4" />
          </Button>
          <Button
            onClick={onDownloadCoverLetter}
            disabled={isDownloadingCoverLetter}
            variant="outline"
            className="rounded-none hover:text-primary hover:border-primary transition-all duration-300 ease-in-out transform hover:scale-105"
            title="Download Cover Letter PDF"
          >
            {isDownloadingCoverLetter ? (
              <div className="animate-spin">
                <LoaderPinwheel className="h-4 w-4" />
              </div>
            ) : (
              <Download className="h-4 w-4" />
            )}
          </Button>
        </>
      )}
    </div>
  );
});
