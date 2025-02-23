'use client';

import { useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  FileEdit,
  Upload,
  Save,
  LoaderPinwheel,
  Wand2,
  Pencil,
  FileStack,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ResumeMetadata, ResumeContentObject } from '@/types/resume';
import { UploadZone } from '@/components/upload';
import { useToast } from '@/hooks/use-toast';
import { JobDescriptionInput } from '@/components/job-input';
import PDFEditor from '@/components/pdf-editor';
import CoverLetterEditor from '@/components/cover-letter-editor';
import { isValidResumeObject } from '@/lib/validation';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut';
import { ResumeTailor } from '@/components/resume-tailor';

const fetchResume = async (id: string): Promise<ResumeMetadata> => {
  const response = await fetch(`/api/resume/${id}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch resume');
  }
  return response.json();
};

const updateResume = async (
  id: string,
  file: File
): Promise<ResumeMetadata> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`/api/resume/${id}`, {
    method: 'PUT',
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to update resume');
  }

  return data;
};

const saveEditorChanges = async (
  id: string,
  updates: ResumeContentObject
): Promise<ResumeMetadata> => {
  const response = await fetch(`/api/resume/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to save changes');
  }

  return data;
};

export default function Dashboard() {
  const { id } = useParams();
  const [activeView, setActiveView] = useState<
    'none' | 'editor' | 'upload' | 'cover-letter'
  >('none');
  const [jobDescription, setJobDescription] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const router = useRouter();
  const [showTailorSheet, setShowTailorSheet] = useState(false);

  // Use custom localStorage hooks
  const [editedResume, setEditedResume, clearEditedResume] =
    useLocalStorage<ResumeContentObject | null>(
      `edited_resume_${id}`,
      null,
      isValidResumeObject
    );

  const [coverLetterContent, setCoverLetterContent] = useLocalStorage<string>(
    `cover_letter_${id}`,
    ''
  );

  // Configure React Query for resume data
  const {
    data: resume,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['resume', id],
    queryFn: () => fetchResume(id as string),
    retry: 1,
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
  });

  // Handle errors using useEffect
  if (error) {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: error.message,
    });
    router.push('/');
  }

  // Initialize editedResume when parsedObject changes
  if (resume?.parsedObject && !editedResume) {
    setEditedResume(resume.parsedObject);
  }

  // Mutation for file uploads
  const { mutate: changeResume, isPending: isUploading } = useMutation({
    mutationFn: (file: File) => updateResume(id as string, file),
    onMutate: () => {
      toast({
        title: 'Uploading',
        description: 'Processing your resume...',
      });
    },
    onSuccess: (newResume) => {
      queryClient.setQueryData(['resume', id], newResume);
      setEditedResume(newResume.parsedObject || null);
      clearEditedResume();
      setActiveView('none');
      toast({
        title: 'Success',
        description: 'Resume updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update resume',
      });
    },
  });

  // Mutation for editor changes
  const { mutate: saveChanges, isPending: isSaving } = useMutation({
    mutationFn: (updates: ResumeContentObject) =>
      saveEditorChanges(id as string, updates),
    onSuccess: (newResume) => {
      queryClient.setQueryData(['resume', id], newResume);
      clearEditedResume();
      toast({
        title: 'Success',
        description: 'Changes saved successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to save changes',
      });
    },
  });

  // Cover letter generation mutation
  const { mutate: generateCoverLetter, isPending: isGeneratingCoverLetter } =
    useMutation({
      mutationFn: async () => {
        if (!jobDescription) {
          throw new Error('Please enter a job description first');
        }

        if (!editedResume && !resume?.parsedObject) {
          throw new Error('No resume data available');
        }

        const response = await fetch(`/api/resume/${id}/cover-letter`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jobDescription,
            tone: 'professional',
            resumeObject: editedResume || resume?.parsedObject,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate cover letter');
        }

        return response.json();
      },
      onSuccess: (data) => {
        setCoverLetterContent(data.generated.content);
        toast({
          title: 'Success',
          description: 'Cover letter generated successfully',
        });
        toggleView('cover-letter');
      },
      onError: (error: Error) => {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'Failed to generate cover letter',
        });
      },
    });

  // Add tailoring mutation
  const {
    mutate: getTailoringAnalysis,
    isPending: isAnalyzing,
    data: tailoringData,
  } = useMutation({
    mutationFn: async () => {
      if (!jobDescription) {
        throw new Error('Please enter a job description first');
      }

      if (!editedResume && !resume?.parsedObject) {
        throw new Error('No resume data available');
      }

      const response = await fetch(`/api/resume/${id}/tailor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobDescription,
          resumeObject: editedResume || resume?.parsedObject,
          options: {
            focusAreas: ['summary', 'skills', 'experience'],
            maxSuggestedSkills: 10,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze resume');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['tailoringResult', id], data);

      setShowTailorSheet(true);
      toast({
        title: 'Analysis Complete',
        description: 'Review the suggested changes to tailor your resume',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to analyze resume',
      });
    },
  });

  const toggleView = (view: 'editor' | 'upload' | 'cover-letter') => {
    setActiveView((currentView) => (currentView === view ? 'none' : view));
  };

  // Handle saving changes
  const handleSaveChanges = useCallback(() => {
    if (editedResume) {
      saveChanges(editedResume);
    }
  }, [editedResume, saveChanges]);

  // Reset functionality
  const handleResetEdits = useCallback(() => {
    if (resume?.parsedObject) {
      setEditedResume(resume.parsedObject);
      clearEditedResume();
      toast({
        title: 'Reset',
        description: 'Resume edits have been reset to original',
      });
    }
  }, [resume?.parsedObject, setEditedResume, clearEditedResume, toast]);

  // Use custom keyboard shortcut hook for save (Ctrl+S or Cmd+S)
  useKeyboardShortcut(
    {
      key: 's',
      ctrlOrCmd: true,
      preventDefault: true,
    },
    () => {
      if (editedResume && !isSaving) {
        handleSaveChanges();
        toast({
          title: 'Saving...',
          description: 'Your changes are being saved',
        });
      } else if (isSaving) {
        toast({
          title: 'Please wait',
          description: 'Already saving changes...',
        });
      } else {
        toast({
          title: 'Nothing to save',
          description: 'No changes have been made to save',
        });
      }
    },
    true
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <p>Loading resume...</p>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="flex items-center justify-center">
        <p>Failed to load resume. Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full md:w-3/5 p-4">
        <div className="flex gap-4 mb-4">
          <Button
            onClick={() => toggleView('upload')}
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
            onClick={() => toggleView('editor')}
            variant="outline"
            className="rounded-none hover:text-primary hover:border-primary transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            <FileEdit className="mr-2 h-4 w-4" />
            {activeView === 'editor' || activeView === 'cover-letter'
              ? 'Hide Editor'
              : 'Edit Document'}
          </Button>
          {coverLetterContent &&
            (activeView === 'editor' || activeView === 'cover-letter') && (
              <Button
                onClick={() => {
                  if (activeView === 'cover-letter') {
                    toggleView('editor');
                  } else {
                    toggleView('cover-letter');
                  }
                }}
                variant="outline"
                title={
                  activeView === 'cover-letter'
                    ? 'Show Resume'
                    : 'Show Cover Letter'
                }
                className="rounded-none hover:text-primary hover:border-primary transition-all duration-300 ease-in-out transform hover:scale-105"
              >
                <FileStack className="h-4 w-4" />
              </Button>
            )}
          {/* Save and Reset Buttons */}
          {activeView === 'editor' && (
            <>
              <Button
                onClick={handleResetEdits}
                variant="outline"
                className="rounded-none hover:text-primary hover:border-primary transition-all duration-300 ease-in-out transform hover:scale-105"
              >
                Reset Changes
              </Button>
              <Button
                onClick={handleSaveChanges}
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
            </>
          )}
        </div>

        <div
          className={`transition-all duration-500 ease-in-out transform ${
            activeView === 'none' ? 'animate-fadeOut' : 'animate-fadeIn'
          }`}
        >
          {activeView === 'upload' && (
            <div className="mb-4 animate-fadeIn">
              <UploadZone
                onFileChange={(file) => {
                  if (file) changeResume(file);
                }}
              />
            </div>
          )}

          {activeView === 'editor' && resume?.parsedObject && editedResume && (
            <div className="w-full animate-fadeIn">
              <PDFEditor
                editedResume={editedResume}
                setEditedResume={setEditedResume}
              />
            </div>
          )}

          {activeView === 'cover-letter' && coverLetterContent && (
            <div className="w-full animate-fadeIn">
              <CoverLetterEditor
                content={coverLetterContent}
                onContentChange={setCoverLetterContent}
              />
            </div>
          )}
        </div>

        <div className="mt-8 transition-all duration-500 ease-in-out transform">
          <JobDescriptionInput
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
          />
        </div>
        <div className="mt-4 flex flex-row gap-4">
          {/* Generate Cover Letter Button */}
          <Button
            onClick={() => {
              generateCoverLetter();
            }}
            disabled={
              isGeneratingCoverLetter ||
              !jobDescription ||
              isSaving ||
              isUploading ||
              isLoading ||
              isAnalyzing
            }
            variant="outline"
            className="rounded-none hover:text-primary hover:border-primary transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            <Wand2 className="mr-2 h-4 w-4" />
            {isGeneratingCoverLetter
              ? 'Generating...'
              : 'Generate Cover Letter'}
          </Button>
          {/* Tailor Resume Button */}
          <Button
            onClick={() => {
              getTailoringAnalysis();
            }}
            variant="outline"
            disabled={
              isGeneratingCoverLetter ||
              !jobDescription ||
              isSaving ||
              isUploading ||
              isLoading ||
              isAnalyzing
            }
            className="rounded-none hover:text-primary hover:border-primary transition-all duration-300 ease-in-out transform hover:scale-105"
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

        {/* Add ResumeTailor component */}
        <ResumeTailor
          isOpen={showTailorSheet}
          onOpenChange={setShowTailorSheet}
          requirements={tailoringData?.tailoringResult?.requirements}
          isLoading={isAnalyzing}
        />
      </div>
    </div>
  );
}
