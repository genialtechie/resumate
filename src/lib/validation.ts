import { ResumeContentObject } from '@/types/resume';

export function isValidResumeObject(obj: unknown): obj is ResumeContentObject {
  if (!obj || typeof obj !== 'object') return false;

  const resume = obj as Partial<ResumeContentObject>;

  // Check required string fields
  if (
    typeof resume.id !== 'string' ||
    typeof resume.name !== 'string' ||
    typeof resume.location !== 'string' ||
    typeof resume.summary !== 'string'
  ) {
    return false;
  }

  // Check skills array
  if (
    !Array.isArray(resume.skills) ||
    !resume.skills.every((s) => typeof s === 'string')
  ) {
    return false;
  }

  // Check contact object
  if (
    !resume.contact ||
    typeof resume.contact !== 'object' ||
    typeof resume.contact.email !== 'string' ||
    typeof resume.contact.phone !== 'string'
  ) {
    return false;
  }

  // Optional contact fields
  if (
    (resume.contact.linkedin !== undefined &&
      typeof resume.contact.linkedin !== 'string') ||
    (resume.contact.website !== undefined &&
      typeof resume.contact.website !== 'string')
  ) {
    return false;
  }

  // Check experience array
  if (!Array.isArray(resume.experience)) return false;
  for (const exp of resume.experience) {
    if (
      !exp ||
      typeof exp !== 'object' ||
      typeof exp.company !== 'string' ||
      typeof exp.title !== 'string' ||
      typeof exp.dates !== 'string' ||
      !Array.isArray(exp.details) ||
      !exp.details.every((d) => typeof d === 'string')
    ) {
      return false;
    }
  }

  // Check education array
  if (!Array.isArray(resume.education)) return false;
  for (const edu of resume.education) {
    if (
      !edu ||
      typeof edu !== 'object' ||
      typeof edu.institution !== 'string' ||
      typeof edu.degree !== 'string' ||
      typeof edu.dates !== 'string' ||
      typeof edu.location !== 'string'
    ) {
      return false;
    }
  }

  return true;
}
