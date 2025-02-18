import { NextResponse } from 'next/server';
import { PDFHandler } from '@/lib/pdf/storage';

export const runtime = 'nodejs';

const storage = new PDFHandler();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  try {
    const metadata = await storage.getResume(id);
    return NextResponse.json(metadata, { status: 200 });
  } catch (error) {
    console.error('Error fetching resume:', error);
    return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
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
    const metadata = await storage.updateResume(id, buffer, file.name);

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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  try {
    await storage.deleteResume(id);
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
