'use client';

import React, { useRef, useEffect } from 'react';

interface CoverLetterEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  name?: string;
  contact?: {
    email: string;
    phone: string;
    linkedin?: string;
    website?: string;
  };
}

/**
 * Cover Letter Editor component
 * @param content - The content of the cover letter
 * @param onContentChange - The function to call when the content changes
 * @param name - The name of the cover letter
 * @param contact - The contact information of the cover letter
 */
const CoverLetterEditor: React.FC<CoverLetterEditorProps> = ({
  content,
  onContentChange,
  name = '',
  contact = { email: '', phone: '' },
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef(content); // Track content in a ref to avoid unnecessary comparisons
  const isInternalChange = useRef(false);

  // Update the editor when content changes from outside
  useEffect(() => {
    // Skip if the change came from within the editor
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }

    // Only update DOM if content actually changed
    if (editorRef.current && content !== contentRef.current) {
      editorRef.current.textContent = content;
      contentRef.current = content;
    }
  }, [content]);

  // Initialize content on mount
  useEffect(() => {
    if (editorRef.current && content) {
      editorRef.current.textContent = content;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle content changes without losing cursor position
  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.textContent || '';

    // Only update if content actually changed
    if (newContent !== contentRef.current) {
      isInternalChange.current = true;
      contentRef.current = newContent;
      onContentChange(newContent);
    }
  };

  // Format the current date in the same format as the PDF
  const formattedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="max-w-3xl md:max-w-4xl mx-auto p-6 bg-white border shadow-md">
      <div className="font-serif text-base leading-relaxed mb-8">
        {/* Header with name and contact info */}
        <div className="mb-4">
          <p className="text-lg font-bold">{name || 'Your Name'}</p>
          <p>{contact.email || 'your.email@example.com'}</p>
          <p>{contact.phone || '(123) 456-7890'}</p>
          {contact.linkedin && <p>{contact.linkedin}</p>}
          {contact.website && <p>{contact.website}</p>}
        </div>

        {/* Date */}
        <div className="mb-4">
          <p>{formattedDate}</p>
        </div>

        {/* Recipient (placeholder) */}
        <div className="mb-4">
          <p>To Whom It May Concern,</p>
        </div>
      </div>

      {/* Editable content */}
      <div
        ref={editorRef}
        className="min-h-[400px] rounded-lg font-serif text-base leading-relaxed outline-none"
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
      />

      {/* Closing */}
      <div className="font-serif text-base leading-relaxed mt-6">
        <p className="mb-0">Sincerely,</p>
        <p className="font-bold">{name || 'Your Name'}</p>
      </div>
    </div>
  );
};

export default CoverLetterEditor;
