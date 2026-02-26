import { NextRequest, NextResponse } from 'next/server';
import { getTeamMembers, addTeamMember, removeTeamMember } from '@/lib/memory';

/**
 * GET /api/team?companyId=xxx
 * List team members for a company
 */
export async function GET(request: NextRequest) {
  try {
    const companyId = request.nextUrl.searchParams.get('companyId');
    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'Missing companyId' },
        { status: 400 }
      );
    }

    const members = await getTeamMembers(companyId);
    return NextResponse.json({ success: true, members }, { status: 200 });
  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/team
 * Add a team member to a company
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, name, email, role } = body;

    if (!companyId || !name || !email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: companyId, name, email' },
        { status: 400 }
      );
    }

    const member = await addTeamMember(companyId, { name, email, role });
    return NextResponse.json({ success: true, member }, { status: 201 });
  } catch (error) {
    console.error('Error adding team member:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add team member' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/team
 * Remove a team member from a company
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, userId } = body;

    if (!companyId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: companyId, userId' },
        { status: 400 }
      );
    }

    await removeTeamMember(companyId, userId);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error removing team member:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove team member' },
      { status: 500 }
    );
  }
}
