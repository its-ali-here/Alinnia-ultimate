import { NextResponse } from 'next/server';
import { createProfile, createOrganization, joinOrganizationByCode } from '@/lib/database';

export async function POST(req: Request) {
  try {
    const { 
        userId, 
        fullName, 
        organizationType, 
        organizationCode, 
        organizationData 
    } = await req.json();

    if (!userId || !fullName) {
      return NextResponse.json({ error: 'Missing user information' }, { status: 400 });
    }

    // Create the user profile
    await createProfile(userId, fullName);

    if (organizationType === 'new') {
      if (!organizationData) {
        return NextResponse.json({ error: 'Missing organization data' }, { status: 400 });
      }
      const org = await createOrganization(userId, organizationData);
      return NextResponse.json({ organizationCode: org.organization_code }, { status: 200 });

    } else if (organizationType === 'existing') {
      if (!organizationCode) {
        return NextResponse.json({ error: 'Missing organization code' }, { status: 400 });
      }
      await joinOrganizationByCode(userId, organizationCode);
      return NextResponse.json({ message: 'Successfully joined organization' }, { status: 200 });
    }

    return NextResponse.json({ error: 'Invalid organization type' }, { status: 400 });

  } catch (error) {
    console.error('Signup API Error:', error);
    return NextResponse.json({ error: (error as Error).message || 'An unexpected error occurred.' }, { status: 500 });
  }
}
