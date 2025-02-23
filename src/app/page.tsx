'use client';

import { UploadZone } from '@/components/upload';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Wand2, FileText, Zap, ChartBar } from 'lucide-react';
import { useState } from 'react';
import FeatureCard from '@/components/feature-card';
import Link from 'next/link';

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
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="pt-4 px-4 sm:px-6 lg:px-8">
        <div className="flex-shrink-0">
          <Link
            href="/"
            className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight"
          >
            qualifies.me
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8 animate-fade-up">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 tracking-tight">
              Your Job Search, Optimized
            </h1>

            <div className="md:max-w-2xl mx-auto">
              <UploadZone onFileChange={setFile} />
              <Button
                size="lg"
                className="bg-primary hover:bg-primary-hover text-white px-8 py-4 mt-4"
                onClick={handleUpload}
                disabled={status !== 'idle' || !file}
              >
                <Wand2 className="mr-2 h-4 w-4" />
                {status === 'processing' ? 'Processing...' : 'Get started'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        className="py-20 bg-accent"
        id="features"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-up">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              GenAI for Your Job Search
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to streamline your job application process and
              increase your chances of success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 animate-fade-up">
            <FeatureCard
              icon={FileText}
              title="Resume Management"
              description="Import your resume from PDF, with AI-powered optimization and keyword tuning."
            />
            <FeatureCard
              icon={Zap}
              title="Smart Tailoring"
              description="Analyze job descriptions and generate tailored resumes and cover letters."
            />
            <FeatureCard
              icon={ChartBar}
              title="Skills Gap Analysis"
              description="Analyze your skills and compare them to the job requirements."
            />
          </div>
        </div>
      </section>
    </div>
  );
}
