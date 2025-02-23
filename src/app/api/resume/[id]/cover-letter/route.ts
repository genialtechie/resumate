import { NextResponse, NextRequest } from 'next/server';
import { PDFHandler } from '@/lib/pdf/handler';
import { generateCoverLetter } from '@/lib/llm/generate-cover-letter';

export const runtime = 'nodejs';

const handler = new PDFHandler();

// Get cover letter for a resume
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const coverLetter = await handler.getCoverLetterForResume(id);
    if (!coverLetter) {
      return NextResponse.json(
        { error: 'No cover letter found for this resume' },
        { status: 404 }
      );
    }
    return NextResponse.json(coverLetter, { status: 200 });
  } catch (error) {
    console.error('Error fetching cover letter:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cover letter' },
      { status: 500 }
    );
  }
}

// Generate and save a new cover letter (or update existing)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { jobDescription, tone, resumeObject } = await request.json();

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

    // Generate the cover letter
    const generated = await generateCoverLetter(
      resumeObject,
      jobDescription,
      process.env.OPENROUTER_API_KEY!,
      tone
    );

    // Save or update the cover letter
    const coverLetter = await handler.saveCoverLetter(
      id,
      jobDescription,
      generated.content
    );

    return NextResponse.json({ ...coverLetter, generated }, { status: 201 });
  } catch (error) {
    console.error('Error generating cover letter:', error);
    return NextResponse.json(
      { error: 'Failed to generate cover letter' },
      { status: 500 }
    );
  }
}

// Delete cover letter for a resume
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const coverLetter = await handler.getCoverLetterForResume(id);
    if (!coverLetter) {
      return NextResponse.json(
        { error: 'No cover letter found for this resume' },
        { status: 404 }
      );
    }
    await handler.deleteCoverLetter(coverLetter.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting cover letter:', error);
    return NextResponse.json(
      { error: 'Failed to delete cover letter' },
      { status: 500 }
    );
  }
}
