import { NextRequest, NextResponse } from 'next/server';
import { PreferenceManager } from '@/lib/preferences';

/**
 * GET /api/preferences - Get saved preferences
 */
export async function GET(request: NextRequest) {
  try {
    const preferences = PreferenceManager.getPreferences();
    return NextResponse.json({ success: true, data: preferences });
  } catch (err) {
    console.error('Get preferences error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve preferences' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/preferences - Save/update preferences
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const updated = PreferenceManager.savePreferences(body);
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error('Save preferences error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to save preferences' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/preferences - Delete preferences
 */
export async function DELETE(request: NextRequest) {
  try {
    PreferenceManager.deletePreferences();
    return NextResponse.json({ success: true, message: 'Preferences deleted' });
  } catch (err) {
    console.error('Delete preferences error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to delete preferences' },
      { status: 500 }
    );
  }
}