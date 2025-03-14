'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { Github, Mail, LogIn } from 'lucide-react';

/**
 * Auth Buttons component
 * @description This component is used to sign in with Google and GitHub.
 */
export default function AuthButtons() {
  const { signInWithGoogle, signInWithGithub } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGithub();
    } catch (error) {
      console.error('GitHub sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <Button
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="w-full group bg-transparent hover:bg-transparent transition-transform duration-300 ease-in-out hover:scale-105"
      >
        <span className="inline-block w-full">
          <span className="flex w-full items-center justify-between bg-blue-gradient bg-clip-text text-transparent font-semibold transition-opacity duration-300 group-hover:opacity-80">
            <div className="flex items-center">
              <Mail className="mr-4 h-4 w-4 text-featureBlue" />
              Continue with Google
            </div>
            <LogIn className="h-4 w-4 text-featureBlue transition-all duration-300 group-hover:translate-x-1" />
          </span>
        </span>
      </Button>
      <Button
        onClick={handleGithubSignIn}
        disabled={isLoading}
        className="w-full group bg-transparent hover:bg-transparent transition-transform duration-300 ease-in-out hover:scale-105"
      >
        <span className="inline-block w-full">
          <span className="flex w-full items-center justify-between bg-blue-gradient bg-clip-text text-transparent font-semibold transition-opacity duration-300 group-hover:opacity-80">
            <div className="flex items-center">
              <Github className="mr-4 h-4 w-4 text-featureBlue" />
              Continue with GitHub
            </div>
            <LogIn className="h-4 w-4 text-featureBlue transition-all duration-300 group-hover:translate-x-1" />
          </span>
        </span>
      </Button>
    </div>
  );
}
