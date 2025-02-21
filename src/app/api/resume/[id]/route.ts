import { NextResponse, NextRequest } from 'next/server';
import { PDFHandler } from '@/lib/pdf/handler';

export const runtime = 'nodejs';

const handler = new PDFHandler();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const metadata = await handler.getResume(id);
    return NextResponse.json(metadata, { status: 200 });
  } catch (error) {
    console.error('Error fetching resume:', error);
    return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type || file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF files are allowed' },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const metadata = await handler.updateResume(id, buffer, file.name);

    return NextResponse.json(metadata, { status: 200 });
  } catch (error) {
    console.error('Error updating resume:', error);

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
    const updates = await request.json();
    const metadata = await handler.updateParsedObject(id, updates);
    return NextResponse.json(metadata, { status: 200 });
  } catch (error) {
    console.error('Error updating resume:', error);
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
    await handler.deleteResume(id);
    return NextResponse.json(
      { message: 'Resume deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting resume:', error);
    return NextResponse.json(
      { error: 'Failed to delete resume' },
      { status: 500 }
    );
  }
}
