'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import FeatureCard from '@/components/feature-card';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/footer';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import ResumeAnalysisAnimation from '@/components/homepage/resume-analysis-animation';

export default function Home() {
  const [showBanner, setShowBanner] = useState(false);

  const handleAuthClick = () => {
    setShowBanner(true);
  };

  return (
    <div className="flex min-h-screen flex-col relative">
      {showBanner && (
        <div className="fixed top-28 left-1/2 -translate-x-1/2 z-[100] w-11/12 max-w-md p-4 bg-yellow-300 border border-yellow-400 rounded-lg shadow-lg text-center animate-fade-in-down">
          <p className="text-yellow-900 font-semibold">
            ⚠️ this demo was built for a hackathon. auth services were tied to
            temporary supabase credits and are now disabled.
          </p>
          <button
            onClick={() => setShowBanner(false)}
            className="absolute top-1 right-2 text-yellow-900 hover:text-black text-2xl font-bold"
            aria-label="Close banner"
          >
            &times;
          </button>
        </div>
      )}
      {/* Background with overlay */}
      <div
        className="fixed inset-0 z-0"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-hero-pattern bg-cover bg-center bg-no-repeat" />
        <div className="absolute inset-0 bg-deepBlue/95" />
      </div>

      {/* Header */}
      <header
        className="fixed w-full top-0 z-50"
        role="banner"
      >
        <div className="mx-4 sm:mx-6 lg:mx-8 mt-4 bg-slate-900/40 backdrop-blur-sm rounded-xl px-6 py-2 flex justify-between items-center">
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="block"
              aria-label="qualifies.me - Home"
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
          <Button
            variant="ghost"
            className="text-white hover:bg-white/10"
            aria-label="Sign in to your account"
            onClick={handleAuthClick}
          >
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section with Animation */}
      <section
        className="relative pt-36 pb-10 px-4 sm:px-6 lg:px-8 z-10"
        aria-labelledby="hero-heading"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side: Text and CTA */}
            <div className="text-left space-y-6 animate-fade-up">
              <div
                className="inline-block px-4 py-1.5 bg-accent/30 backdrop-blur-md rounded-full mb-4"
                role="status"
              >
                <p className="text-sm font-medium text-white">
                  <span
                    className="mr-2"
                    aria-hidden="true"
                  >
                    ✨
                  </span>
                  Land your dream job faster
                </p>
              </div>
              <h1
                id="hero-heading"
                className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight font-heading text-white leading-tight"
              >
                Stand Out in a{' '}
                <span className="inline-block bg-blue-gradient bg-clip-text text-transparent">
                  Competitive
                </span>{' '}
                Job Market
              </h1>
              <p className="text-xl max-w-2xl text-gray-300">
                Our AI-powered platform analyzes job descriptions, identifies
                key requirements, and helps you customize your resume to
                significantly increase your interview chances.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-base"
                  aria-label="Get started with a free account"
                  onClick={handleAuthClick}
                >
                  Get Started Free
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-base border-white/20 text-white hover:bg-white/10"
                  onClick={() =>
                    document
                      .getElementById('demo')
                      ?.scrollIntoView({ behavior: 'smooth' })
                  }
                  aria-label="Scroll to demo section"
                >
                  See How It Works
                </Button>
              </div>
              <div className="pt-2">
                <p className="text-sm text-gray-400">
                  <span
                    className="mr-2"
                    aria-hidden="true"
                  >
                    🔒
                  </span>
                  No credit card required • Free tier available
                </p>
              </div>
            </div>

            {/* Right side: Lottie Animation */}
            <div
              className="flex justify-center lg:justify-end animate-fade-up animation-delay-300"
              aria-hidden="true"
            >
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 shadow-xl w-full max-w-lg">
                <DotLottieReact
                  src="https://lottie.host/31399971-5fdb-40c4-a215-030dcf42e64b/WA10IR1Yhe.lottie"
                  autoplay
                  loop
                  className="w-full h-80"
                />
                <div className="text-center mt-4">
                  <p className="text-white font-medium">
                    Stand out from other candidates
                  </p>
                  <p className="text-gray-400 text-sm">
                    Our AI helps you match exactly what recruiters are looking
                    for
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section
        className="relative py-10 z-10"
        aria-labelledby="stats-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl p-6 md:p-8">
            <h2
              id="stats-heading"
              className="sr-only"
            >
              Key Statistics
            </h2>
            <div
              className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
              role="list"
            >
              <div
                className="space-y-1"
                role="listitem"
              >
                <p className="text-3xl font-bold text-white">96%</p>
                <p className="text-sm text-gray-400">Resume Match Rate</p>
              </div>
              <div
                className="space-y-1"
                role="listitem"
              >
                <p className="text-3xl font-bold text-white">2.5x</p>
                <p className="text-sm text-gray-400">More Interviews</p>
              </div>
              <div
                className="space-y-1"
                role="listitem"
              >
                <p className="text-3xl font-bold text-white">85%</p>
                <p className="text-sm text-gray-400">Time Saved</p>
              </div>
              <div
                className="space-y-1"
                role="listitem"
              >
                <p className="text-3xl font-bold text-white">10k+</p>
                <p className="text-sm text-gray-400">Happy Users</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Demo */}
      <section
        id="demo"
        className="relative py-16 z-10"
        aria-labelledby="demo-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-up">
            <h2
              id="demo-heading"
              className="text-3xl sm:text-4xl font-bold bg-blue-gradient bg-clip-text text-transparent"
            >
              See It In Action
            </h2>
            <p className="mt-4 text-xl max-w-2xl mx-auto text-gray-300">
              Our platform streamlines your job application process with
              AI-powered tools
            </p>
          </div>

          <div
            className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-2xl animate-fade-up"
            role="region"
            aria-label="Resume tailoring demo"
          >
            <div className="p-4 bg-slate-900/80 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div
                  className="flex space-x-1.5"
                  aria-hidden="true"
                >
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="text-white/60 text-sm">Resume Tailoring</div>
              </div>
            </div>
            <div className="h-[400px] relative overflow-hidden">
              <ResumeAnalysisAnimation />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        className="relative py-20 bg-accent/10 backdrop-blur-md z-10"
        id="features"
        aria-labelledby="features-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-up">
            <h2
              id="features-heading"
              className="text-3xl sm:text-4xl font-bold bg-blue-gradient bg-clip-text text-transparent"
            >
              Powerful features for your job search
            </h2>
            <p className="mt-4 text-xl max-w-2xl mx-auto text-gray-300">
              Everything you need to streamline your job application process and
              increase your chances of success.
            </p>
          </div>

          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-10 animate-fade-up"
            role="list"
          >
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

      {/* Testimonials */}
      <section
        className="relative py-20 z-10"
        aria-labelledby="testimonials-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-up">
            <h2
              id="testimonials-heading"
              className="text-3xl sm:text-4xl font-bold bg-blue-gradient bg-clip-text text-transparent"
            >
              What our users are saying
            </h2>
            <p className="mt-4 text-xl max-w-2xl mx-auto text-gray-300">
              Join thousands of job seekers who have transformed their job
              search
            </p>
          </div>

          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-up"
            role="list"
          >
            {/* Testimonial 1 */}
            <div
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
              role="listitem"
            >
              <div className="flex items-center mb-4">
                <div
                  className="bg-blue-500/20 w-10 h-10 rounded-full flex items-center justify-center"
                  aria-hidden="true"
                >
                  <span className="text-blue-400 text-xl">J</span>
                </div>
                <div className="ml-3">
                  <p className="text-white font-medium">Jason K.</p>
                  <p className="text-gray-400 text-sm">Software Engineer</p>
                </div>
              </div>
              <blockquote className="text-gray-300">
                &ldquo;After using this platform, I got callbacks from 5 out of
                7 applications. Before, my success rate was less than 10%. The
                resume tailoring feature is a game-changer.&rdquo;
              </blockquote>
            </div>

            {/* Testimonial 2 */}
            <div
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
              role="listitem"
            >
              <div className="flex items-center mb-4">
                <div
                  className="bg-green-500/20 w-10 h-10 rounded-full flex items-center justify-center"
                  aria-hidden="true"
                >
                  <span className="text-green-400 text-xl">S</span>
                </div>
                <div className="ml-3">
                  <p className="text-white font-medium">Sarah M.</p>
                  <p className="text-gray-400 text-sm">Marketing Manager</p>
                </div>
              </div>
              <blockquote className="text-gray-300">
                &ldquo;The skills gap analysis helped me identify exactly what I
                was missing. I went from being rejected to getting interviews at
                top companies in my field.&rdquo;
              </blockquote>
            </div>

            {/* Testimonial 3 */}
            <div
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
              role="listitem"
            >
              <div className="flex items-center mb-4">
                <div
                  className="bg-purple-500/20 w-10 h-10 rounded-full flex items-center justify-center"
                  aria-hidden="true"
                >
                  <span className="text-purple-400 text-xl">D</span>
                </div>
                <div className="ml-3">
                  <p className="text-white font-medium">David L.</p>
                  <p className="text-gray-400 text-sm">Product Designer</p>
                </div>
              </div>
              <blockquote className="text-gray-300">
                &ldquo;I saved so much time with the automated tailoring. What
                used to take me hours now takes minutes, and the results are
                much better. Landed my dream job in 3 weeks!&rdquo;
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="relative py-16 z-10"
        aria-labelledby="cta-heading"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600/30 to-purple-600/30 backdrop-blur-md rounded-2xl p-8 md:p-10 text-center border border-white/10 animate-fade-up">
            <h2
              id="cta-heading"
              className="text-3xl md:text-4xl font-bold text-white mb-4"
            >
              Ready to transform your job search?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of job seekers who are landing more interviews with
              less effort
            </p>
            <Button
              size="lg"
              className="px-8 py-6 text-lg"
              aria-label="Get started with a free account"
              onClick={handleAuthClick}
            >
              Get Started for Free
            </Button>
            <p className="mt-4 text-sm text-gray-400">
              <span
                className="mr-2"
                aria-hidden="true"
              >
                🔒
              </span>
              No credit card required • Free plan available
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
