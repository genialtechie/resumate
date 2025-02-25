import { NextResponse, NextRequest } from 'next/server';
import { ResumeTailor } from '@/lib/llm/resume-tailor';
import { ResumeContentObject } from '@/types';
import { getUserIdFromRequest } from '@/lib/utils/supabase/auth';
import { withTokenCheck } from '@/lib/llm/token-guard';
import { TokenLimitError } from '@/lib/utils/token-service';

export const runtime = 'nodejs';

// Initialize the resume tailor with OpenAI API key
const tailor = new ResumeTailor(process.env.OPENROUTER_API_KEY!);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const userId = await getUserIdFromRequest();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    // Generate tailoring suggestions with token check
    const tailoringResult = await withTokenCheck('TAILOR_RESUME', () =>
      tailor.tailorResume(resumeObject as ResumeContentObject, jobDescription)
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

    if (error instanceof TokenLimitError) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to tailor resume' },
      { status: 500 }
    );
  }
}
