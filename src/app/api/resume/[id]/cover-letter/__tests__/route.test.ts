import { NextRequest } from 'next/server';
import { GET, POST, DELETE } from '../route';
import { PDFHandler } from '@/lib/pdf/handler';
import { generateCoverLetter } from '@/lib/llm/generate-cover-letter';
import { ResumeContentObject, CoverLetterMetadata } from '@/types';

// Mock dependencies
jest.mock('@/lib/pdf/handler');
jest.mock('@/lib/llm/generate-cover-letter');

const mockResume = {
  id: 'test-resume-id',
  fileName: 'test.pdf',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  title: 'Test Resume',
  parsedObject: {
    id: 'test-id',
    name: 'John Doe',
    location: 'San Francisco, CA',
    summary: 'Experienced software engineer',
    skills: ['TypeScript', 'React'],
    contact: {
      email: 'john@example.com',
      phone: '(123) 456-7890',
    },
    experience: [],
    education: [],
  } as ResumeContentObject,
};

const mockCoverLetter: CoverLetterMetadata = {
  id: 'test-cover-id',
  resumeId: 'test-resume-id',
  jobDescription: 'Software Engineer position',
  content: 'Dear Hiring Manager...',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  resume: mockResume,
};

const mockGeneratedCoverLetter = {
  content: 'Generated cover letter content',
  sections: {
    opening: 'Dear Hiring Manager',
    body: ['Body paragraph'],
    closing: 'Thank you',
  },
  tone: 'professional',
  keyPoints: ['Key point 1'],
};

describe('Cover Letter API', () => {
  let mockHandler: jest.Mocked<PDFHandler>;

  beforeEach(() => {
    mockHandler = new PDFHandler() as jest.Mocked<PDFHandler>;
    (PDFHandler as jest.Mock).mockImplementation(() => mockHandler);
    process.env.OPENROUTER_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/resume/[id]/cover-letter', () => {
    it('should return cover letter if it exists', async () => {
      mockHandler.getCoverLetterForResume.mockResolvedValue(mockCoverLetter);

      const request = new NextRequest(
        'http://localhost/api/resume/test-id/cover-letter'
      );
      const response = await GET(request, {
        params: Promise.resolve({ id: 'test-id' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockCoverLetter);
      expect(mockHandler.getCoverLetterForResume).toHaveBeenCalledWith(
        'test-id'
      );
    });

    it('should return 404 if cover letter does not exist', async () => {
      mockHandler.getCoverLetterForResume.mockResolvedValue(null);

      const request = new NextRequest(
        'http://localhost/api/resume/test-id/cover-letter'
      );
      const response = await GET(request, {
        params: Promise.resolve({ id: 'test-id' }),
      });

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/resume/[id]/cover-letter', () => {
    const mockRequest = (body: object) =>
      new NextRequest('http://localhost/api/resume/test-id/cover-letter', {
        method: 'POST',
        body: JSON.stringify(body),
      });

    it('should generate and save a new cover letter', async () => {
      mockHandler.getResume.mockResolvedValue(mockResume);
      mockHandler.saveCoverLetter.mockResolvedValue(mockCoverLetter);
      (generateCoverLetter as jest.Mock).mockResolvedValue(
        mockGeneratedCoverLetter
      );

      const request = mockRequest({
        jobDescription: 'Software Engineer position',
        tone: 'professional',
      });

      const response = await POST(request, {
        params: Promise.resolve({ id: 'test-id' }),
      });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual({
        ...mockCoverLetter,
        generated: mockGeneratedCoverLetter,
      });
      expect(mockHandler.getResume).toHaveBeenCalledWith('test-id');
      expect(generateCoverLetter).toHaveBeenCalledWith(
        mockResume.parsedObject,
        'Software Engineer position',
        'test-api-key',
        'professional'
      );
      expect(mockHandler.saveCoverLetter).toHaveBeenCalledWith(
        'test-id',
        'Software Engineer position',
        mockGeneratedCoverLetter.content
      );
    });

    it('should return 400 if job description is missing', async () => {
      const request = mockRequest({});
      const response = await POST(request, {
        params: Promise.resolve({ id: 'test-id' }),
      });

      expect(response.status).toBe(400);
    });

    it('should return 400 if resume has no parsed content', async () => {
      mockHandler.getResume.mockResolvedValue({
        ...mockResume,
        parsedObject: undefined,
      });

      const request = mockRequest({
        jobDescription: 'Software Engineer position',
      });

      const response = await POST(request, {
        params: Promise.resolve({ id: 'test-id' }),
      });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/resume/[id]/cover-letter', () => {
    it('should delete cover letter if it exists', async () => {
      mockHandler.getCoverLetterForResume.mockResolvedValue(mockCoverLetter);
      mockHandler.deleteCoverLetter.mockResolvedValue();

      const request = new NextRequest(
        'http://localhost/api/resume/test-id/cover-letter',
        {
          method: 'DELETE',
        }
      );

      const response = await DELETE(request, {
        params: Promise.resolve({ id: 'test-id' }),
      });

      expect(response.status).toBe(204);
      expect(mockHandler.deleteCoverLetter).toHaveBeenCalledWith(
        mockCoverLetter.id
      );
    });

    it('should return 404 if cover letter does not exist', async () => {
      mockHandler.getCoverLetterForResume.mockResolvedValue(null);

      const request = new NextRequest(
        'http://localhost/api/resume/test-id/cover-letter',
        {
          method: 'DELETE',
        }
      );

      const response = await DELETE(request, {
        params: Promise.resolve({ id: 'test-id' }),
      });

      expect(response.status).toBe(404);
    });
  });
});
