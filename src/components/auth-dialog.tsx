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
            className={`bg-primary hover:bg-primary-hover text-white px-8 py-4 ${className}`}
          >
            <LogIn className="mr-2 h-4 w-4" />
            Get Started
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sign in to qualifies.me</DialogTitle>
          <DialogDescription>
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
