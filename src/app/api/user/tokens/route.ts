import { NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/utils/supabase/auth';
import { TokenService } from '@/lib/utils/token-service';

export async function GET() {
  try {
    const userId = await getUserIdFromRequest();
    const tokens = await TokenService.getUserTokens(userId);

    return NextResponse.json(tokens, { status: 200 });
  } catch (error) {
    console.error('Error fetching user tokens:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch token information' },
      { status: 500 }
    );
  }
}
