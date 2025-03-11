import { NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/utils/supabase/auth';
import { TokenService } from '@/lib/utils/token-service';

/**
 * Endpoint for triggering token updates
 * This endpoint fetches the latest token information and returns it
 * The client-side code will use this to publish token update events
 */
export async function POST() {
  try {
    const userId = await getUserIdFromRequest();
    const tokens = await TokenService.getUserTokens(userId);
    
    // Return the updated token information
    return NextResponse.json({ 
      updated: true, 
      tokens,
      timestamp: new Date().toISOString()
    }, { status: 200 });
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