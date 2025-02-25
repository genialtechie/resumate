import { CoverLetterGenerator } from '../generate-cover-letter';
import {
  ResumeContentObject,
  CoverLetterInput,
  GeneratedCoverLetter,
} from '@/types';

// Mock resume data
const mockResume: ResumeContentObject = {
  id: 'test-id',
  name: 'John Doe',
  location: 'San Francisco, CA',
  summary:
    'Experienced software engineer with 5+ years in full-stack development',
  skills: ['TypeScript', 'React', 'Node.js', 'AWS'],
  contact: {
    email: 'john@example.com',
    phone: '(123) 456-7890',
    linkedin: 'https://linkedin.com/in/johndoe',
  },
  experience: [
    {
      company: 'Tech Corp',
      title: 'Senior Software Engineer',
      dates: '2020 - Present',
      details: [
        'Led development of microservices architecture',
        'Improved system performance by 40%',
      ],
    },
  ],
  education: [
    {
      institution: 'University of Technology',
      degree: 'BS in Computer Science',
      dates: '2015 - 2019',
      location: 'San Francisco, CA',
    },
  ],
};

const mockJobDescription = `
Senior Software Engineer
We're looking for an experienced software engineer with strong TypeScript and React skills.
Requirements:
- 5+ years of experience in full-stack development
- Expertise in TypeScript, React, and Node.js
- Experience with cloud platforms (AWS preferred)
- Strong problem-solving skills
`;

describe('CoverLetterGenerator', () => {
  let generator: CoverLetterGenerator;

  beforeEach(() => {
    generator = new CoverLetterGenerator('test-api-key');
  });

  describe('buildPrompt', () => {
    it('should create a well-structured prompt with resume and job info', () => {
      const prompt = (
        generator as unknown as { buildPrompt(input: CoverLetterInput): string }
      ).buildPrompt({
        resume: mockResume,
        jobDescription: mockJobDescription,
        tone: 'professional',
      });

      // Check essential components of the prompt
      expect(prompt).toContain(mockResume.name);
      expect(prompt).toContain(mockResume.summary);
      expect(prompt).toContain(mockJobDescription);
      expect(prompt).toContain('professional tone');
      expect(prompt).toContain(mockResume.experience[0].company);
      expect(prompt).toContain(mockResume.skills.join(', '));
    });

    it('should use default tone if not specified', () => {
      const prompt = (
        generator as unknown as { buildPrompt(input: CoverLetterInput): string }
      ).buildPrompt({
        resume: mockResume,
        jobDescription: mockJobDescription,
      });

      expect(prompt).toContain('professional tone');
    });
  });

  describe('validateResponse', () => {
    const validResponse = {
      content: 'Full cover letter content here...',
      sections: {
        opening: 'Opening paragraph...',
        body: ['Body paragraph 1...', 'Body paragraph 2...'],
        closing: 'Closing paragraph...',
      },
      tone: 'professional' as const,
      keyPoints: ['Matched TypeScript experience', 'AWS expertise'],
    };

    it('should validate a correct response', () => {
      const result = (
        generator as unknown as {
          validateResponse(response: unknown): GeneratedCoverLetter;
        }
      ).validateResponse(validResponse);
      expect(result).toEqual(validResponse);
    });

    it('should throw error on invalid response', () => {
      const invalidResponse = {
        content: '', // Invalid: empty string
        sections: {
          opening: 'Opening',
          body: [], // Invalid: empty array
          closing: 'Closing',
        },
        tone: 'invalid-tone', // Invalid: not in enum
        keyPoints: ['Point 1'],
      };

      expect(() => {
        (
          generator as unknown as {
            validateResponse(response: unknown): GeneratedCoverLetter;
          }
        ).validateResponse(invalidResponse);
      }).toThrow();
    });

    it('should throw error on missing required fields', () => {
      const incompleteResponse = {
        content: 'Content',
        sections: {
          opening: 'Opening',
          // missing body and closing
        },
        tone: 'professional' as const,
        // missing keyPoints
      };

      expect(() => {
        (
          generator as unknown as {
            validateResponse(response: unknown): GeneratedCoverLetter;
          }
        ).validateResponse(incompleteResponse);
      }).toThrow();
    });
  });

  describe('generate', () => {
    it('should generate a cover letter successfully', async () => {
      // Mock the process method
      const mockGenerated: GeneratedCoverLetter = {
        content: 'Generated cover letter...',
        sections: {
          opening: 'Dear Hiring Manager...',
          body: ['First paragraph...', 'Second paragraph...'],
          closing: 'Thank you for your consideration...',
        },
        tone: 'professional',
        keyPoints: ['Relevant experience', 'Technical skills'],
      };

      jest
        .spyOn(
          generator as unknown as { process<T>(input: unknown): Promise<T> },
          'process'
        )
        .mockResolvedValue(mockGenerated);

      const result = await generator.generate({
        resume: mockResume,
        jobDescription: mockJobDescription,
        tone: 'professional',
      });

      expect(result).toEqual(mockGenerated);
      expect(result.content).toBeTruthy();
      expect(result.sections.body.length).toBeGreaterThan(0);
      expect(result.keyPoints.length).toBeGreaterThan(0);
    });

    it('should handle API errors gracefully', async () => {
      jest
        .spyOn(
          generator as unknown as { process<T>(input: unknown): Promise<T> },
          'process'
        )
        .mockRejectedValue(new Error('API Error'));

      await expect(
        generator.generate({
          resume: mockResume,
          jobDescription: mockJobDescription,
        })
      ).rejects.toThrow('API Error');
    });
  });
});
