import { memo, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
  Files,
  FileText,
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
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center">
        {/* Document type tabs - always visible */}
        <div className="flex">
          <Button
            onClick={() => onToggleView('editor')}
            variant="ghost"
            className={`rounded-none border-b-2 ${
              activeView === 'editor'
                ? 'border-featureBlue text-featureBlue bg-transparent'
                : 'border-transparent hover:border-featureBlue/50 text-slate-300 hover:text-white'
            } px-4 h-10 transition-colors`}
          >
            <Files className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">{`resume-${resumeName
              .split(' ')[0]
              .toLowerCase()}.pdf`}</span>
            <span
              className={`${
                activeView === 'editor' ? 'inline' : 'hidden'
              } sm:hidden`}
            >
              res...pdf
            </span>
          </Button>

          {hasCoverLetter && (
            <Button
              onClick={() => onToggleView('cover-letter')}
              variant="ghost"
              className={`rounded-none border-b-2 ${
                activeView === 'cover-letter'
                  ? 'border-featureBlue text-featureBlue bg-transparent'
                  : 'border-transparent hover:border-featureBlue/50 text-slate-300 hover:text-white'
              } px-4 h-10 transition-colors`}
            >
              <FileText className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{`cover-letter-${resumeName
                .split(' ')[0]
                .toLowerCase()}.pdf`}</span>
              <span
                className={`${
                  activeView === 'cover-letter' ? 'inline' : 'hidden'
                } sm:hidden`}
              >
                cov...pdf
              </span>
            </Button>
          )}
        </div>

        {/* Action buttons (only show when a document is active) */}
        {(activeView === 'editor' || activeView === 'cover-letter') && (
          <div className="ml-4 flex items-center">
            <div className="flex items-center bg-slate-800/30 border border-featureBlue/20 rounded-md px-2 py-1 gap-2">
              {activeView === 'editor' && (
                <>
                  <Button
                    onClick={handleCloseEditor}
                    variant="ghost"
                    size="sm"
                    className="text-slate-300 hover:text-featureBlue hover:bg-transparent p-1 h-8 w-8"
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
                          className="text-slate-300 hover:text-green-500 hover:bg-transparent p-1 h-8 w-8"
                          title="Accept All Changes"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={onRejectAllChanges}
                          variant="ghost"
                          size="sm"
                          className="text-slate-300 hover:text-red-500 hover:bg-transparent p-1 h-8 w-8"
                          title="Reject All Changes"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </>
              )}

              {activeView === 'cover-letter' && (
                <>
                  <Button
                    onClick={handleCloseEditor}
                    variant="ghost"
                    size="sm"
                    className="text-slate-300 hover:text-featureBlue hover:bg-transparent p-1 h-8 w-8"
                    title="Close Editor"
                  >
                    <X className="h-4 w-4" />
                  </Button>

                  <Button
                    onClick={onDownloadCoverLetter}
                    disabled={isDownloadingCoverLetter}
                    variant="ghost"
                    size="sm"
                    className="text-slate-300 hover:text-featureBlue hover:bg-transparent p-1 h-8 w-8"
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

              {/* Mobile dropdown - only show for resume editor */}
              {activeView === 'editor' && (
                <div className="md:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-300 hover:text-featureBlue hover:bg-transparent p-1 h-8 w-8"
                      >
                        <FileEdit className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-slate-900 border border-slate-800"
                    >
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
                            className="text-slate-300 hover:text-green-500 focus:text-green-500"
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Accept All Changes
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={onRejectAllChanges}
                            className="text-slate-300 hover:text-red-500 focus:text-red-500"
                          >
                            <X className="mr-2 h-4 w-4" />
                            Reject All Changes
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Upload button content for portal
  const uploadButtonContent = (
    <Button
      onClick={() => onToggleView('upload')}
      disabled={isUploading}
      variant="ghost"
      size="sm"
      className="text-slate-300 hover:text-featureBlue hover:bg-transparent"
      title="Change Resume"
    >
      {isUploading ? (
        <LoaderPinwheel className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Upload className="h-4 w-4 mr-2" />
      )}
      <span className="hidden md:inline">Change Resume</span>
    </Button>
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
