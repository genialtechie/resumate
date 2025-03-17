import { NextResponse, NextRequest } from 'next/server';
import { DocumentHandler } from '@/lib/pdf/handler';
import { getUserIdFromRequest } from '@/lib/utils/supabase/auth';
import { withTokenCheck } from '@/lib/llm/token-guard';
import { TokenLimitError } from '@/lib/utils/token-service';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
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

    // Wrap the saveResume operation with token checking
    const metadata = await withTokenCheck('PARSE_RESUME', () =>
      handler.saveResume(buffer, file.name, userId, file.type)
    );

    return NextResponse.json(metadata, { status: 200 });
  } catch (error) {
    console.error('Error saving resume:', error);

    if (error instanceof TokenLimitError) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to save resume' },
      { status: 500 }
    );
  }
}
