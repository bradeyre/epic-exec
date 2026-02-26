import { NextRequest, NextResponse } from 'next/server';
import { getCompanies, ensureDefaults, ensureCompany } from '@/lib/memory';

/**
 * GET /api/companies
 * List all companies for the tenant
 */
export async function GET() {
  try {
    // Ensure defaults exist (tenant + admin user)
    await ensureDefaults();

    const companies = await getCompanies();

    // If no companies exist yet, create a default one
    if (companies.length === 0) {
      const defaultCompany = await ensureCompany('Epic Deals', 'E-commerce / Retail', 'epic-deals');
      return NextResponse.json(
        { success: true, companies: [defaultCompany] },
        { status: 200 }
      );
    }

    return NextResponse.json({ success: true, companies }, { status: 200 });
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch companies' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/companies
 * Create a new company
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, industry } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: name' },
        { status: 400 }
      );
    }

    await ensureDefaults();
    const company = await ensureCompany(name, industry || 'General');

    return NextResponse.json({ success: true, company }, { status: 201 });
  } catch (error) {
    console.error('Error creating company:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create company' },
      { status: 500 }
    );
  }
}
