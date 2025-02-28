'use client';

import React, { useRef, useEffect } from 'react';

interface CoverLetterEditorProps {
  content: string;
  onContentChange: (content: string) => void;
}

const CoverLetterEditor: React.FC<CoverLetterEditorProps> = ({
  content,
  onContentChange,
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

  return (
    <div className="max-w-3xl md:max-w-4xl mx-auto p-6 bg-white border shadow-md">
      <h2 className="text-2xl font-semibold mb-6">Cover Letter</h2>
      <div
        ref={editorRef}
        className="min-h-[500px] p-4 border rounded-lg font-serif text-base leading-relaxed outline-none"
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
      />
    </div>
  );
};

export default CoverLetterEditor;
