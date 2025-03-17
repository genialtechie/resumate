import { NextResponse, NextRequest } from 'next/server';
import { PDFHandler, DocumentHandler } from '@/lib/pdf/handler';
import { getUserIdFromRequest } from '@/lib/utils/supabase/auth';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const userId = await getUserIdFromRequest();

    const handler = new PDFHandler();
    const metadata = await handler.getResume(id, userId);
    return NextResponse.json(metadata, { status: 200 });
  } catch (error) {
    console.error('Error fetching resume:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const userId = await getUserIdFromRequest();

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // More lenient file type checking
    let isValidType = false;

    // PDF check
    if (file.type === 'application/pdf') {
      isValidType = true;
    }

    // DOCX check - accept any type containing these key parts
    if (
      file.type.includes('officedocument') &&
      file.type.includes('wordprocessing') &&
      (file.name.endsWith('.docx') || file.name.endsWith('.DOCX'))
    ) {
      isValidType = true;
    }

    // TXT check
    if (
      file.type === 'text/plain' ||
      file.name.endsWith('.txt') ||
      file.name.endsWith('.TXT')
    ) {
      isValidType = true;
    }

    if (!isValidType) {
      return NextResponse.json(
        {
          error: 'Invalid file type. Only PDF, DOCX, and TXT files are allowed',
        },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const handler = new DocumentHandler();
    const metadata = await handler.updateResume(
      id,
      buffer,
      file.name,
      userId,
      file.type
    );

    return NextResponse.json(metadata, { status: 200 });
  } catch (error) {
    console.error('Error updating resume:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error instanceof Error && error.message === 'Resume not found') {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Failed to update resume' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const userId = await getUserIdFromRequest();

    const updates = await request.json();
    const handler = new PDFHandler();
    const metadata = await handler.updateParsedObject(id, updates, userId);
    return NextResponse.json(metadata, { status: 200 });
  } catch (error) {
    console.error('Error updating resume:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to update resume' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const userId = await getUserIdFromRequest();

    const handler = new PDFHandler();
    await handler.deleteResume(id, userId);
    return NextResponse.json(
      { message: 'Resume deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting resume:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to delete resume' },
      { status: 500 }
    );
  }
}
