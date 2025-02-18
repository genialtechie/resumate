'use client';

import { Upload, FileIcon, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { UploadZoneProps } from '@/types';

export const UploadZone = ({ onFileChange }: UploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleFile = (file: File) => {
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        variant: 'destructive',
        title: 'Invalid file type',
        description: 'Please upload a PDF file',
      });
      return;
    }

    setSelectedFile(file);
    onFileChange(file);
    toast({
      title: 'File received',
      description: 'Your file has been successfully uploaded',
    });
  };

  const removeFile = () => {
    setSelectedFile(null);
    onFileChange(null);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        'relative w-full rounded-lg border-2 border-dashed p-8 transition-all duration-200 ease-in-out',
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-gray-200 hover:border-primary/50'
      )}
    >
      {selectedFile ? (
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-2">
            <FileIcon className="h-8 w-8 text-blue-500" />
            <div className="mr-2">
              <p className="text-sm font-medium text-gray-800">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500">
                {Math.round(selectedFile.size / 1024)} KB
              </p>
            </div>
          </div>
          <button
            onClick={removeFile}
            className="rounded-full p-1 hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <Upload className="h-10 w-10 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-800">
              Drop your resume here or{' '}
              <span className="text-primary cursor-pointer">browse</span>
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Supports PDF files only
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
