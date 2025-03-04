'use client';

import { useState, useCallback, lazy, Suspense, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut';
import { useResumeState } from '@/hooks/use-resume-state';
import { ErrorBoundary } from '@/components/error-boundary';
import { ActionButtons } from '@/components/dashboard/action-buttons';
import { Skeleton } from '@/components/ui/skeleton';
import { JobDescriptionInput } from '@/components/job-input';
import { ResumeTailor } from '@/components/resume-tailor';
import { UploadZone } from '@/components/upload';
import { Button } from '@/components/ui/button';
import { Wand2, Pencil, LoaderPinwheel } from 'lucide-react';
import { resumeService } from '@/services/resume-service';
import { mergeResumeUpdates } from '@/lib/utils/editor-helpers';

// Lazy load heavy components
const PDFEditor = lazy(() => import('@/components/pdf-editor'));
const CoverLetterEditor = lazy(
  () => import('@/components/cover-letter-editor')
);

export default function Dashboard() {
  const { id } = useParams();
  const [activeView, setActiveView] = useState<
    'none' | 'editor' | 'upload' | 'cover-letter'
  >('none');
  const [jobDescription, setJobDescription] = useState('');

  // Use custom hook for resume state management
  const {
    resume,
    editedResume, // for editor
    setEditedResume,
    coverLetterContent,
    setCoverLetterContent,
    originalResume, // for diffs
    setOriginalResume,
    showTailorSheet,
    setShowTailorSheet,
    tailoringData,
    isLoading,
    isUploading,
    isSaving,
    isGeneratingCoverLetter,
    isAnalyzing,
    changeResume,
    saveChanges,
    generateCoverLetter,
    getTailoringAnalysis,
    handleResetEdits,
  } = useResumeState(id as string, jobDescription, setActiveView);

  // Function to close the editor
  const closeEditor = useCallback(() => {
    setActiveView('none');
  }, []);

  // View toggle handler
  const toggleView = useCallback(
    (view: 'editor' | 'upload' | 'cover-letter') => {
      setActiveView((currentView) => {
        // Handle switching between editors
        if (view === 'cover-letter' && currentView === 'editor') {
          return 'cover-letter';
        }
        if (view === 'editor' && currentView === 'cover-letter') {
          return 'editor';
        }
        if (view === 'editor' && currentView === 'none') {
          return 'editor';
        }

        // For all other cases (upload view or opening editor from closed state)
        return currentView === view ? 'none' : view;
      });
    },
    []
  );

  // Handle saving changes
  const handleSaveChanges = useCallback(() => {
    if (editedResume) {
      saveChanges(editedResume);
    }
  }, [editedResume, saveChanges]);

  // Handle accepting all changes
  const handleAcceptAllChanges = useCallback(() => {
    if (originalResume && editedResume) {
      setOriginalResume(null);
    }
  }, [originalResume, editedResume, setOriginalResume]);

  // Handle rejecting all changes
  const handleRejectAllChanges = useCallback(() => {
    if (originalResume && editedResume) {
      setEditedResume(structuredClone(originalResume));
      setOriginalResume(null);
    }
  }, [originalResume, editedResume, setEditedResume, setOriginalResume]);

  // Add a handler for section-specific diff acceptance
  const handleAcceptSectionDiff = useCallback(
    (sectionPath: string) => {
      if (!originalResume || !editedResume) return;

      const updatedOriginalResume = structuredClone(originalResume);
      const pathParts = sectionPath.split('.');
      let originalSection: Record<string, unknown> =
        updatedOriginalResume as unknown as Record<string, unknown>;
      let editedSection: Record<string, unknown> =
        editedResume as unknown as Record<string, unknown>;

      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        originalSection = originalSection[part] as Record<string, unknown>;
        editedSection = editedSection[part] as Record<string, unknown>;
        if (!originalSection || !editedSection) return;
      }

      const lastPath = pathParts[pathParts.length - 1];
      originalSection[lastPath] = editedSection[lastPath];
      setOriginalResume(updatedOriginalResume);
    },
    [originalResume, editedResume, setOriginalResume]
  );

  // Add a handler for rejecting section-specific diff
  const handleRejectSectionDiff = useCallback(
    (sectionPath: string) => {
      if (!originalResume || !editedResume) return;

      const updatedEditedResume = structuredClone(editedResume);
      const pathParts = sectionPath.split('.');
      let originalSection: Record<string, unknown> =
        originalResume as unknown as Record<string, unknown>;
      let editedSection: Record<string, unknown> =
        updatedEditedResume as unknown as Record<string, unknown>;

      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        originalSection = originalSection[part] as Record<string, unknown>;
        editedSection = editedSection[part] as Record<string, unknown>;
        if (!originalSection || !editedSection) return;
      }

      const lastPath = pathParts[pathParts.length - 1];
      editedSection[lastPath] = originalSection[lastPath];
      setEditedResume(updatedEditedResume);
    },
    [originalResume, editedResume, setEditedResume]
  );

  // Use custom keyboard shortcut hook for save (Ctrl+S or Cmd+S)
  useKeyboardShortcut(
    {
      key: 's',
      ctrlOrCmd: true,
      preventDefault: true,
    },
    handleSaveChanges,
    !isSaving && !!editedResume
  );

  // Clear originalResume when view changes away from editor
  useEffect(() => {
    if (activeView !== 'editor') {
      setOriginalResume(null);
    }
  }, [activeView, setOriginalResume]);

  // Handle PDF download
  const handleDownloadPDF = useCallback(async () => {
    if (!editedResume) return;
    try {
      const blob = await resumeService.generatePDF(id as string, editedResume);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resume-${editedResume.name.split(' ')[0] || id}-${
        new Date().toISOString().split('T')[0]
      }.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  }, [editedResume, id]);

  // Handle cover letter download
  const handleDownloadCoverLetter = useCallback(async () => {
    if (!coverLetterContent || !editedResume) return;
    try {
      const blob = await resumeService.generateCoverLetterPDF(
        id as string,
        coverLetterContent,
        editedResume.name,
        editedResume.contact
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cover-letter-${editedResume.name.split(' ')[0] || id}-${
        new Date().toISOString().split('T')[0]
      }.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading cover letter PDF:', error);
    }
  }, [coverLetterContent, editedResume, id]);

  // Handle applying tailored changes
  const handleApplyTailoredChanges = useCallback(() => {
    if (!editedResume || !tailoringData?.tailoringResult?.suggestedUpdates)
      return;
    setOriginalResume(structuredClone(editedResume));
    const updatedResume = mergeResumeUpdates(
      editedResume,
      tailoringData.tailoringResult.suggestedUpdates
    );
    setEditedResume(updatedResume);
    setShowTailorSheet(false);
    setActiveView('editor');
  }, [
    editedResume,
    tailoringData,
    setEditedResume,
    setOriginalResume,
    setShowTailorSheet,
    setActiveView,
  ]);

  // Handle cover letter generation and view switching
  const handleGenerateCoverLetter = useCallback(() => {
    generateCoverLetter(undefined, {
      onSuccess: () => {
        toggleView('cover-letter');
      },
    });
  }, [generateCoverLetter, toggleView]);

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-6">
        <div className="w-full md:w-3/5 md:mx-auto p-4">
          {/* Action Buttons */}
          <ActionButtons
            activeView={activeView}
            isUploading={isUploading}
            isDownloading={false}
            isSaving={isSaving}
            hasOriginalResume={!!originalResume}
            hasCoverLetter={!!coverLetterContent}
            isDownloadingCoverLetter={false}
            onToggleView={toggleView}
            onCloseEditor={closeEditor}
            onDownloadPDF={handleDownloadPDF}
            onResetEdits={handleResetEdits}
            onAcceptAllChanges={handleAcceptAllChanges}
            onRejectAllChanges={handleRejectAllChanges}
            onSaveChanges={handleSaveChanges}
            onDownloadCoverLetter={handleDownloadCoverLetter}
          />

          {/* Document Editor */}
          <div
            className={`transition-all duration-500 ease-in-out transform ${
              activeView === 'none' ? 'animate-fadeOut' : 'animate-fadeIn'
            }`}
          >
            {activeView === 'upload' && (
              <div className="mb-4 animate-fadeIn">
                <Suspense fallback={<Skeleton className="h-48 w-full" />}>
                  <UploadZone
                    onFileChange={(file) => {
                      if (file) changeResume(file);
                    }}
                  />
                </Suspense>
              </div>
            )}

            {activeView === 'editor' &&
              resume?.parsedObject &&
              editedResume && (
                <div className="w-full animate-fadeIn">
                  <Suspense
                    fallback={
                      <div className="bg-white rounded-lg shadow-md p-6">
                        <Skeleton className="h-96 w-full" />
                      </div>
                    }
                  >
                    <PDFEditor
                      editedResume={editedResume}
                      setEditedResume={setEditedResume}
                      originalResume={originalResume}
                      showDiffs={originalResume !== null}
                      onAcceptSection={handleAcceptSectionDiff}
                      onRejectSection={handleRejectSectionDiff}
                    />
                  </Suspense>
                </div>
              )}

            {activeView === 'cover-letter' && coverLetterContent && (
              <div className="w-full animate-fadeIn">
                <Suspense
                  fallback={
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <Skeleton className="h-96 w-full" />
                    </div>
                  }
                >
                  <CoverLetterEditor
                    content={coverLetterContent}
                    onContentChange={setCoverLetterContent}
                    name={editedResume?.name}
                    contact={editedResume?.contact}
                  />
                </Suspense>
              </div>
            )}
          </div>

          {/* Job Description Input and Action Buttons */}
          <div className="mt-8 transition-all duration-500 ease-in-out transform">
            <Suspense fallback={<Skeleton className="h-24 w-full" />}>
              <JobDescriptionInput
                jobDescription={jobDescription}
                setJobDescription={setJobDescription}
              />
            </Suspense>
            <div className="mt-4 flex flex-col sm:flex-row gap-4">
              {/* Generate Cover Letter Button */}
              <Button
                onClick={handleGenerateCoverLetter}
                disabled={
                  isGeneratingCoverLetter ||
                  !jobDescription ||
                  isSaving ||
                  isUploading ||
                  isLoading ||
                  isAnalyzing
                }
                variant="outline"
                className="w-full sm:w-auto rounded-none hover:text-primary hover:border-primary transition-all duration-300 ease-in-out transform hover:scale-105"
              >
                <Wand2 className="mr-2 h-4 w-4" />
                {isGeneratingCoverLetter
                  ? 'Generating...'
                  : 'Generate Cover Letter'}
              </Button>

              {/* Tailor Resume Button */}
              <Button
                onClick={() => getTailoringAnalysis()}
                variant="outline"
                disabled={
                  isGeneratingCoverLetter ||
                  !jobDescription ||
                  isSaving ||
                  isUploading ||
                  isLoading ||
                  isAnalyzing
                }
                className="w-full sm:w-auto rounded-none hover:text-primary hover:border-primary transition-all duration-300 ease-in-out transform hover:scale-105"
                title="Tailor Resume"
              >
                {isAnalyzing ? (
                  <>
                    <LoaderPinwheel className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Tailor Resume
                    <Pencil className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Resume Tailoring Sheet */}
          <Suspense fallback={null}>
            <ResumeTailor
              isOpen={showTailorSheet}
              onOpenChange={setShowTailorSheet}
              requirements={tailoringData?.tailoringResult?.requirements}
              onGenerateResume={handleApplyTailoredChanges}
              isLoading={isAnalyzing}
            />
          </Suspense>
        </div>
      </div>
    </ErrorBoundary>
  );
}
