'use client';

import { UploadZone } from '@/components/dashboard/upload';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';

export default function DashboardFallback() {
  const { toast } = useToast();
  const router = useRouter();

  // Use React Query mutation for file upload
  const { mutate: uploadResume, isPending } = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/resume', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload resume');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Success',
        description: 'Resume processed successfully',
      });
      router.push(`/dashboard/${data.id}`);
    },
    onError: (error: Error) => {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to upload file: ${
          error.message || 'Unknown error'
        }`,
      });
    },
  });

  const handleUpload = (file: File | null) => {
    if (!file) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a file first',
      });
      return;
    }

    uploadResume(file);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto mt-10">
        <h1 className="text-3xl font-bold mb-6 text-white">Welcome fren,</h1>

        <div className="">
          <p className="text-gray-300 text-lg mb-6">
            <strong>Upload your resume</strong> to get started. We&apos;ll
            analyze it and provide personalized recommendations.
          </p>

          <UploadZone
            onFileChange={handleUpload}
            isPending={isPending}
          />
        </div>
      </div>
    </div>
  );
}
