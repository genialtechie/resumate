import { ResumeContentObject } from '@/types';

/**
 * Generic handler for top-level string fields
 * Updates a simple string field in the resume object when the field loses focus
 *
 * @param {ResumeContentObject} editedResume - The current resume object
 * @param {function} setEditedResume - The function to update the resume object
 * @param {keyof Omit<ResumeContentObject, 'skills' | 'contact' | 'experience' | 'education'>} field - The field to update
 * @param {string} value - The new value for the field
 * @returns {void}
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
 * Parses a formatted string containing contact information and updates the resume object
 *
 * @param {ResumeContentObject} editedResume - The current resume object
 * @param {function} setEditedResume - The function to update the resume object
 * @param {string} value - The new value for the contact info in format "email | phone | website/linkedin"
 * @returns {void}
 */
export const handleContactBlur = (
  editedResume: ResumeContentObject,
  setEditedResume: (resume: ResumeContentObject) => void,
  value: string
) => {
  // Expect contact info in the format "email | phone | website/linkedin"
  const [emailInput = '', phoneInput = '', websiteOrLinkedIn = ''] = value
    .split('|')
    .map((s) => s.trim());

  // Filter out placeholder values
  const email = emailInput === 'your.email@example.com' ? '' : emailInput;
  const phone = phoneInput === '(555) 123-4567' ? '' : phoneInput;

  // Determine if the third field is a LinkedIn URL or website
  let linkedin = '';
  let website = '';

  if (websiteOrLinkedIn && websiteOrLinkedIn !== 'your-website.com') {
    if (websiteOrLinkedIn.includes('linkedin.com')) {
      linkedin = websiteOrLinkedIn;
    } else {
      website = websiteOrLinkedIn;
    }
  }

  setEditedResume({
    ...editedResume,
    contact: {
      email,
      phone,
      linkedin,
      website,
    },
  });
};

/**
 * Handler for updating the skills section from an editable block
 * Parses a comma or newline separated list of skills and updates the resume object
 *
 * @param {ResumeContentObject} editedResume - The current resume object
 * @param {function} setEditedResume - The function to update the resume object
 * @param {string} value - The new skills as a comma or newline separated string
 * @returns {void}
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
 * Handler for updating a field in an experience entry
 * Updates a specific field in a specific experience entry when it loses focus
 *
 * @param {ResumeContentObject} editedResume - The current resume object
 * @param {function} setEditedResume - The function to update the resume object
 * @param {number} index - The index of the experience entry to update
 * @param {keyof Omit<Exclude<ResumeContentObject['experience'], undefined>[number], 'details'>} field - The field to update
 * @param {string} value - The new value for the field
 * @returns {void}
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
 * Handler for updating a bullet point detail in an experience entry
 * Updates a specific bullet point in a specific experience entry
 *
 * @param {ResumeContentObject} editedResume - The current resume object
 * @param {function} setEditedResume - The function to update the resume object
 * @param {number} expIndex - The index of the experience entry
 * @param {number} detailIndex - The index of the detail to update
 * @param {string} value - The new value for the detail
 * @returns {void}
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
 * Adds a new bullet point detail to an experience entry
 * Inserts a new empty detail after the specified index
 *
 * @param {ResumeContentObject} editedResume - The current resume object
 * @param {function} setEditedResume - The function to update the resume object
 * @param {number} expIndex - The index of the experience entry
 * @param {number} detailIndex - The index after which to add the new detail
 * @returns {void}
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
 * Deletes a bullet point detail from an experience entry
 * Removes the detail at the specified index
 *
 * @param {ResumeContentObject} editedResume - The current resume object
 * @param {function} setEditedResume - The function to update the resume object
 * @param {number} expIndex - The index of the experience entry
 * @param {number} detailIndex - The index of the detail to delete
 * @returns {void}
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
 * Adds a new empty experience entry to the resume
 * Creates a new experience entry with default values and adds it to the resume
 *
 * @param {ResumeContentObject} editedResume - The current resume object
 * @param {function} setEditedResume - The function to update the resume object
 * @returns {void}
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
 * Deletes an experience entry from the resume
 * Removes the experience entry at the specified index
 *
 * @param {ResumeContentObject} editedResume - The current resume object
 * @param {function} setEditedResume - The function to update the resume object
 * @param {number} expIndex - The index of the experience entry to delete
 * @returns {void}
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
 * Handler for updating a field in an education entry
 * Updates a specific field in a specific education entry when it loses focus
 *
 * @param {ResumeContentObject} editedResume - The current resume object
 * @param {function} setEditedResume - The function to update the resume object
 * @param {number} index - The index of the education entry to update
 * @param {keyof Exclude<ResumeContentObject['education'], undefined>[number]} field - The field to update
 * @param {string} value - The new value for the field
 * @returns {void}
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
 * Adds a new empty education entry to the resume
 * Creates a new education entry with default values and adds it to the resume
 *
 * @param {ResumeContentObject} editedResume - The current resume object
 * @param {function} setEditedResume - The function to update the resume object
 * @returns {void}
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
 * Deletes an education entry from the resume
 * Removes the education entry at the specified index
 *
 * @param {ResumeContentObject} editedResume - The current resume object
 * @param {function} setEditedResume - The function to update the resume object
 * @param {number} eduIndex - The index of the education entry to delete
 * @returns {void}
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
 * Handles complex merging logic for nested resume sections
 *
 * @param {ResumeContentObject} currentResume - The current resume object
 * @param {Partial<ResumeContentObject>} suggestedUpdates - Suggested updates to merge
 * @returns {ResumeContentObject} The merged resume object
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
