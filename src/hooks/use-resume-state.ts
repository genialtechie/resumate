import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { ResumeContentObject } from '@/types';
import { resumeService } from '@/services/resume-service';
import { isValidResumeObject } from '@/lib/utils/validation';

/**
 * Hook for managing the resume state
 * @param id - The ID of the resume
 * @param jobDescription - The job description for the cover letter
 * @param setActiveView - The function to set the active view
 * @returns The resume state
 */
export function useResumeState(
  id: string, 
  jobDescription: string,
  setActiveView: (view: 'none' | 'editor' | 'upload' | 'cover-letter') => void
) {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showTailorSheet, setShowTailorSheet] = useState(false);
  const [originalResume, setOriginalResume] = useState<ResumeContentObject | null>(null);

  /**
   * Error handler
   * @param error - The error to handle
   */
  const handleError = useCallback((error: Error) => {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: error.message || 'An error occurred',
    });

    if (error.message.includes('Unauthorized')) {
      router.push('/');
    }
  }, [toast, router]);

  /**
   * Local storage state
   * @returns The edited resume
   */
  const [editedResume, setEditedResume, clearEditedResume] = useLocalStorage<ResumeContentObject | null>(
    `edited_resume_${id}`,
    null,
    isValidResumeObject
  );

  const [coverLetterContent, setCoverLetterContent] = useLocalStorage<string>(
    `cover_letter_${id}`,
    ''
  );

  /**
   * Resume query
   * @returns The resume
   */
  const {
    data: resume,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: ['resume', id],
    queryFn: () => resumeService.fetchResume(id),
    retry: 1,
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
  });

  /**
   * Initialize editedResume when parsedObject changes
   */
  if (resume?.parsedObject && !editedResume) {
    setEditedResume(resume.parsedObject);
  }

  /**
   * File upload mutation
   * @param file - The file to upload
   * @returns The uploaded resume
   */
  const { mutate: changeResume, isPending: isUploading } = useMutation({
    mutationFn: (file: File) => resumeService.updateResume(id, file),
    onSuccess: (newResume) => {
      queryClient.setQueryData(['resume', id], newResume);
      setEditedResume(newResume.parsedObject || null);
      clearEditedResume();
      setCoverLetterContent('');
      setActiveView('editor');
      toast({
        title: 'Success',
        description: 'Resume updated successfully',
      });
    },
    onError: handleError,
  });

  /**
   * Save changes mutation
   * @param updates - The updates to save
   * @returns The saved resume
   */
  const { mutate: saveChanges, isPending: isSaving } = useMutation({
    mutationFn: (updates: ResumeContentObject) => resumeService.saveEditorChanges(id, updates),
    onSuccess: (newResume) => {
      queryClient.setQueryData(['resume', id], newResume);
      clearEditedResume();
      toast({
        title: 'Success',
        description: 'Changes saved successfully',
      });
    },
    onError: handleError,
  });

  /**
   * Generate a cover letter
   * @param data - The data to generate the cover letter from
   * @returns The generated cover letter
   */
  const { mutate: generateCoverLetter, isPending: isGeneratingCoverLetter } = useMutation({
    mutationFn: () => {
      if (!editedResume) throw new Error('No resume data available');
      return resumeService.generateCoverLetter(id, jobDescription, editedResume);
    },
    onSuccess: (data) => {
      setCoverLetterContent(data.generated.content);
      toast({
        title: 'Success',
        description: 'Cover letter generated successfully',
      });
    },
    onError: handleError,
  });

  /**
   * Tailoring analysis mutation
   * @returns The tailoring analysis
   */
  const {
    mutate: getTailoringAnalysis,
    isPending: isAnalyzing,
    data: tailoringData,
  } = useMutation({
    mutationFn: () => {
      if (!editedResume) throw new Error('No resume data available');
      return resumeService.getTailoringAnalysis(id, jobDescription, editedResume);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['tailoringResult', id], data);
      setShowTailorSheet(true);
      toast({
        title: 'Analysis Complete',
        description: 'Review the suggested changes to tailor your resume',
      });
    },
    onError: handleError,
  });

  /**
   * Reset the edited resume to the original resume
   */
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

  return {
    resume,
    editedResume,
    setEditedResume,
    coverLetterContent,
    setCoverLetterContent,
    originalResume,
    setOriginalResume,
    showTailorSheet,
    setShowTailorSheet,
    tailoringData,
    isLoading,
    isUploading,
    isSaving,
    isGeneratingCoverLetter,
    isAnalyzing,
    error,
    isError,
    changeResume,
    saveChanges,
    generateCoverLetter,
    getTailoringAnalysis,
    handleResetEdits,
  };
} 