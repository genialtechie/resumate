import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ResumeContentObject } from '@/types/resume';
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function mergeResumeUpdates(
  currentResume: ResumeContentObject,
  suggestedUpdates: Partial<ResumeContentObject>
): ResumeContentObject {
  const updatedResume = { ...currentResume };

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
