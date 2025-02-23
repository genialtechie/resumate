'use client';

import React from 'react';

interface CoverLetterEditorProps {
  content: string;
  onContentChange: (content: string) => void;
}

const CoverLetterEditor: React.FC<CoverLetterEditorProps> = ({
  content,
  onContentChange,
}) => {
  return (
    <div className="max-w-3xl md:max-w-4xl mx-auto p-6 bg-white border shadow-md">
      <h2 className="text-2xl font-semibold mb-6">Cover Letter</h2>
      <div
        className="min-h-[500px] p-4 border rounded-lg font-serif text-base leading-relaxed outline-none"
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onContentChange(e.currentTarget.textContent || '')}
      >
        {content}
      </div>
    </div>
  );
};

export default CoverLetterEditor;
