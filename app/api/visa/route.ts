import { NextRequest, NextResponse } from 'next/server';
import { visaService } from '@/lib/visa-service';

/**
 * GET /api/visa - Check visa requirement and passport validity
 * Query params: passportCountry, destinationCountry, passportExpiry
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const passportCountry = searchParams.get('passportCountry') || 'US';
    const destinationCountry = searchParams.get('destinationCountry') || 'Japan';
    const passportExpiry = searchParams.get('passportExpiry');

    const requirement = visaService.checkRequirement(passportCountry, destinationCountry);

    let passportCheck;
    if (passportExpiry) {
      passportCheck = visaService.checkPassportExpiry(
        passportExpiry,
        requirement.passportValidityRequiredMonths
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        requirement,
        passportCheck,
      },
    });
  } catch (error) {
    console.error('Error checking visa requirements:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check visa requirements' },
      { status: 500 }
    );
  }
}

