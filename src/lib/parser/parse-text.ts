import { ResumeContentObject } from '@/types';

export class ResumeParser {
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

  private static readonly DATE_REGEX =
    /\b(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*|(?:0?[1-9]|1[0-2])\/)\s*(?:20\d{2})\s*(?:-|to|–)\s*(?:Present|(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*|(?:0?[1-9]|1[0-2])\/)\s*(?:20\d{2}))\b/i;

  private segments: string[];
  private sections: Record<string, { start: number; end: number }>;

  constructor(content: string) {
    // Try line-based parsing first
    const lines = content.split('\n').filter(Boolean);
    this.segments =
      lines.length > 1 ? lines : content.split(/\s{2,}/).filter(Boolean);
    this.sections = this.findSectionBoundaries();
  }

  private static escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

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

export function parseResume(content: string): ResumeContentObject {
  const parser = new ResumeParser(content);
  return parser.parse();
}
