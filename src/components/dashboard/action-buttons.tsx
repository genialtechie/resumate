import { memo, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import {
  Upload,
  Save,
  LoaderPinwheel,
  Download,
  ListRestart,
  Check,
  X,
  Files,
  FileText,
  Menu,
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
  resumeName?: string;
  onToggleView: (view: 'editor' | 'upload' | 'cover-letter') => void;
  onDownloadPDF: () => void;
  onResetEdits: () => void;
  onAcceptAllChanges: () => void;
  onRejectAllChanges: () => void;
  onSaveChanges: () => void;
  onDownloadCoverLetter: () => void;
}

/**
 * Action buttons for the dashboard using React portals
 * @param props - The props for the action buttons
 * @returns The action buttons rendered via portals
 */
export const ActionButtons = memo(function ActionButtons({
  activeView,
  isUploading,
  isDownloading,
  isSaving,
  hasOriginalResume,
  hasCoverLetter,
  isDownloadingCoverLetter,
  resumeName = 'Resume',
  onToggleView,
  onDownloadPDF,
  onResetEdits,
  onAcceptAllChanges,
  onRejectAllChanges,
  onSaveChanges,
  onDownloadCoverLetter,
}: ActionButtonsProps) {
  // Refs for portal targets
  const tabsContainerRef = useRef<HTMLElement | null>(null);
  const uploadButtonContainerRef = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);

  // Find portal targets on mount and when they change
  useEffect(() => {
    const findPortalTargets = () => {
      const tabsContainer = document.getElementById('document-tabs-container');
      const uploadContainer = document.getElementById(
        'upload-button-container'
      );

      if (tabsContainer && uploadContainer) {
        tabsContainerRef.current = tabsContainer;
        uploadButtonContainerRef.current = uploadContainer;
        setMounted(true);
      } else {
        // If targets are not found, retry after a short delay
        setTimeout(findPortalTargets, 100);
      }
    };

    findPortalTargets();

    return () => {
      tabsContainerRef.current = null;
      uploadButtonContainerRef.current = null;
      setMounted(false);
    };
  }, []);

  // Close editor by setting activeView to 'none'
  const handleCloseEditor = () => {
    if (activeView !== 'none') {
      // Since toggleView now handles closing, we can just call it with the current active view
      // to toggle it off
      if (activeView === 'editor') {
        onToggleView('editor');
      } else if (activeView === 'cover-letter') {
        onToggleView('cover-letter');
      }
    }
  };

  // Tabs content for portal
  const tabsContent = (
    <div className="flex items-center w-full overflow-hidden">
      <div className="flex items-center min-w-0 overflow-hidden">
        <div className="flex sm:flex-row relative min-w-0 overflow-hidden">
          {/* Mobile document selector */}
          <div className="sm:hidden flex items-center">
            <div className="flex bg-slate-900/60 rounded-md p-1 border border-slate-800/80">
              {/* Resume button */}
              <Button
                onClick={() => onToggleView('editor')}
                variant="ghost"
                className={`rounded-md h-8 px-2 text-xs sm:text-sm transition-colors flex-shrink-0 ${
                  activeView === 'editor'
                    ? 'bg-slate-800 text-featureBlue shadow-sm'
                    : activeView === 'none'
                    ? 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Files className="h-4 w-4 mr-1 flex-shrink-0" />
                <span>Resume</span>
              </Button>

              {/* Cover letter button */}
              {hasCoverLetter && (
                <Button
                  onClick={() => onToggleView('cover-letter')}
                  variant="ghost"
                  className={`rounded-md h-8 px-2 text-xs sm:text-sm transition-colors flex-shrink-0 ${
                    activeView === 'cover-letter'
                      ? 'bg-slate-800 text-featureBlue shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <FileText className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span>Cover</span>
                </Button>
              )}
            </div>
          </div>

          {/* Desktop tabs - side by side */}
          <div className="hidden sm:flex min-w-0 overflow-hidden">
            <div className="flex bg-slate-900/60 rounded-md p-1 border border-slate-800/80">
              {/* Resume button */}
              <Button
                onClick={() => onToggleView('editor')}
                variant="ghost"
                className={`rounded-md h-9 px-3 text-sm transition-colors ${
                  activeView === 'editor'
                    ? 'bg-slate-800 text-featureBlue shadow-sm'
                    : activeView === 'none'
                    ? 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Files className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">{`resume-${resumeName
                  .split(' ')[0]
                  .toLowerCase()}.pdf`}</span>
              </Button>

              {/* Cover letter button */}
              {hasCoverLetter && (
                <Button
                  onClick={() => onToggleView('cover-letter')}
                  variant="ghost"
                  className={`rounded-md h-9 px-3 text-sm transition-colors ${
                    activeView === 'cover-letter'
                      ? 'bg-slate-800 text-featureBlue shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{`cover-letter-${resumeName
                    .split(' ')[0]
                    .toLowerCase()}.pdf`}</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons (only show when a document is active) */}
        {(activeView === 'editor' || activeView === 'cover-letter') && (
          <div className="ml-2 sm:ml-4 flex items-center flex-shrink-0">
            <div className="flex items-center bg-slate-800/30 border border-featureBlue/20 rounded-md px-1 sm:px-2 py-1 gap-1 sm:gap-2">
              {activeView === 'editor' && (
                <>
                  <Button
                    onClick={handleCloseEditor}
                    variant="ghost"
                    size="sm"
                    className="text-slate-300 hover:text-featureBlue hover:bg-transparent p-1 h-7 w-7 sm:h-8 sm:w-8"
                    title="Close Editor"
                  >
                    <X className="h-4 w-4" />
                  </Button>

                  {/* Desktop action buttons */}
                  <div className="hidden md:flex items-center gap-2">
                    <Button
                      onClick={onDownloadPDF}
                      disabled={isDownloading}
                      variant="ghost"
                      size="sm"
                      className="text-slate-300 hover:text-featureBlue hover:bg-transparent p-1 h-8 w-8"
                      title="Download PDF"
                    >
                      {isDownloading ? (
                        <LoaderPinwheel className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                    </Button>

                    <Button
                      onClick={onSaveChanges}
                      disabled={isSaving}
                      variant="ghost"
                      size="sm"
                      className="text-slate-300 hover:text-featureBlue hover:bg-transparent p-1 h-8 w-8"
                      title="Save Changes"
                    >
                      {isSaving ? (
                        <LoaderPinwheel className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                    </Button>

                    <Button
                      onClick={onResetEdits}
                      variant="ghost"
                      size="sm"
                      className="text-slate-300 hover:text-featureBlue hover:bg-transparent p-1 h-8 w-8"
                      title="Reset Changes"
                    >
                      <ListRestart className="h-4 w-4" />
                    </Button>

                    {hasOriginalResume && (
                      <>
                        <Button
                          onClick={onAcceptAllChanges}
                          variant="ghost"
                          size="sm"
                          className="text-slate-300 hover:text-emerald-400 hover:bg-transparent p-1 h-8 w-8"
                          title="Accept All Changes"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={onRejectAllChanges}
                          variant="ghost"
                          size="sm"
                          className="text-slate-300 hover:text-rose-400 hover:bg-transparent p-1 h-8 w-8"
                          title="Reject All Changes"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Mobile dropdown menu */}
                  <div className="md:hidden">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-300 hover:text-featureBlue hover:bg-transparent p-1 h-7 w-7 sm:h-8 sm:w-8"
                        >
                          <Menu className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-slate-900 border border-slate-800"
                      >
                        <DropdownMenuItem
                          onClick={() => onToggleView('upload')}
                          disabled={isUploading}
                          className="text-slate-300 hover:text-featureBlue focus:text-featureBlue"
                        >
                          {isUploading ? (
                            <LoaderPinwheel className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="mr-2 h-4 w-4" />
                          )}
                          Change Resume
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={onSaveChanges}
                          disabled={isSaving}
                          className="text-slate-300 hover:text-featureBlue focus:text-featureBlue"
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
                          className="text-slate-300 hover:text-featureBlue focus:text-featureBlue"
                        >
                          {isDownloading ? (
                            <LoaderPinwheel className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="mr-2 h-4 w-4" />
                          )}
                          Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={onResetEdits}
                          className="text-slate-300 hover:text-featureBlue focus:text-featureBlue"
                        >
                          <ListRestart className="mr-2 h-4 w-4" />
                          Reset Changes
                        </DropdownMenuItem>
                        {hasOriginalResume && (
                          <>
                            <DropdownMenuItem
                              onClick={onAcceptAllChanges}
                              className="text-slate-300 hover:text-emerald-400 focus:text-emerald-400"
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Accept All Changes
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={onRejectAllChanges}
                              className="text-slate-300 hover:text-rose-400 focus:text-rose-400"
                            >
                              <X className="mr-2 h-4 w-4" />
                              Reject All Changes
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </>
              )}

              {activeView === 'cover-letter' && (
                <>
                  <Button
                    onClick={handleCloseEditor}
                    variant="ghost"
                    size="sm"
                    className="text-slate-300 hover:text-featureBlue hover:bg-transparent p-1 h-7 w-7 sm:h-8 sm:w-8"
                    title="Close Editor"
                  >
                    <X className="h-4 w-4" />
                  </Button>

                  <Button
                    onClick={onDownloadCoverLetter}
                    disabled={isDownloadingCoverLetter}
                    variant="ghost"
                    size="sm"
                    className="text-slate-300 hover:text-featureBlue hover:bg-transparent p-1 h-7 w-7 sm:h-8 sm:w-8"
                    title="Download Cover Letter"
                  >
                    {isDownloadingCoverLetter ? (
                      <LoaderPinwheel className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Upload button content for portal
  const uploadButtonContent = (
    <>
      {(activeView === 'none' || activeView === 'upload') && (
        <Button
          onClick={() => onToggleView('upload')}
          disabled={isUploading}
          variant="ghost"
          size="sm"
          className="hidden md:flex text-slate-300 hover:text-featureBlue hover:bg-transparent"
          title="Change Resume"
        >
          {isUploading ? (
            <LoaderPinwheel className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Upload className="h-4 w-4 mr-2" />
          )}
          <span className="hidden md:inline">Change Resume</span>
        </Button>
      )}
    </>
  );

  // Create portals when targets are available
  return (
    <>
      {mounted &&
        tabsContainerRef.current &&
        createPortal(tabsContent, tabsContainerRef.current)}
      {mounted &&
        uploadButtonContainerRef.current &&
        createPortal(uploadButtonContent, uploadButtonContainerRef.current)}
    </>
  );
});
