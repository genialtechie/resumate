import { ResumeContentObject } from '@/types';

/**
 * Generic handler for top-level string fields
 * @param editedResume - The current resume object
 * @param setEditedResume - The function to update the resume object
 * @param field - The field to update
 * @param value - The new value for the field
 */
export const handleFieldBlur = (
  editedResume: ResumeContentObject,
  setEditedResume: (resume: ResumeContentObject) => void,
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
};

/**
 * Handler for updating the contact info from a single editable block
 * @param editedResume - The current resume object
 * @param setEditedResume - The function to update the resume object
 * @param value - The new value for the contact info
 */
export const handleContactBlur = (
  editedResume: ResumeContentObject,
  setEditedResume: (resume: ResumeContentObject) => void,
  value: string
) => {
  // Expect contact info in the format "email | phone | linkedin"
  const [email = '', phone = '', linkedin = ''] = value
    .split('|')
    .map((s) => s.trim());
  setEditedResume({
    ...editedResume,
    contact: { email, phone, linkedin },
  });
};

/**
 * Handler for updating skills
 * @param editedResume - The current resume object
 * @param setEditedResume - The function to update the resume object
 * @param value - The new value for the skills
 */
export const handleSkillsBlur = (
  editedResume: ResumeContentObject,
  setEditedResume: (resume: ResumeContentObject) => void,
  value: string
) => {
  const skills = value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  setEditedResume({
    ...editedResume,
    skills,
  });
};

/**
 * For updating an experience entry
 * @param editedResume - The current resume object
 * @param setEditedResume - The function to update the resume object
 * @param index - The index of the experience entry
 * @param field - The field to update
 */
export const handleExperienceBlur = (
  editedResume: ResumeContentObject,
  setEditedResume: (resume: ResumeContentObject) => void,
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
};

/**
 * For updating a single detail line in an experience entry
 * @param editedResume - The current resume object
 * @param setEditedResume - The function to update the resume object
 * @param expIndex - The index of the experience entry
 * @param detailIndex - The index of the detail entry to update
 * @param value - The new value for the detail entry
 */
export const handleExperienceDetailChange = (
  editedResume: ResumeContentObject,
  setEditedResume: (resume: ResumeContentObject) => void,
  expIndex: number,
  detailIndex: number,
  value: string
) => {
  const newExp = [...editedResume.experience];
  const newDetails = [...newExp[expIndex].details];

  if (value.trim() === '') {
    // Remove empty detail
    newDetails.splice(detailIndex, 1);
  } else {
    newDetails[detailIndex] = value.trim();
  }

  newExp[expIndex] = { ...newExp[expIndex], details: newDetails };
  setEditedResume({ ...editedResume, experience: newExp });
};

/**
 * Adds a new detail entry after the specified index
 * @param editedResume - The current resume object
 * @param setEditedResume - The function to update the resume object
 * @param expIndex - The index of the experience entry
 * @param detailIndex - The index of the detail entry to add
 */
export const addExperienceDetail = (
  editedResume: ResumeContentObject,
  setEditedResume: (resume: ResumeContentObject) => void,
  expIndex: number,
  detailIndex: number
) => {
  const newExp = [...editedResume.experience];
  const newDetails = [...newExp[expIndex].details];
  newDetails.splice(detailIndex + 1, 0, '');
  newExp[expIndex] = { ...newExp[expIndex], details: newDetails };
  setEditedResume({ ...editedResume, experience: newExp });
};

/**
 * Deletes a detail entry
 * @param editedResume - The current resume object
 * @param setEditedResume - The function to update the resume object
 * @param expIndex - The index of the experience entry
 * @param detailIndex - The index of the detail entry to delete
 */
export const deleteExperienceDetail = (
  editedResume: ResumeContentObject,
  setEditedResume: (resume: ResumeContentObject) => void,
  expIndex: number,
  detailIndex: number
) => {
  const newExp = [...editedResume.experience];
  const newDetails = [...newExp[expIndex].details];
  newDetails.splice(detailIndex, 1);
  newExp[expIndex] = { ...newExp[expIndex], details: newDetails };
  setEditedResume({ ...editedResume, experience: newExp });
};

/**
 * Adds a new experience entry
 * @param editedResume - The current resume object
 * @param setEditedResume - The function to update the resume object
 */
export const addExperienceEntry = (
  editedResume: ResumeContentObject,
  setEditedResume: (resume: ResumeContentObject) => void
) => {
  const newExp = [...editedResume.experience];
  newExp.push({
    company: 'New Company',
    title: 'New Role',
    dates: 'Start Date - End Date',
    details: [],
  });
  setEditedResume({ ...editedResume, experience: newExp });
};

/**
 * Deletes an experience entry
 * @param editedResume - The current resume object
 * @param setEditedResume - The function to update the resume object
 * @param expIndex - The index of the experience entry to delete
 */
export const deleteExperienceEntry = (
  editedResume: ResumeContentObject,
  setEditedResume: (resume: ResumeContentObject) => void,
  expIndex: number
) => {
  const newExp = [...editedResume.experience];
  newExp.splice(expIndex, 1);
  setEditedResume({ ...editedResume, experience: newExp });
};

/**
 * For updating an education entry
 * @param editedResume - The current resume object
 * @param setEditedResume - The function to update the resume object
 * @param index - The index of the education entry
 * @param field - The field to update
 * @param value - The new value for the field
 */
export const handleEducationBlur = (
  editedResume: ResumeContentObject,
  setEditedResume: (resume: ResumeContentObject) => void,
  index: number,
  field: keyof Exclude<ResumeContentObject['education'], undefined>[number],
  value: string
) => {
  const newEdu = [...editedResume.education];
  newEdu[index] = { ...newEdu[index], [field]: value };
  setEditedResume({ ...editedResume, education: newEdu });
};

/**
 * Adds a new education entry
 * @param editedResume - The current resume object
 * @param setEditedResume - The function to update the resume object
 */
export const addEducationEntry = (
  editedResume: ResumeContentObject,
  setEditedResume: (resume: ResumeContentObject) => void
) => {
  const newEdu = [...editedResume.education];
  newEdu.push({
    institution: 'New Institution',
    degree: 'New Degree',
    dates: 'Start Date - End Date',
    location: 'Location',
  });
  setEditedResume({ ...editedResume, education: newEdu });
};

/**
 * Deletes an education entry
 * @param editedResume - The current resume object
 * @param setEditedResume - The function to update the resume object
 * @param eduIndex - The index of the education entry to delete
 */
export const deleteEducationEntry = (
  editedResume: ResumeContentObject,
  setEditedResume: (resume: ResumeContentObject) => void,
  eduIndex: number
) => {
  const newEdu = [...editedResume.education];
  newEdu.splice(eduIndex, 1);
  setEditedResume({ ...editedResume, education: newEdu });
};

/**
 * Merges suggested updates into the current resume object
 * @param currentResume - The current resume object
 * @param suggestedUpdates - Partial<ResumeContentObject> - The suggested updates
 * @returns ResumeContentObject - The updated resume object
 */
export function mergeResumeUpdates(
  currentResume: ResumeContentObject,
  suggestedUpdates: Partial<ResumeContentObject>
): ResumeContentObject {
  // Use structuredClone for deep cloning of the resume object
  const updatedResume = structuredClone(currentResume);

  // Update summary if provided
  if (suggestedUpdates.summary) {
    updatedResume.summary = suggestedUpdates.summary;
  }

  // Merge skills arrays, removing duplicates and preserving order
  if (suggestedUpdates.skills) {
    const existingSkills = new Set(currentResume.skills);
    const newSkills = suggestedUpdates.skills.filter(
      (skill) => !existingSkills.has(skill)
    );
    updatedResume.skills = [...currentResume.skills, ...newSkills];
  }

  // Update experience entries if provided
  if (suggestedUpdates.experience) {
    // Create a map of existing companies to their experience objects
    const companyMap = new Map(
      currentResume.experience.map((exp) => [exp.company, exp])
    );

    // Process each suggested experience
    suggestedUpdates.experience.forEach((suggestedExp) => {
      const existingExp = companyMap.get(suggestedExp.company);

      if (existingExp) {
        // Only update the details array, preserve other fields
        const index = updatedResume.experience.findIndex(
          (exp) => exp.company === suggestedExp.company
        );
        updatedResume.experience[index] = {
          ...existingExp,
          details: suggestedExp.details,
        };
      }
      // Skip adding new experience entries as we only want to update existing ones
    });
  }

  return updatedResume;
}
