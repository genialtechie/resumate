import { NextResponse, NextRequest } from 'next/server';
import { ResumeTailor } from '@/lib/llm/resume-tailor';
import { ResumeContentObject } from '@/types';

export const runtime = 'nodejs';

// Initialize the resume tailor with OpenAI API key
const tailor = new ResumeTailor(process.env.OPENROUTER_API_KEY!);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { jobDescription, resumeObject } = await request.json();

    // Validate required fields
    if (!jobDescription) {
      return NextResponse.json(
        { error: 'Job description is required' },
        { status: 400 }
      );
    }

    if (!resumeObject) {
      return NextResponse.json(
        { error: 'Resume object is required' },
        { status: 400 }
      );
    }

    // Generate tailoring suggestions
    const tailoringResult = await tailor.tailorResume(
      resumeObject as ResumeContentObject,
      jobDescription
    );

    return NextResponse.json(
      {
        id,
        tailoringResult,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error tailoring resume:', error);
    return NextResponse.json(
      { error: 'Failed to tailor resume' },
      { status: 500 }
    );
  }
}
