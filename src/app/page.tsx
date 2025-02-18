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
    if (!file) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No file selected',
      });
      return;
    }
    setStatus('processing');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/resume', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      console.log(data);
      setStatus('success');
      toast({
        title: 'Success',
        description: 'Resume processed successfully',
      });
    } catch (error) {
      console.error(error);
      setStatus('error');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to upload file',
      });
    } finally {
      setStatus('idle');
    }
  };

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 px-4">
      <UploadZone onFileChange={setFile} />
      <Button
        onClick={handleUpload}
        disabled={status !== 'idle'}
        className="w-full"
      >
        <Wand2 className="mr-2 h-4 w-4" />
        {status === 'processing' ? 'Processing...' : 'Process Resume'}
      </Button>
    </div>
  );
}
