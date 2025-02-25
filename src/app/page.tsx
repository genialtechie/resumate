'use client';

import { Button } from '@/components/ui/button';
import { FileText, Zap, ChartBar } from 'lucide-react';
import FeatureCard from '@/components/feature-card';
import Link from 'next/link';
import AuthDialog from '@/components/auth-dialog';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="pt-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex-shrink-0">
          <Link
            href="/"
            className="text-4xl sm:text-6xl font-bold tracking-tight"
          >
            qualifies.me
          </Link>
        </div>
        <AuthDialog trigger={<Button variant="outline">Sign In</Button>} />
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8 animate-fade-up">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 tracking-tight">
              Your Job Search, Optimized
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Upload your resume, analyze job descriptions, and get personalized
              recommendations to land your dream job.
            </p>

            <div className="md:max-w-2xl mx-auto">
              <AuthDialog className="mt-4" />
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
              Powerful Features for Your Job Search
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
