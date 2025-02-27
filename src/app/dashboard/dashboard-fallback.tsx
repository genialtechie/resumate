'use client';

import { UploadZone } from '@/components/upload';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Wand2 } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useMutation } from '@tanstack/react-query';

export default function DashboardFallback() {
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();

  if (!user) {
    router.push('/');
  }

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

  const handleUpload = () => {
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

  // Optimized JSX with reduced complexity
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          Welcome
          {user?.user_metadata?.full_name
            ? `, ${user.user_metadata.full_name}!`
            : '!'}
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Upload Your Resume</h2>
          <p className="text-gray-600 mb-6">
            Upload your resume to get started. We&apos;ll analyze it and provide
            personalized recommendations.
          </p>

          <UploadZone onFileChange={setFile} />

          <Button
            size="lg"
            className="bg-primary hover:bg-primary-hover text-white px-8 py-4 mt-4 w-full"
            onClick={handleUpload}
            disabled={isPending || !file}
            aria-label="Analyze Resume"
          >
            {isPending ? (
              <>
                <span className="h-4 w-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full" />
                Processing...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Analyze Resume
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
