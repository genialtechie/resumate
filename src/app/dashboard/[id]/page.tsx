'use client';

import { useState, useCallback, lazy, Suspense, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut';
import { useResumeState } from '@/hooks/use-resume-state';
import { ErrorBoundary } from '@/components/dashboard/error-boundary';
import { ActionButtons } from '@/components/dashboard/action-buttons';
import { Skeleton } from '@/components/ui/skeleton';
import { JobDescriptionInput } from '@/components/dashboard/job-input';
import { ResumeTailor } from '@/components/dashboard/resume-tailor';
import { UploadZone } from '@/components/dashboard/upload';
import { Button } from '@/components/ui/button';
import { Pencil, LoaderPinwheel } from 'lucide-react';
import { resumeService } from '@/services/resume-service';
import { mergeResumeUpdates } from '@/lib/utils/editor-helpers';
import { TabsSkeleton } from '@/components/dashboard/tabs-skeleton';
import { useToast } from '@/hooks/use-toast';

// Lazy load heavy components
const PDFEditor = lazy(() => import('@/components/dashboard/pdf-editor'));
const CoverLetterEditor = lazy(
  () => import('@/components/dashboard/cover-letter-editor')
);

export default function Dashboard() {
  const { id } = useParams();
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<
    'none' | 'editor' | 'upload' | 'cover-letter'
  >('none');
  const [jobDescription, setJobDescription] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingCoverLetter, setIsDownloadingCoverLetter] =
    useState(false);

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

  // Toggle between document views - simple implementation
  const toggleView = useCallback(
    (view: 'editor' | 'upload' | 'cover-letter') => {
      if (activeView === view) {
        setActiveView('none');
      } else {
        setActiveView(view);
      }
    },
    [activeView]
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
      setIsDownloading(true);
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
    } finally {
      setIsDownloading(false);
    }
  }, [editedResume, id]);

  // Handle cover letter download
  const handleDownloadCoverLetter = useCallback(async () => {
    if (!coverLetterContent || !editedResume) return;
    try {
      setIsDownloadingCoverLetter(true);
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
    } finally {
      setIsDownloadingCoverLetter(false);
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

  const handleDisabledButtonClick = useCallback(
    (action: 'generate' | 'tailor') => {
      if (!resume?.parsedObject) {
        toast({
          title: 'No resume available',
          description: 'Please upload a resume first.',
          variant: 'destructive',
        });
        return;
      }

      if (!jobDescription) {
        toast({
          title: 'No job description',
          description: 'Please paste a job description first.',
          variant: 'destructive',
        });
        return;
      }

      if (isGeneratingCoverLetter || isAnalyzing) {
        toast({
          title: 'Please wait',
          description: `Currently ${
            action === 'generate'
              ? 'generating cover letter'
              : 'analyzing resume'
          }...`,
          variant: 'default',
        });
        return;
      }

      if (isUploading || isLoading) {
        toast({
          title: 'Please wait',
          description: 'Resume is being processed...',
          variant: 'default',
        });
        return;
      }
    },
    [
      resume?.parsedObject,
      jobDescription,
      isGeneratingCoverLetter,
      isAnalyzing,
      isUploading,
      isLoading,
      toast,
    ]
  );

  // Use conditional rendering to show either the skeleton or the actual buttons
  const actionButtons = isLoading ? (
    <TabsSkeleton />
  ) : (
    <ActionButtons
      activeView={activeView}
      isUploading={isUploading}
      isDownloading={isDownloading}
      isSaving={isSaving}
      hasOriginalResume={!!originalResume}
      hasCoverLetter={!!coverLetterContent}
      isDownloadingCoverLetter={isDownloadingCoverLetter}
      resumeName={editedResume?.name || 'Resume'}
      onToggleView={toggleView}
      onDownloadPDF={handleDownloadPDF}
      onResetEdits={handleResetEdits}
      onAcceptAllChanges={handleAcceptAllChanges}
      onRejectAllChanges={handleRejectAllChanges}
      onSaveChanges={handleSaveChanges}
      onDownloadCoverLetter={handleDownloadCoverLetter}
    />
  );

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-6">
        <div className="w-full md:w-3/5 md:mx-auto p-4">
          {/* Render the action buttons or skeletons */}
          {actionButtons}

          {/* Document Views - Simple, reliable implementation */}
          {activeView === 'upload' && (
            <div className="mb-4">
              <Suspense
                fallback={
                  <Skeleton className="h-48 w-full bg-slate-800/50 rounded-lg" />
                }
              >
                <UploadZone
                  onFileChange={(file) => {
                    if (file) changeResume(file);
                  }}
                  isPending={isUploading}
                />
              </Suspense>
            </div>
          )}

          {activeView === 'editor' && resume?.parsedObject && editedResume && (
            <div className="w-full">
              <Suspense
                fallback={
                  <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800 rounded-lg p-6">
                    <Skeleton className="h-96 w-full bg-slate-800/50" />
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
            <div className="w-full">
              <Suspense
                fallback={
                  <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800 rounded-lg p-6">
                    <Skeleton className="h-96 w-full bg-slate-800/50" />
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

          {/* Job Description Input */}
          <div className="mt-8">
            <Suspense
              fallback={
                <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800 rounded-lg p-6">
                  <Skeleton className="h-24 w-full bg-slate-800/50" />
                </div>
              }
            >
              <div className="mb-4 space-y-2">
                <h2 className="text-xl font-semibold text-featureBlue">
                  Optimize your application
                </h2>
                <p className="text-slate-100">
                  <span className="font-bold">
                    Verify your resume information and paste job description
                    below
                  </span>{' '}
                  then beem bop boop, you&apos;ll be able to generate a tailored
                  resume or cover letter
                </p>
              </div>
              <JobDescriptionInput
                jobDescription={jobDescription}
                setJobDescription={setJobDescription}
              >
                <Button
                  onClick={(e) => {
                    if (
                      isGeneratingCoverLetter ||
                      !resume?.parsedObject ||
                      !jobDescription ||
                      isUploading ||
                      isLoading ||
                      isAnalyzing
                    ) {
                      e.preventDefault();
                      handleDisabledButtonClick('generate');
                      return;
                    }
                    handleGenerateCoverLetter();
                  }}
                  variant="ghost"
                  className="flex-1 md:flex-initial text-xs md:text-sm flex gap-2 items-center whitespace-nowrap hover:text-featureBlue min-w-0"
                  title="Generate a cover letter from your resume"
                >
                  <Pencil className="h-4 w-4 shrink-0" />
                  {isGeneratingCoverLetter ? (
                    <div className="flex items-center gap-2 truncate">
                      <LoaderPinwheel className="h-4 w-4 animate-spin shrink-0" />
                      <span className="truncate">Generating...</span>
                    </div>
                  ) : (
                    <span className="truncate">Generate Cover Letter</span>
                  )}
                </Button>

                <Button
                  onClick={(e) => {
                    if (
                      isGeneratingCoverLetter ||
                      !jobDescription ||
                      isSaving ||
                      isUploading ||
                      isLoading ||
                      isAnalyzing
                    ) {
                      e.preventDefault();
                      handleDisabledButtonClick('tailor');
                      return;
                    }
                    getTailoringAnalysis();
                  }}
                  variant="ghost"
                  className="flex-1 md:flex-initial text-xs md:text-sm flex gap-2 items-center whitespace-nowrap hover:text-featureBlue min-w-0"
                  title="Tailor Resume"
                >
                  {isAnalyzing ? (
                    <>
                      <LoaderPinwheel className="h-4 w-4 animate-spin shrink-0" />
                      <span className="truncate">Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Pencil className="h-4 w-4 shrink-0" />
                      <span className="truncate">Tailor Resume</span>
                    </>
                  )}
                </Button>
              </JobDescriptionInput>
            </Suspense>
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
