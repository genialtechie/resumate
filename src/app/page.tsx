'use client';

import { UploadZone } from '@/components/upload';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Wand2 } from 'lucide-react';
import { useState } from 'react';

export default function Home() {
  const [status, setStatus] = useState<
    'idle' | 'processing' | 'success' | 'error'
  >('idle');
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleUpload = async () => {
    try {
      if (!file) throw new Error('No file selected');

      setStatus('processing');

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/resume', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (data.error) throw new Error(data.error);

      setStatus('success');
      toast({
        title: 'Success',
        description: 'Resume processed successfully',
      });

      // Redirect to dashboard with resume ID
      window.location.href = `/dashboard/${data.id}`;
    } catch (error) {
      console.error(error);
      setStatus('error');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to upload file: ${error}`,
      });
    } finally {
      setStatus('idle');
    }
  };

  return (
    <div className="flex min-h-screen w-screen flex-col items-center justify-center gap-4 px-4">
      <h2 className="text-2xl font-semibold mb-4 font-mono">
        Import from existing resume
      </h2>
      <div className="w-3/5">
        <UploadZone onFileChange={setFile} />
        <Button
          onClick={handleUpload}
          disabled={status !== 'idle' || !file}
          className="w-full mt-4"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {status === 'processing' ? 'Processing...' : 'Get started'}
        </Button>
      </div>
    </div>
  );
}
