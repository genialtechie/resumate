import { NextResponse } from 'next/server';
import { PDFHandler } from '@/lib/pdf/handler';

export const runtime = 'nodejs';

const storage = new PDFHandler();

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const metadata = await storage.saveResume(buffer, file.name);

    return NextResponse.json(metadata, { status: 200 });
  } catch (error) {
    console.error('Error saving resume:', error);
    return NextResponse.json(
      { error: 'Failed to save resume' },
      { status: 500 }
    );
  }
}
