'use client';
import React, { useCallback } from 'react';
import { ResumeContentObject } from '@/types/resume';

interface PDFEditorProps {
  editedResume: ResumeContentObject;
  setEditedResume: (resume: ResumeContentObject) => void;
}

const PDFEditor: React.FC<PDFEditorProps> = ({
  editedResume,
  setEditedResume,
}) => {
  // Generic handler for top-level string fields on blur
  const handleFieldBlur = useCallback(
    (
      field: keyof Omit<
        ResumeContentObject,
        'skills' | 'contact' | 'experience' | 'education'
      >,
      value: string
    ) => {
      setEditedResume({
        ...editedResume,
        [field]: value,
      });
    },
    [editedResume, setEditedResume]
  );

  // Handler for updating the contact info from a single editable block
  const handleContactBlur = useCallback(
    (value: string) => {
      // Expect contact info in the format "email | phone | linkedin"
      const [email = '', phone = '', linkedin = ''] = value
        .split('|')
        .map((s) => s.trim());
      setEditedResume({
        ...editedResume,
        contact: { email, phone, linkedin },
      });
    },
    [editedResume, setEditedResume]
  );

  // Handler for updating skills on blur
  const handleSkillsBlur = useCallback(
    (value: string) => {
      const skills = value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      setEditedResume({
        ...editedResume,
        skills,
      });
    },
    [editedResume, setEditedResume]
  );

  // For updating an experience entry
  const handleExperienceBlur = useCallback(
    (
      index: number,
      field: keyof Omit<
        Exclude<ResumeContentObject['experience'], undefined>[number],
        'details'
      >,
      value: string
    ) => {
      const newExp = [...editedResume.experience];
      newExp[index] = { ...newExp[index], [field]: value };
      setEditedResume({ ...editedResume, experience: newExp });
    },
    [editedResume, setEditedResume]
  );

  // For updating the details (multi-line) of an experience entry
  const handleExperienceDetailsBlur = useCallback(
    (index: number, value: string) => {
      const newExp = [...editedResume.experience];
      // Split the details by newlines
      newExp[index].details = value
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      setEditedResume({ ...editedResume, experience: newExp });
    },
    [editedResume, setEditedResume]
  );

  // For updating an education entry
  const handleEducationBlur = useCallback(
    (
      index: number,
      field: keyof Exclude<ResumeContentObject['education'], undefined>[number],
      value: string
    ) => {
      const newEdu = [...editedResume.education];
      newEdu[index] = { ...newEdu[index], [field]: value };
      setEditedResume({ ...editedResume, education: newEdu });
    },
    [editedResume, setEditedResume]
  );

  if (!editedResume) {
    return <div className="text-center py-4">No resume data available</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white border shadow-md font-serif">
      {/* Header Section */}
      <div className="mb-8">
        <div
          className="text-3xl font-bold mb-2 outline-none"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleFieldBlur('name', e.currentTarget.innerText)}
        >
          {editedResume.name}
        </div>
        <div
          className="text-lg mb-2 outline-none"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleFieldBlur('location', e.currentTarget.innerText)}
        >
          {editedResume.location}
        </div>
        <div
          className="text-sm text-gray-600 outline-none"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleContactBlur(e.currentTarget.innerText)}
        >
          {editedResume.contact.email} | {editedResume.contact.phone} |{' '}
          {editedResume.contact.linkedin == ''
            ? editedResume.contact.website == ''
              ? 'No contact info'
              : editedResume.contact.website
            : editedResume.contact.linkedin}
        </div>
      </div>

      {/* Summary Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2 border-b-2 border-black">
          Summary
        </h2>
        <div
          className="p-3 outline-none"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleFieldBlur('summary', e.currentTarget.innerText)}
        >
          {editedResume.summary}
        </div>
      </div>

      {/* Skills Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2 border-b-2 border-black">
          Skills
        </h2>
        <div
          className="p-3 outline-none"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleSkillsBlur(e.currentTarget.innerText)}
        >
          {editedResume.skills.join(', ')}
        </div>
      </div>

      {/* Experience Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2 border-b-2 border-black">
          Experience
        </h2>
        {editedResume.experience.map((exp, idx) => (
          <div
            key={idx}
            className="mb-6 p-3"
          >
            <div
              className="font-bold text-lg outline-none"
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) =>
                handleExperienceBlur(idx, 'company', e.currentTarget.innerText)
              }
            >
              {exp.company}
            </div>
            <div
              className="italic text-base outline-none"
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) =>
                handleExperienceBlur(idx, 'title', e.currentTarget.innerText)
              }
            >
              {exp.title}
            </div>
            <div
              className="text-sm text-gray-600 outline-none"
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) =>
                handleExperienceBlur(idx, 'dates', e.currentTarget.innerText)
              }
            >
              {exp.dates}
            </div>
            <div
              className="mt-2 outline-none whitespace-pre-wrap"
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) =>
                handleExperienceDetailsBlur(idx, e.currentTarget.innerText)
              }
            >
              {exp.details.join('\n')}
            </div>
          </div>
        ))}
      </div>

      {/* Education Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2 border-b-2 border-black">
          Education
        </h2>
        {editedResume.education.map((edu, idx) => (
          <div
            key={idx}
            className="mb-6 p-3"
          >
            <div
              className="font-bold text-lg outline-none"
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) =>
                handleEducationBlur(
                  idx,
                  'institution',
                  e.currentTarget.innerText
                )
              }
            >
              {edu.institution}
            </div>
            <div
              className="italic outline-none"
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) =>
                handleEducationBlur(idx, 'degree', e.currentTarget.innerText)
              }
            >
              {edu.degree}
            </div>
            <div
              className="text-sm text-gray-600 outline-none"
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) =>
                handleEducationBlur(idx, 'dates', e.currentTarget.innerText)
              }
            >
              {edu.dates}
            </div>
            <div
              className="text-sm text-gray-600 outline-none"
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) =>
                handleEducationBlur(idx, 'location', e.currentTarget.innerText)
              }
            >
              {edu.location}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PDFEditor;
