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
