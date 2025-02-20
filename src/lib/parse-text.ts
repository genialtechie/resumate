// import natural from 'natural';
import { ResumeContentObject } from '@/types/resume';

export class ResumeParser {
  private static readonly SECTION_HEADERS = {
    summary: ['summary', 'professional summary', 'overview', 'objective'],
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

    // Identify the start index for each section
    Object.entries(ResumeParser.SECTION_HEADERS).forEach(
      ([section, headers]) => {
        const start = this.segments.findIndex((s) =>
          headers.some((h) => s.toLowerCase().includes(h.toLowerCase()))
        );
        boundaries[section] = { start, end: -1 };
      }
    );

    // Set end boundaries
    const sections = Object.keys(boundaries);
    sections.forEach((section, index) => {
      if (index < sections.length - 1) {
        boundaries[section].end = boundaries[sections[index + 1]].start;
      } else {
        boundaries[section].end = this.segments.length;
      }
    });

    // Log warnings for missing sections
    Object.entries(boundaries).forEach(([name, { start, end }]) => {
      if (start === -1) console.warn(`${name} section not found`);
      if (end === -1) console.warn(`Section after ${name} not found`);
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
      contact: this.segments.slice(2, 5).join(' ') || '',
    };

    // Parse contact information
    const contact = this.parseContactInfo(headerInfo.contact);

    // Parse summary
    const summary =
      this.sections.summary.start !== -1 && this.sections.summary.end !== -1
        ? this.segments
            .slice(this.sections.summary.start + 1, this.sections.summary.end)
            .join(' ')
        : '';

    // Parse skills
    const skillsStr =
      this.sections.skills.start !== -1 && this.sections.skills.end !== -1
        ? this.segments
            .slice(this.sections.skills.start + 1, this.sections.skills.end)
            .join(' ')
        : '';
    const skills = skillsStr ? skillsStr.split(',').map((s) => s.trim()) : [];

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
