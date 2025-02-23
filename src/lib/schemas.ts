import { z } from 'zod';

export const contactSchema = z.object({
  email: z.string().email(),
  phone: z.string(),
  linkedin: z.string().url().optional(),
  website: z.string().url().optional(),
});

export const experienceSchema = z.object({
  company: z.string().min(1),
  title: z.string().min(1),
  dates: z.string().min(1),
  details: z.array(z.string()),
});

export const educationSchema = z.object({
  institution: z.string().min(1),
  degree: z.string().min(1),
  dates: z.string().min(1),
  location: z.string(),
});

export const resumeSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  location: z.string(),
  summary: z.string(),
  skills: z.array(z.string()),
  contact: contactSchema,
  experience: z.array(experienceSchema),
  education: z.array(educationSchema),
});

export const response_format = {
  type: 'json_schema',
  json_schema: {
    name: 'resume',
    strict: true,
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Unique identifier for the resume',
        },
        name: {
          type: 'string',
          description: 'Full name of the person',
        },
        location: {
          type: 'string',
          description: 'Current location or address',
        },
        summary: {
          type: 'string',
          description: 'Professional summary or objective statement',
        },
        skills: {
          type: 'array',
          description: 'List of professional skills and technologies',
          items: {
            type: 'string',
          },
        },
        contact: {
          type: 'object',
          description: 'Contact information',
          properties: {
            email: {
              type: 'string',
              description: 'Email address',
            },
            phone: {
              type: 'string',
              description: 'Phone number',
            },
            linkedin: {
              type: 'string',
              description: 'LinkedIn profile URL',
            },
            website: {
              type: 'string',
              description: 'Personal website URL',
            },
          },
          required: ['email', 'phone'],
        },
        experience: {
          type: 'array',
          description: 'Work experience history',
          items: {
            type: 'object',
            properties: {
              company: {
                type: 'string',
                description: 'Company or organization name',
              },
              title: {
                type: 'string',
                description: 'Job title or position',
              },
              dates: {
                type: 'string',
                description:
                  'Employment duration (e.g., "MM/YYYY - MM/YYYY" or "MM/YYYY - Present")',
              },
              details: {
                type: 'array',
                description: 'List of job responsibilities and achievements',
                items: {
                  type: 'string',
                },
              },
            },
            required: ['company', 'title', 'dates', 'details'],
          },
        },
        education: {
          type: 'array',
          description: 'Educational background',
          items: {
            type: 'object',
            properties: {
              institution: {
                type: 'string',
                description: 'Name of educational institution',
              },
              degree: {
                type: 'string',
                description: 'Degree or certification obtained',
              },
              dates: {
                type: 'string',
                description: 'Period of study (e.g., "MM/YYYY - MM/YYYY")',
              },
              location: {
                type: 'string',
                description: 'Location of the institution',
              },
            },
            required: ['institution', 'degree', 'dates', 'location'],
          },
        },
      },
      required: [
        'name',
        'location',
        'summary',
        'skills',
        'contact',
        'experience',
        'education',
      ],
      additionalProperties: false,
    },
  },
};

export const coverLetterSchema = z.object({
  content: z.string().min(1),
  sections: z.object({
    opening: z.string(),
    body: z.array(z.string()),
    closing: z.string(),
  }),
  tone: z.enum(['professional', 'enthusiastic', 'confident', 'humble']),
  keyPoints: z.array(z.string()),
});

export const coverLetterResponseFormat = {
  type: 'json_schema',
  json_schema: {
    name: 'cover_letter',
    strict: true,
    schema: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          description: 'The complete cover letter text',
        },
        sections: {
          type: 'object',
          description: 'Individual sections of the cover letter',
          properties: {
            opening: {
              type: 'string',
              description:
                'Opening paragraph introducing yourself and your interest',
            },
            body: {
              type: 'array',
              description:
                'Body paragraphs highlighting relevant experience and skills',
              items: {
                type: 'string',
              },
            },
            closing: {
              type: 'string',
              description: 'Closing paragraph with call to action',
            },
          },
          required: ['opening', 'body', 'closing'],
        },
        tone: {
          type: 'string',
          enum: ['professional', 'enthusiastic', 'confident', 'humble'],
          description: 'The overall tone of the cover letter',
        },
        keyPoints: {
          type: 'array',
          description: 'Key points addressed in the cover letter',
          items: {
            type: 'string',
          },
        },
      },
      required: ['content', 'sections', 'tone', 'keyPoints'],
      additionalProperties: false,
    },
  },
};

export const tailoringResponseFormat = {
  type: 'json_object',
  schema: {
    type: 'object',
    properties: {
      requirements: {
        type: 'object',
        properties: {
          keyRequirements: {
            type: 'array',
            items: { type: 'string' },
            description: 'Key requirements extracted from the job description',
          },
          missingRequirements: {
            type: 'array',
            items: { type: 'string' },
            description:
              'Requirements from the job description that are not evident in the resume',
          },
          missingSkills: {
            type: 'array',
            items: { type: 'string' },
            description:
              'Specific skills mentioned in the job description that are missing from the resume',
          },
        },
        required: ['keyRequirements', 'missingRequirements', 'missingSkills'],
      },
      suggestedUpdates: {
        type: 'object',
        properties: {
          summary: {
            type: 'string',
            description:
              'Suggested updated summary that better aligns with the job description',
          },
          skills: {
            type: 'array',
            items: { type: 'string' },
            description: 'Suggested updated skills section',
          },
          experience: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                company: { type: 'string' },
                title: { type: 'string' },
                dates: { type: 'string' },
                details: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
              required: ['company', 'title', 'dates', 'details'],
            },
            description:
              'Suggested updates to experience bullet points to better highlight relevant experience',
          },
        },
      },
    },
    required: ['requirements', 'suggestedUpdates'],
  },
};
