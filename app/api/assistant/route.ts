import { NextRequest, NextResponse } from 'next/server';
import { aiAssistant } from '@/lib/ai-assistant';

/**
 * POST /api/assistant - Natural language itinerary editor
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, destination, currentBudget, currency } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    const response = aiAssistant.processMessage(message, {
      destination: destination || 'Paris, France',
      currentBudget: currentBudget || 2000,
      currency: currency || 'USD',
    });

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Error in AI assistant route:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process assistant request' },
      { status: 500 }
    );
  }
}

