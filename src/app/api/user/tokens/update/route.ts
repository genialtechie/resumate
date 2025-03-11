import { NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/utils/supabase/auth';
import { TokenService } from '@/lib/utils/token-service';

/**
 * Endpoint for triggering token updates
 * This is a simple endpoint that returns a 200 OK response
 * The client-side code will use this to publish token update events
 */
export async function POST() {
  try {
    const userId = await getUserIdFromRequest();
    const tokens = await TokenService.getUserTokens(userId);
    
    return NextResponse.json({ updated: true, tokens }, { status: 200 });
  } catch (error) {
    console.error('Error processing token update:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to process token update' },
      { status: 500 }
    );
  }
} 