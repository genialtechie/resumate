import { NextResponse } from 'next/server';
import { PDFHandler } from '@/lib/pdf/handler';
import { getUserIdFromRequest } from '@/lib/utils/supabase/auth';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromRequest();

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const handler = new PDFHandler();
    const metadata = await handler.saveResume(buffer, file.name, userId);

    return NextResponse.json(metadata, { status: 200 });
  } catch (error) {
    console.error('Error saving resume:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to save resume' },
      { status: 500 }
    );
  }
}
