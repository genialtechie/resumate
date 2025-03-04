import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { ResumeContentObject } from '@/types';
import { resumeService } from '@/services/resume-service';
import { isValidResumeObject } from '@/lib/utils/validation';

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

  // Error handler
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

  // Local storage state
  const [editedResume, setEditedResume, clearEditedResume] = useLocalStorage<ResumeContentObject | null>(
    `edited_resume_${id}`,
    null,
    isValidResumeObject
  );

  const [coverLetterContent, setCoverLetterContent] = useLocalStorage<string>(
    `cover_letter_${id}`,
    ''
  );

  // Resume query
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

  // Initialize editedResume when parsedObject changes
  if (resume?.parsedObject && !editedResume) {
    setEditedResume(resume.parsedObject);
  }

  // File upload mutation
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

  // Save changes mutation
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

  // Cover letter generation mutation
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

  // Tailoring analysis mutation
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