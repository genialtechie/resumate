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
import InlineDiffEditor from '@/components/dashboard/inline-diff-editor';
import { hasTextDifferences } from '@/lib/utils/diff-utils';

interface PDFEditorProps {
  editedResume: ResumeContentObject;
  setEditedResume: (resume: ResumeContentObject) => void;
  originalResume?: ResumeContentObject | null;
  showDiffs?: boolean;
  onAcceptSection?: (sectionPath: string) => void;
  onRejectSection?: (sectionPath: string) => void;
}

/**
 * PDFEditor component for viewing and editing a resume
 * - Displays a formatted resume with sections for summary, skills, experience, and education
 * - Shows inline diffs for editable sections when showDiffs is true
 * - Allows accepting or rejecting changes to editable sections
 */
const PDFEditor: React.FC<PDFEditorProps> = ({
  editedResume,
  setEditedResume,
  originalResume = null,
  showDiffs = false,
  onAcceptSection,
  onRejectSection,
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
    return (
      <div className="text-center py-4 text-slate-100">
        No resume data available
      </div>
    );
  }

  return (
    <div className="max-w-3xl md:max-w-4xl mx-auto p-6 md:p-12 bg-deepBlue/90 border border-slate-700 shadow-lg rounded-md font-sans text-slate-100">
      {/* Header Section */}
      <div className="mb-8">
        <div
          className="text-3xl font-bold mb-2 outline-none text-slate-100 pl-0"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleFieldBlur('name', e.currentTarget.innerText)}
        >
          {editedResume.name}
        </div>
        <div
          className="text-lg mb-2 outline-none text-slate-100 pl-0"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleFieldBlur('location', e.currentTarget.innerText)}
        >
          {editedResume.location}
        </div>
        <div
          contentEditable
          suppressContentEditableWarning
          className="p-3 pl-0 outline-none text-slate-100 flex-1"
          onBlur={(e) => handleContactBlur(e.currentTarget.innerText)}
        >
          {editedResume.contact.email || 'your.email@example.com'} |{' '}
          {editedResume.contact.phone || '(555) 123-4567'} |{' '}
          {editedResume.contact.linkedin
            ? editedResume.contact.linkedin
            : editedResume.contact.website
            ? editedResume.contact.website
            : 'your-website.com'}
        </div>
      </div>

      {/* Summary Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2 text-slate-100">Summary</h2>
        {showDiffs &&
        originalResume &&
        hasTextDifferences(originalResume.summary, editedResume.summary) ? (
          <InlineDiffEditor
            oldText={originalResume.summary}
            newText={editedResume.summary}
            onSave={(value) => handleFieldBlur('summary', value)}
            onAccept={() => onAcceptSection?.('summary')}
            onReject={() => onRejectSection?.('summary')}
            className="p-3 w-full min-h-[100px] pl-0"
          />
        ) : (
          <div
            className="p-3 pl-0 outline-none"
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) =>
              handleFieldBlur('summary', e.currentTarget.innerText)
            }
          >
            {editedResume.summary}
          </div>
        )}
      </div>

      {/* Skills Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2 text-slate-100">Skills</h2>
        {showDiffs &&
        originalResume &&
        hasTextDifferences(
          originalResume.skills.join(', '),
          editedResume.skills.join(', ')
        ) ? (
          <InlineDiffEditor
            oldText={originalResume.skills.join(', ')}
            newText={editedResume.skills.join(', ')}
            onSave={(value) => handleSkillsBlur(value)}
            onAccept={() => onAcceptSection?.('skills')}
            onReject={() => onRejectSection?.('skills')}
            className="p-3 pl-0 w-full"
          />
        ) : (
          <div
            className="p-3 pl-0 outline-none"
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => handleSkillsBlur(e.currentTarget.innerText)}
          >
            {editedResume.skills.join(', ')}
          </div>
        )}
      </div>

      {/* Experience Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2 text-slate-100">
          Experience
        </h2>
        {editedResume.experience.length > 0 ? (
          editedResume.experience.map((exp, expIdx) => (
            <div
              key={expIdx}
              className="mb-6 p-3 relative group/entry rounded-md"
            >
              <div className="flex justify-between items-start">
                <div className="flex-grow">
                  {showDiffs &&
                  originalResume?.experience?.[expIdx] &&
                  hasTextDifferences(
                    originalResume.experience[expIdx]?.company || '',
                    exp.company
                  ) ? (
                    <InlineDiffEditor
                      oldText={originalResume.experience[expIdx]?.company || ''}
                      newText={exp.company}
                      onSave={(value) =>
                        handleExperienceBlur(expIdx, 'company', value)
                      }
                      onAccept={() =>
                        onAcceptSection?.(`experience.${expIdx}.company`)
                      }
                      onReject={() =>
                        onRejectSection?.(`experience.${expIdx}.company`)
                      }
                      className="font-bold text-lg mb-1"
                    />
                  ) : (
                    <div
                      className="font-bold text-lg mb-1 outline-none"
                      contentEditable
                      suppressContentEditableWarning
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
                  )}

                  <div className="flex justify-between text-sm mb-2">
                    <div className="flex flex-col sm:flex-row sm:gap-2">
                      {showDiffs &&
                      originalResume?.experience?.[expIdx] &&
                      hasTextDifferences(
                        originalResume.experience[expIdx]?.title || '',
                        exp.title
                      ) ? (
                        <InlineDiffEditor
                          oldText={
                            originalResume.experience[expIdx]?.title || ''
                          }
                          newText={exp.title}
                          onSave={(value) =>
                            handleExperienceBlur(expIdx, 'title', value)
                          }
                          onAccept={() =>
                            onAcceptSection?.(`experience.${expIdx}.title`)
                          }
                          onReject={() =>
                            onRejectSection?.(`experience.${expIdx}.title`)
                          }
                        />
                      ) : (
                        <div
                          className="italic outline-none"
                          contentEditable
                          suppressContentEditableWarning
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
                      )}
                    </div>

                    {showDiffs &&
                    originalResume?.experience?.[expIdx] &&
                    hasTextDifferences(
                      originalResume.experience[expIdx]?.dates || '',
                      exp.dates
                    ) ? (
                      <InlineDiffEditor
                        oldText={originalResume.experience[expIdx]?.dates || ''}
                        newText={exp.dates}
                        onSave={(value) =>
                          handleExperienceBlur(expIdx, 'dates', value)
                        }
                        onAccept={() =>
                          onAcceptSection?.(`experience.${expIdx}.dates`)
                        }
                        onReject={() =>
                          onRejectSection?.(`experience.${expIdx}.dates`)
                        }
                      />
                    ) : (
                      <div
                        className="outline-none"
                        contentEditable
                        suppressContentEditableWarning
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
                    )}
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-1 opacity-0 group-hover/entry:opacity-100 focus-within:opacity-100 group-focus-within/entry:opacity-100">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-slate-800/60 text-featureBlue focus:outline-none"
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
                        className="h-6 w-6 hover:bg-red-950/50 hover:text-red-400 text-red-500/80 focus:outline-none"
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

              <ul className="list-disc pl-5 space-y-2">
                {exp.details.map((detail, detailIdx) => (
                  <li
                    key={detailIdx}
                    className="group/detail relative ml-0 pl-0"
                  >
                    {showDiffs &&
                    originalResume?.experience?.[expIdx]?.details?.[
                      detailIdx
                    ] &&
                    hasTextDifferences(
                      originalResume.experience[expIdx]?.details?.[detailIdx] ||
                        '',
                      detail
                    ) ? (
                      <InlineDiffEditor
                        oldText={
                          originalResume.experience[expIdx]?.details?.[
                            detailIdx
                          ] || ''
                        }
                        newText={detail}
                        onSave={(value) =>
                          handleExperienceDetailChange(expIdx, detailIdx, value)
                        }
                        onAccept={() =>
                          onAcceptSection?.(
                            `experience.${expIdx}.details.${detailIdx}`
                          )
                        }
                        onReject={() =>
                          onRejectSection?.(
                            `experience.${expIdx}.details.${detailIdx}`
                          )
                        }
                      />
                    ) : (
                      <div
                        className="inline outline-none"
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
                    )}

                    <div className="inline-flex gap-1 items-center opacity-0 group-hover/detail:opacity-100 group-focus-within/detail:opacity-100 focus-within:opacity-100 ml-2 align-middle">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            className="text-featureBlue hover:text-featureBlue/80 p-1 rounded-full hover:bg-slate-800"
                            onClick={() =>
                              addExperienceDetail(expIdx, detailIdx)
                            }
                            title="Add detail"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Add bullet point below</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            className="text-red-400 hover:text-red-300 p-1 rounded-full hover:bg-red-950/50"
                            onClick={() =>
                              deleteExperienceDetail(expIdx, detailIdx)
                            }
                            title="Delete detail"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete bullet point</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </li>
                ))}
                {exp.details.length === 0 && (
                  <div
                    className="flex items-start px-0 py-1 text-slate-100 italic cursor-pointer hover:bg-slate-800/30 focus:outline-none rounded"
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
              </ul>
            </div>
          ))
        ) : (
          <div
            className="p-3 text-slate-100 italic cursor-pointer focus:outline-none rounded"
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
        <h2 className="text-xl font-semibold mb-2 text-slate-100">Education</h2>
        {editedResume.education.length > 0 ? (
          editedResume.education.map((edu, eduIdx) => (
            <div
              key={eduIdx}
              className="mb-6 p-3 relative group/entry rounded-md"
            >
              <div className="flex justify-between items-start">
                <div className="flex-grow">
                  {showDiffs &&
                  originalResume &&
                  originalResume.education[eduIdx] &&
                  hasTextDifferences(
                    originalResume.education[eduIdx]?.institution || '',
                    edu.institution
                  ) ? (
                    <InlineDiffEditor
                      oldText={
                        originalResume.education[eduIdx]?.institution || ''
                      }
                      newText={edu.institution}
                      onSave={(value) =>
                        handleEducationBlur(eduIdx, 'institution', value)
                      }
                      onAccept={() =>
                        onAcceptSection?.(`education.${eduIdx}.institution`)
                      }
                      onReject={() =>
                        onRejectSection?.(`education.${eduIdx}.institution`)
                      }
                      className="font-bold text-lg"
                    />
                  ) : (
                    <div
                      className="font-bold text-lg outline-none"
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) =>
                        handleEducationBlur(
                          eduIdx,
                          'institution',
                          e.currentTarget.innerText
                        )
                      }
                    >
                      {edu.institution}
                    </div>
                  )}

                  {showDiffs &&
                  originalResume &&
                  originalResume.education[eduIdx] &&
                  hasTextDifferences(
                    originalResume.education[eduIdx]?.degree || '',
                    edu.degree
                  ) ? (
                    <InlineDiffEditor
                      oldText={originalResume.education[eduIdx]?.degree || ''}
                      newText={edu.degree}
                      onSave={(value) =>
                        handleEducationBlur(eduIdx, 'degree', value)
                      }
                      onAccept={() =>
                        onAcceptSection?.(`education.${eduIdx}.degree`)
                      }
                      onReject={() =>
                        onRejectSection?.(`education.${eduIdx}.degree`)
                      }
                      className="italic"
                    />
                  ) : (
                    <div
                      className="italic outline-none"
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) =>
                        handleEducationBlur(
                          eduIdx,
                          'degree',
                          e.currentTarget.innerText
                        )
                      }
                    >
                      {edu.degree}
                    </div>
                  )}

                  {showDiffs &&
                  originalResume &&
                  originalResume.education[eduIdx] &&
                  hasTextDifferences(
                    originalResume.education[eduIdx]?.dates || '',
                    edu.dates
                  ) ? (
                    <InlineDiffEditor
                      oldText={originalResume.education[eduIdx]?.dates || ''}
                      newText={edu.dates}
                      onSave={(value) =>
                        handleEducationBlur(eduIdx, 'dates', value)
                      }
                      onAccept={() =>
                        onAcceptSection?.(`education.${eduIdx}.dates`)
                      }
                      onReject={() =>
                        onRejectSection?.(`education.${eduIdx}.dates`)
                      }
                      className="text-sm text-gray-600"
                    />
                  ) : (
                    <div
                      className="text-sm text-gray-600 outline-none"
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) =>
                        handleEducationBlur(
                          eduIdx,
                          'dates',
                          e.currentTarget.innerText
                        )
                      }
                    >
                      {edu.dates}
                    </div>
                  )}

                  {showDiffs &&
                  originalResume &&
                  originalResume.education[eduIdx] &&
                  hasTextDifferences(
                    originalResume.education[eduIdx]?.location || '',
                    edu.location
                  ) ? (
                    <InlineDiffEditor
                      oldText={originalResume.education[eduIdx]?.location || ''}
                      newText={edu.location}
                      onSave={(value) =>
                        handleEducationBlur(eduIdx, 'location', value)
                      }
                      onAccept={() =>
                        onAcceptSection?.(`education.${eduIdx}.location`)
                      }
                      onReject={() =>
                        onRejectSection?.(`education.${eduIdx}.location`)
                      }
                      className="text-sm text-gray-600"
                    />
                  ) : (
                    <div
                      className="text-sm text-gray-600 outline-none"
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) =>
                        handleEducationBlur(
                          eduIdx,
                          'location',
                          e.currentTarget.innerText
                        )
                      }
                    >
                      {edu.location}
                    </div>
                  )}
                </div>
                <div className="flex flex-col-reverse sm:flex-row gap-1 opacity-0 group-hover/entry:opacity-100 focus-within:opacity-100 group-focus-within/entry:opacity-100">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-slate-800/60 text-featureBlue focus:outline-none"
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
                        className="h-6 w-6 hover:bg-red-950/50 hover:text-red-400 text-red-500/80 focus:outline-none"
                        onClick={() => deleteEducationEntry(eduIdx)}
                        aria-label={`Delete education entry for ${edu.institution}`}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            deleteEducationEntry(eduIdx);
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
            className="p-3 text-slate-100 italic cursor-pointer focus:outline-none rounded"
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
