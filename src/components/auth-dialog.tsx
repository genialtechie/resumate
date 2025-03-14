'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import AuthButtons from '@/components/auth-buttons';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

interface AuthDialogProps {
  trigger?: React.ReactNode;
  className?: string;
}

/**
 * Auth Dialog component
 * @param trigger - The trigger element to open the dialog
 * @param className - The class name for the button
 */
export default function AuthDialog({ trigger, className }: AuthDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button
            size="lg"
            className={`group bg-transparent hover:bg-transparent transition-transform duration-300 ease-in-out hover:scale-105 ${className}`}
          >
            <span className="inline-block">
              <span className="flex items-center bg-blue-gradient bg-clip-text text-transparent font-bold uppercase text-lg transition-opacity duration-300 group-hover:opacity-80">
                Get Started
                <LogIn className="ml-2 h-5 w-5 text-featureBlue transition-all duration-300 group-hover:translate-x-1" />
              </span>
            </span>
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md bg-black/90 backdrop-blur-sm border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-white">
            Sign in to qualifies.me
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Sign in to your account to access all features and manage your
            resumes.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <AuthButtons />
        </div>
      </DialogContent>
    </Dialog>
  );
}
