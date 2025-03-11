import { Button } from '@/components/ui/button';
import FeatureCard from '@/components/feature-card';
import Link from 'next/link';
import Image from 'next/image';
import AuthDialog from '@/components/auth-dialog';
import Footer from '@/components/footer';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col relative">
      {/* Background with overlay */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-hero-pattern bg-cover bg-center bg-no-repeat" />
        <div className="absolute inset-0 bg-deepBlue/95" />
      </div>

      {/* Header */}
      <header className="fixed w-full top-0 z-50">
        <div className="mx-4 sm:mx-6 lg:mx-8 mt-4 bg-slate-900/40 backdrop-blur-sm rounded-xl px-6 py-2 flex justify-between items-center">
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="block"
            >
              <Image
                src="/logo-white.svg"
                alt="qualifies.me"
                width={180}
                height={40}
                priority
                className="h-8 sm:h-10 w-auto brightness-200"
              />
            </Link>
          </div>
          <AuthDialog
            trigger={
              <Button
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                Sign In
              </Button>
            }
          />
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-48 pb-20 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8 animate-fade-up">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight font-heading text-white">
              Your Job Search, Optimized
            </h1>
            <p className="text-xl max-w-2xl mx-auto text-gray-300">
              Upload your resume, analyze job descriptions, and get personalized
              recommendations to land your dream job.
            </p>

            <div className="md:max-w-2xl mx-auto">
              <AuthDialog className="mt-4" />
            </div>
          </div>
        </div>
      </section>

      {/* Demo */}

      {/* Features */}
      <section
        className="relative py-20 bg-accent/10 backdrop-blur-md z-10"
        id="features"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-up">
            <h2 className="bg-blue-gradient bg-clip-text text-transparent text-3xl sm:text-4xl font-bold">
              Powerful features for your job search
            </h2>
            <p className="mt-4 text-xl max-w-2xl mx-auto text-gray-300">
              Everything you need to streamline your job application process and
              increase your chances of success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 animate-fade-up">
            <FeatureCard
              title="Resume Management"
              description="Import your resume from PDF, with AI-powered optimization and keyword tuning."
              imageSrc="/resume-card.png"
            />
            <FeatureCard
              title="Smart Tailoring"
              description="Analyze job descriptions and generate tailored resumes and cover letters."
              imageSrc="/tailoring-card.png"
            />
            <FeatureCard
              title="Skills Gap Analysis"
              description="Analyze your skills and compare them to the job requirements."
              imageSrc="/skills-card.png"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
