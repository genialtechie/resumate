'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FileEdit, Upload, Save, LoaderPinwheel } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ResumeMetadata, ResumeContentObject } from '@/types/resume';
import { UploadZone } from '@/components/upload';
import { useToast } from '@/hooks/use-toast';
import { JobDescriptionInput } from '@/components/job-input';
import PDFEditor from '@/components/pdf-editor';
import { isValidResumeObject } from '@/lib/validation';

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
  const [activeView, setActiveView] = useState<'none' | 'editor' | 'upload'>(
    'none'
  );
  const [jobDescription, setJobDescription] = useState('');
  const [editedResume, setEditedResume] = useState<ResumeContentObject | null>(
    null
  );
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const router = useRouter();

  // Configure React Query for resume data
  const {
    data: resume,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['resume', id],
    queryFn: () => fetchResume(id as string),
    retry: 1,
    staleTime: Infinity, // Consider data fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });

  // Load edited resume from localStorage on mount
  useEffect(() => {
    if (id) {
      const savedResume = localStorage.getItem(`edited_resume_${id}`);
      if (savedResume) {
        try {
          const parsed = JSON.parse(savedResume);
          // Validate the stored data
          if (isValidResumeObject(parsed)) {
            setEditedResume(parsed);
          } else {
            console.warn('Invalid resume data in localStorage');
            localStorage.removeItem(`edited_resume_${id}`);
          }
        } catch (err) {
          console.error('Failed to load saved resume:', err);
          localStorage.removeItem(`edited_resume_${id}`);
        }
      }
    }
  }, [id]);

  // Initialize editedResume when parsedObject changes (e.g., new file uploaded)
  useEffect(() => {
    if (resume?.parsedObject && !editedResume) {
      setEditedResume(resume.parsedObject);
    }
  }, [resume?.parsedObject, editedResume]);

  // Save edited resume to localStorage whenever it changes
  useEffect(() => {
    if (id && editedResume) {
      localStorage.setItem(`edited_resume_${id}`, JSON.stringify(editedResume));
    }
  }, [id, editedResume]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
      router.push('/');
    }
  }, [error, toast, router]);

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
      localStorage.removeItem(`edited_resume_${id}`);
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
      localStorage.removeItem(`edited_resume_${id}`);
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

  const toggleView = (view: 'editor' | 'upload') => {
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
      localStorage.removeItem(`edited_resume_${id}`);
      toast({
        title: 'Reset',
        description: 'Resume edits have been reset to original',
      });
    }
  }, [resume?.parsedObject, toast, id]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading resume...</p>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="flex min-h-screen items-center justify-center">
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
            {activeView === 'editor' ? 'Hide Editor' : 'Edit Resume'}
          </Button>
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
        </div>

        <div className="mt-8 transition-all duration-500 ease-in-out transform">
          <JobDescriptionInput
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
          />
        </div>
      </div>
    </div>
  );
}
