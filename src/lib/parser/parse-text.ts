import { ResumeContentObject } from '@/types';

/**
 * ResumeParser is responsible for parsing resume text content into a structured format.
 * It identifies different sections of a resume and extracts relevant information.
 *
 * @class
 * @example
 * ```typescript
 * const parser = new ResumeParser(resumeText);
 * const parsedResume = parser.parse();
 * ```
 */
export class ResumeParser {
  /**
   * Common section headers found in resumes, used for section identification.
   * Grouped by section type with various alternative spellings and formats.
   * @private
   * @static
   */
  private static readonly SECTION_HEADERS = {
    summary: ['professional summary', 'summary', 'overview', 'objective'],
    skills: ['skills', 'technical skills', 'core competencies', 'expertise'],
    experience: [
      'experience',
      'work experience',
      'professional experience',
      'employment',
    ],
    education: ['education', 'academic background', 'educational background'],
  };

  /**
   * Common bullet point characters used in resume formatting.
   * Used to identify bullet point lists in experience and skills sections.
   * @private
   * @static
   */
  private static readonly BULLET_POINTS = [
    '•',
    '-',
    '*',
    '›',
    '⁃',
    '○',
    '◦',
    '▪',
    '▫',
  ];

  /**
   * Regular expression for identifying date ranges in work experience.
   * Matches common date formats like "Jan 2020 - Present" or "01/2020 - 12/2022".
   * @private
   * @static
   */
  private static readonly DATE_REGEX =
    /\b(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*|(?:0?[1-9]|1[0-2])\/)\s*(?:20\d{2})\s*(?:-|to|–)\s*(?:Present|(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*|(?:0?[1-9]|1[0-2])\/)\s*(?:20\d{2}))\b/i;

  /** Array of text segments from the resume */
  private segments: string[];

  /** Map of identified sections and their boundaries in the segments array */
  private sections: Record<string, { start: number; end: number }>;

  /**
   * Creates a new ResumeParser instance.
   *
   * @param {string} content - The raw text content of the resume
   */
  constructor(content: string) {
    // Try line-based parsing first
    const lines = content.split('\n').filter(Boolean);
    this.segments =
      lines.length > 1 ? lines : content.split(/\s{2,}/).filter(Boolean);
    this.sections = this.findSectionBoundaries();
  }

  /**
   * Escapes special characters in a string for use in a regular expression.
   *
   * @private
   * @static
   * @param {string} string - String to escape
   * @returns {string} Escaped string safe for regex usage
   */
  private static escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Identifies the boundaries of different sections in the resume.
   * Searches for section headers and determines where each section starts and ends.
   *
   * @private
   * @returns {Record<string, { start: number; end: number }>} Map of section names to their start and end indices
   */
  private findSectionBoundaries(): Record<
    string,
    { start: number; end: number }
  > {
    const boundaries: Record<string, { start: number; end: number }> = {};
    const foundSections: { name: string; index: number }[] = [];

    // Find all section headers and their positions
    this.segments.forEach((segment, index) => {
      const normalizedSegment = segment.trim().toLowerCase();
      Object.entries(ResumeParser.SECTION_HEADERS).forEach(
        ([section, headers]) => {
          if (headers.some((h) => normalizedSegment === h.toLowerCase())) {
            foundSections.push({ name: section, index });
          }
        }
      );
    });

    // Sort sections by their position in the document
    foundSections.sort((a, b) => a.index - b.index);

    // Set boundaries for each section
    foundSections.forEach((section, index) => {
      const nextSection = foundSections[index + 1];
      boundaries[section.name] = {
        start: section.index,
        end: nextSection ? nextSection.index : this.segments.length,
      };
    });

    // Initialize missing sections with -1
    Object.keys(ResumeParser.SECTION_HEADERS).forEach((section) => {
      if (!boundaries[section]) {
        boundaries[section] = { start: -1, end: -1 };
      }
    });

    return boundaries;
  }

  /**
   * Extracts contact information from the resume text.
   * Looks for email addresses, phone numbers, and URLs.
   *
   * @private
   * @param {string} text - The text to parse for contact information
   * @returns {{ email: string, phone: string, linkedin: string, website: string }} Extracted contact information
   */
  private parseContactInfo(text: string) {
    const tokens = text.split(/[\s,]+/);

    return {
      email: tokens.find((t) => /^[\w.-]+@[\w.-]+\.\w+$/.test(t)) || '',
      phone:
        tokens.find((t) =>
          /^(?:\+\d{1,2}\s?)?(?:\(?\d{3}\)?[-.\s]?|\d{3}[-.\s]?)\d{3}[-.\s]?\d{4}$/.test(
            t.replace(/\s+/g, ' ').trim()
          )
        ) || '(123) 456-7890',
      linkedin: tokens.find((t) => /(linkedin\.com\/[\w-]+)/i.test(t)) || '',
      website:
        tokens.find((t) =>
          /^(?!.*@.*$)((?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/i.test(
            t
          )
        ) || '',
    };
  }

  /**
   * Parses the experience section of the resume.
   * Extracts job titles, companies, dates, and bullet points.
   *
   * @private
   * @param {string[]} segments - Text segments from the experience section
   * @returns {Array<{ title: string, company: string, date: string, details: string[] }>} Structured experience data
   */
  private parseExperience(segments: string[]) {
    const experience: {
      company: string;
      title: string;
      dates: string;
      details: string[];
    }[] = [];

    const bulletPattern = new RegExp(
      `^(?:${ResumeParser.BULLET_POINTS.map(ResumeParser.escapeRegExp).join(
        '|'
      )})\\s*`
    );

    let currentExp: {
      company: string;
      title: string;
      dates: string;
      details: string[];
    } | null = null;

    segments.forEach((segment) => {
      if (ResumeParser.DATE_REGEX.test(segment)) {
        if (currentExp) {
          experience.push(currentExp);
        }
        const parts = segment.split(/\s{2,}/).filter(Boolean);
        const company = parts[0] || '';
        const datePart =
          parts.find((p) => ResumeParser.DATE_REGEX.test(p)) || '';
        const titleParts = parts.filter((p) => p !== company && p !== datePart);

        currentExp = {
          company: company.trim(),
          title: titleParts.join(' ').trim(),
          dates: datePart.trim(),
          details: [],
        };
      } else if (bulletPattern.test(segment)) {
        if (currentExp) {
          currentExp.details.push(segment.replace(bulletPattern, '').trim());
        }
      } else {
        if (currentExp) {
          currentExp.details.push(segment.trim());
        }
      }
    });

    if (currentExp) {
      experience.push(currentExp);
    }

    return experience;
  }

  /**
   * Parses the education section of the resume.
   * Extracts degrees, institutions, and graduation dates.
   *
   * @private
   * @param {string[]} segments - Text segments from the education section
   * @returns {Array<{ degree: string, institution: string, date: string }>} Structured education data
   */
  private parseEducation(segments: string[]) {
    const education: {
      institution: string;
      degree: string;
      dates: string;
      location: string;
    }[] = [];

    let currentEdu: {
      institution: string;
      degree: string;
      dates: string;
      location: string;
    } | null = null;

    segments.forEach((segment) => {
      if (ResumeParser.DATE_REGEX.test(segment)) {
        if (currentEdu) {
          education.push(currentEdu);
        }
        const parts = segment.split(/\s{2,}/).filter(Boolean);
        const institution = parts[0] || '';
        const datePart =
          parts.find((p) => ResumeParser.DATE_REGEX.test(p)) || '';
        const degreeParts = parts.filter(
          (p) => p !== institution && p !== datePart
        );
        currentEdu = {
          institution: institution.trim(),
          degree: degreeParts.join(' ').trim(),
          dates: datePart.trim(),
          location: '',
        };
      } else {
        if (currentEdu) {
          currentEdu.degree += ' ' + segment.trim();
        }
      }
    });

    if (currentEdu) {
      education.push(currentEdu);
    }

    return education;
  }

  /**
   * Parses the entire resume and returns a structured object.
   * This is the main method that should be called after creating a ResumeParser instance.
   *
   * @public
   * @returns {ResumeContentObject} Structured resume data
   */
  public parse(): ResumeContentObject {
    // Extract header info
    const headerInfo = {
      name: this.segments[0] || '',
      location: this.segments[1] || '',
      contact: this.segments[2] || '',
    };

    // Parse contact information
    const contact = this.parseContactInfo(headerInfo.contact);

    // Parse summary
    const summary =
      this.sections.summary.start !== -1
        ? this.segments
            .slice(this.sections.summary.start + 1, this.sections.summary.end)
            .join(' ')
        : '';

    // Parse skills
    const skillsStr =
      this.sections.skills.start !== -1
        ? this.segments
            .slice(this.sections.skills.start + 1, this.sections.skills.end)
            .join(' ')
        : '';
    const skills = skillsStr
      ? skillsStr
          .split(/[,\s]+/)
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    // Parse experience
    const experience =
      this.sections.experience.start !== -1 &&
      this.sections.experience.end !== -1
        ? this.parseExperience(
            this.segments.slice(
              this.sections.experience.start + 1,
              this.sections.experience.end
            )
          )
        : [];

    // Parse education
    const educationSegments =
      this.sections.education.start !== -1
        ? this.segments.slice(this.sections.education.start + 1)
        : [];
    const education = educationSegments.length
      ? this.parseEducation(educationSegments)
      : [];

    return {
      id: '', // ID to be assigned externally
      name: headerInfo.name,
      location: headerInfo.location,
      summary,
      skills,
      contact,
      experience,
      education,
    };
  }
}

/**
 * Utility function to parse a resume string into a structured object.
 * Creates a ResumeParser instance and returns the parsed result.
 *
 * @param {string} content - The raw text content of the resume
 * @returns {ResumeContentObject} Structured resume data
 * @example
 * ```typescript
 * const parsedResume = parseResume(resumeText);
 * ```
 */
export function parseResume(content: string): ResumeContentObject {
  const parser = new ResumeParser(content);
  return parser.parse();
}
