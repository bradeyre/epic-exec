import { NextRequest, NextResponse } from 'next/server';
import { getAnalyses, getAnalysis, saveAnalysis } from '@/lib/memory';

/**
 * GET /api/analyses
 * List analyses for a company (or get a single analysis by id)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId');
    const analysisId = searchParams.get('id');
    const module = searchParams.get('module') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Get single analysis by ID
    if (analysisId) {
      const analysis = await getAnalysis(analysisId);
      if (!analysis) {
        return NextResponse.json(
          { success: false, error: 'Analysis not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, analysis }, { status: 200 });
    }

    // List analyses for company
    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameter: companyId or id' },
        { status: 400 }
      );
    }

    const analyses = await getAnalyses(companyId, { module, limit, offset });

    return NextResponse.json(
      {
        success: true,
        data: analyses,
        pagination: { limit, offset, count: analyses.length },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching analyses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analyses' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/analyses
 * Save a completed analysis
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      companyId,
      module,
      functionName,
      title,
      inputData,
      outputData,
      healthScore,
      score,
      processingTimeMs,
    } = body;

    if (!companyId || !module || !functionName || !title) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: companyId, module, functionName, title' },
        { status: 400 }
      );
    }

    const analysis = await saveAnalysis({
      companyId,
      module,
      functionName,
      title,
      inputData: inputData || {},
      outputData: outputData || {},
      healthScore,
      score,
      processingTimeMs,
    });

    return NextResponse.json({ success: true, analysis }, { status: 201 });
  } catch (error) {
    console.error('Error saving analysis:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save analysis' },
      { status: 500 }
    );
  }
}
