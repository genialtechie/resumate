import { NextRequest, NextResponse } from 'next/server';
import { PDFGenerator } from '@/lib/pdf/generator';
import { getUserIdFromRequest } from '@/lib/utils/supabase/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Verify user is authenticated
    await getUserIdFromRequest();
    
    const { content, name, contact } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Cover letter content is required' },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!contact || !contact.email || !contact.phone) {
      return NextResponse.json(
        { error: 'Contact information is required' },
        { status: 400 }
      );
    }

    // Sanitize content to remove problematic characters
    const sanitizedContent = content
      .replace(/[\u0000-\u001F]/g, ' ')  // Remove control characters
      .replace(/\r\n/g, '\n')            // Normalize line endings
      .replace(/\r/g, '\n');             // Normalize line endings

    // Generate the PDF
    const generator = new PDFGenerator();
    const pdfBytes = await generator.generateCoverLetter(
      sanitizedContent,
      name,
      contact
    );

    // Create response with PDF content
    const response = new NextResponse(pdfBytes);

    // Set appropriate headers for PDF download
    response.headers.set('Content-Type', 'application/pdf');
    response.headers.set(
      'Content-Disposition',
      `attachment; filename="cover-letter-${id}.pdf"`
    );

    return response;
  } catch (error) {
    console.error('Error generating cover letter PDF:', error);
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Provide more detailed error message
    const errorMessage = error instanceof Error 
      ? `Failed to generate cover letter PDF: ${error.message}` 
      : 'Failed to generate cover letter PDF';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 