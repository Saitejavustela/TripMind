import { NextRequest, NextResponse } from 'next/server';
import { collaborativeEngine } from '@/lib/collaborative';

/**
 * GET /api/collaboration - Get sessions for a trip
 * Query param: tripId
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tripId = searchParams.get('tripId');

    if (!tripId) {
      return NextResponse.json(
        { success: false, error: 'Trip ID is required' },
        { status: 400 }
      );
    }

    const session = await collaborativeEngine.getSessionByTripId(tripId);

    return NextResponse.json({
      success: true,
      data: session || null,
    });
  } catch (error) {
    console.error('Error getting collaboration session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get collaboration session' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/collaboration - Create or update a session
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tripId, title, action, participantId, participantName, role } = body;

    if (!tripId) {
      return NextResponse.json(
        { success: false, error: 'Trip ID is required' },
        { status: 400 }
      );
    }

    const existingSession = await collaborativeEngine.getSessionByTripId(tripId);
    let session;

    if (action === 'create') {
      // Create new session
      session = collaborativeEngine.createSession(tripId, title || 'Trip Collaboration', participantId || 'organizer');
    } else if (action === 'add-participant') {
      // Add participant
      session = collaborativeEngine.addParticipant(
        existingSession?.id || `collab_${Date.now()}`,
        participantId || 'user-new',
        participantName || 'New Participant',
        role || 'contributor'
      );
      session = await collaborativeEngine.getSessionByTripId(tripId);
    } else if (action === 'vote') {
      // Cast vote
      if (!participantId || !participantName) {
        return NextResponse.json(
          { success: false, error: 'Participant ID and name required for voting' },
          { status: 400 }
        );
      }
      collaborativeEngine.castVote(
        existingSession?.id || '',
        participantId,
        participantName,
        body.voteType || 'attraction',
        body.itemId || '',
        body.itemTitle || '',
        body.upvote !== undefined ? body.upvote : true
      );
      session = await collaborativeEngine.getSessionByTripId(tripId);
    } else if (action === 'consensus') {
      // Get consensus results
      const type = body.type || 'attraction';
      if (existingSession) {
        const consensus = collaborativeEngine.getConsensus(
          existingSession.id,
          type
        );
        return NextResponse.json({
          success: true,
          data: { consensus },
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error('Error in collaboration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed collaboration operation' },
      { status: 500 }
    );
  }
}