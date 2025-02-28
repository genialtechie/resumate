'use client';
import React, { useCallback } from 'react';
import { ResumeContentObject } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  handleFieldBlur as handleFieldBlurHelper,
  handleContactBlur as handleContactBlurHelper,
  handleSkillsBlur as handleSkillsBlurHelper,
  handleExperienceBlur as handleExperienceBlurHelper,
  handleExperienceDetailChange as handleExperienceDetailChangeHelper,
  addExperienceDetail as addExperienceDetailHelper,
  deleteExperienceDetail as deleteExperienceDetailHelper,
  addExperienceEntry as addExperienceEntryHelper,
  deleteExperienceEntry as deleteExperienceEntryHelper,
  handleEducationBlur as handleEducationBlurHelper,
  addEducationEntry as addEducationEntryHelper,
  deleteEducationEntry as deleteEducationEntryHelper,
} from '@/lib/utils/editor-helpers';

interface PDFEditorProps {
  editedResume: ResumeContentObject;
  setEditedResume: (resume: ResumeContentObject) => void;
}

const PDFEditor: React.FC<PDFEditorProps> = ({
  editedResume,
  setEditedResume,
}) => {
  // Wrap helper functions with useCallback
  const handleFieldBlur = useCallback(
    (
      field: keyof Omit<
        ResumeContentObject,
        'skills' | 'contact' | 'experience' | 'education'
      >,
      value: string
    ) => {
      handleFieldBlurHelper(editedResume, setEditedResume, field, value);
    },
    [editedResume, setEditedResume]
  );

  const handleContactBlur = useCallback(
    (value: string) => {
      handleContactBlurHelper(editedResume, setEditedResume, value);
    },
    [editedResume, setEditedResume]
  );

  const handleSkillsBlur = useCallback(
    (value: string) => {
      handleSkillsBlurHelper(editedResume, setEditedResume, value);
    },
    [editedResume, setEditedResume]
  );

  const handleExperienceBlur = useCallback(
    (
      index: number,
      field: keyof Omit<
        Exclude<ResumeContentObject['experience'], undefined>[number],
        'details'
      >,
      value: string
    ) => {
      handleExperienceBlurHelper(
        editedResume,
        setEditedResume,
        index,
        field,
        value
      );
    },
    [editedResume, setEditedResume]
  );

  const handleExperienceDetailChange = useCallback(
    (expIndex: number, detailIndex: number, value: string) => {
      handleExperienceDetailChangeHelper(
        editedResume,
        setEditedResume,
        expIndex,
        detailIndex,
        value
      );
    },
    [editedResume, setEditedResume]
  );

  const addExperienceDetail = useCallback(
    (expIndex: number, detailIndex: number) => {
      addExperienceDetailHelper(
        editedResume,
        setEditedResume,
        expIndex,
        detailIndex
      );
    },
    [editedResume, setEditedResume]
  );

  const deleteExperienceDetail = useCallback(
    (expIndex: number, detailIndex: number) => {
      deleteExperienceDetailHelper(
        editedResume,
        setEditedResume,
        expIndex,
        detailIndex
      );
    },
    [editedResume, setEditedResume]
  );

  const addExperienceEntry = useCallback(() => {
    addExperienceEntryHelper(editedResume, setEditedResume);
  }, [editedResume, setEditedResume]);

  const deleteExperienceEntry = useCallback(
    (expIndex: number) => {
      deleteExperienceEntryHelper(editedResume, setEditedResume, expIndex);
    },
    [editedResume, setEditedResume]
  );

  const handleEducationBlur = useCallback(
    (
      index: number,
      field: keyof Exclude<ResumeContentObject['education'], undefined>[number],
      value: string
    ) => {
      handleEducationBlurHelper(
        editedResume,
        setEditedResume,
        index,
        field,
        value
      );
    },
    [editedResume, setEditedResume]
  );

  const addEducationEntry = useCallback(() => {
    addEducationEntryHelper(editedResume, setEditedResume);
  }, [editedResume, setEditedResume]);

  const deleteEducationEntry = useCallback(
    (eduIndex: number) => {
      deleteEducationEntryHelper(editedResume, setEditedResume, eduIndex);
    },
    [editedResume, setEditedResume]
  );

  if (!editedResume) {
    return <div className="text-center py-4">No resume data available</div>;
  }

  return (
    <div className="max-w-3xl md:max-w-4xl mx-auto p-6 md:p-12 bg-white border shadow-md font-serif">
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
        {editedResume.experience.length > 0 ? (
          editedResume.experience.map((exp, expIdx) => (
            <div
              key={expIdx}
              className="mb-6 p-3 relative group/entry"
            >
              <div className="flex justify-between items-start">
                <div className="flex-grow">
                  <div
                    className="font-bold text-lg outline-none"
                    contentEditable
                    suppressContentEditableWarning
                    title="Company"
                    onBlur={(e) =>
                      handleExperienceBlur(
                        expIdx,
                        'company',
                        e.currentTarget.innerText
                      )
                    }
                  >
                    {exp.company}
                  </div>
                  <div
                    className="italic text-base outline-none"
                    contentEditable
                    suppressContentEditableWarning
                    title="Role"
                    onBlur={(e) =>
                      handleExperienceBlur(
                        expIdx,
                        'title',
                        e.currentTarget.innerText
                      )
                    }
                  >
                    {exp.title}
                  </div>
                  <div
                    className="text-sm text-gray-600 outline-none"
                    contentEditable
                    suppressContentEditableWarning
                    title="Dates"
                    onBlur={(e) =>
                      handleExperienceBlur(
                        expIdx,
                        'dates',
                        e.currentTarget.innerText
                      )
                    }
                  >
                    {exp.dates}
                  </div>
                </div>
                <div className="flex flex-col-reverse sm:flex-row gap-1 opacity-0 group-hover/entry:opacity-100 focus-within:opacity-100">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        onClick={() => addExperienceEntry()}
                        aria-label="Add experience entry"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            addExperienceEntry();
                          }
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-sans">Add experience below</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-red-100 hover:text-red-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        onClick={() => deleteExperienceEntry(expIdx)}
                        aria-label={`Delete experience entry for ${exp.company}`}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            deleteExperienceEntry(expIdx);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-sans">Delete experience</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <div className="mt-2">
                {exp.details.map((detail, detailIdx) => (
                  <div
                    key={`${expIdx}-${detailIdx}`}
                    className="flex items-start group relative hover:bg-gray-50/50 rounded px-2 py-1"
                  >
                    <span className="mr-2 text-gray-500 select-none">•</span>
                    <div
                      className="outline-none flex-1 min-h-[1.5rem]"
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) =>
                        handleExperienceDetailChange(
                          expIdx,
                          detailIdx,
                          e.currentTarget.innerText
                        )
                      }
                      onKeyDown={(e) => {
                        if (
                          e.key === 'Backspace' &&
                          e.currentTarget.innerText.trim() === ''
                        ) {
                          e.preventDefault();
                          handleExperienceDetailChange(expIdx, detailIdx, '');
                        }
                      }}
                    >
                      {detail}
                    </div>
                    <div className="flex flex-col-reverse sm:flex-row gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 absolute -right-8 sm:-right-14 top-1/2 -translate-y-1/2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="detail-button h-6 w-6 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            onClick={() => {
                              addExperienceDetail(expIdx, detailIdx);
                            }}
                            aria-label="Add bullet point"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                addExperienceDetail(expIdx, detailIdx);
                              }
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-sans">Add bullet point below</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="detail-button h-6 w-6 hover:bg-red-100 hover:text-red-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            onClick={() =>
                              deleteExperienceDetail(expIdx, detailIdx)
                            }
                            aria-label="Delete bullet point"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                deleteExperienceDetail(expIdx, detailIdx);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-sans">Delete bullet point</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                ))}
                {exp.details.length === 0 && (
                  <div
                    className="flex items-start px-2 py-1 text-gray-400 italic cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded"
                    onClick={() => addExperienceDetail(expIdx, -1)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        addExperienceDetail(expIdx, -1);
                      }
                    }}
                    aria-label="Add details to experience"
                  >
                    <span className="mr-2">•</span>
                    Add details...
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div
            className="p-3 text-gray-400 italic cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded"
            onClick={addExperienceEntry}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                addExperienceEntry();
              }
            }}
            aria-label="Add experience entry"
          >
            Add experience...
          </div>
        )}
      </div>

      {/* Education Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2 border-b-2 border-black">
          Education
        </h2>
        {editedResume.education.length > 0 ? (
          editedResume.education.map((edu, idx) => (
            <div
              key={idx}
              className="mb-6 p-3 relative group/entry"
            >
              <div className="flex justify-between items-start">
                <div className="flex-grow">
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
                      handleEducationBlur(
                        idx,
                        'degree',
                        e.currentTarget.innerText
                      )
                    }
                  >
                    {edu.degree}
                  </div>
                  <div
                    className="text-sm text-gray-600 outline-none"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) =>
                      handleEducationBlur(
                        idx,
                        'dates',
                        e.currentTarget.innerText
                      )
                    }
                  >
                    {edu.dates}
                  </div>
                  <div
                    className="text-sm text-gray-600 outline-none"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) =>
                      handleEducationBlur(
                        idx,
                        'location',
                        e.currentTarget.innerText
                      )
                    }
                  >
                    {edu.location}
                  </div>
                </div>
                <div className="flex flex-col-reverse sm:flex-row gap-1 opacity-0 group-hover/entry:opacity-100 focus-within:opacity-100">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        onClick={() => addEducationEntry()}
                        aria-label="Add education entry"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            addEducationEntry();
                          }
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-sans">Add education below</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-red-100 hover:text-red-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        onClick={() => deleteEducationEntry(idx)}
                        aria-label={`Delete education entry for ${edu.institution}`}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            deleteEducationEntry(idx);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-sans">Delete education</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div
            className="p-3 text-gray-400 italic cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded"
            onClick={addEducationEntry}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                addEducationEntry();
              }
            }}
            aria-label="Add education entry"
          >
            Add education...
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFEditor;
