import { NextRequest, NextResponse } from 'next/server';
import { PDFGenerator } from '@/lib/pdf/generator';
import { ResumeContentObject } from '@/types';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    const resumeData = await request.json();

    if (!resumeData || !resumeData.content) {
      return NextResponse.json(
        { error: 'Resume content is required' },
        { status: 400 }
      );
    }

    const generator = new PDFGenerator();
    const pdfBytes = await generator.generateResume(
      resumeData.content as ResumeContentObject
    );

    // Create response with PDF content
    const response = new NextResponse(pdfBytes);

    // Set appropriate headers for PDF download
    response.headers.set('Content-Type', 'application/pdf');
    response.headers.set(
      'Content-Disposition',
      `attachment; filename="resume-${id}.pdf"`
    );

    return response;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
