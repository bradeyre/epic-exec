import { NextRequest, NextResponse } from 'next/server';
import { getTasks, saveTasks, updateTask, addTaskComment } from '@/lib/memory';

/**
 * GET /api/tasks
 * List tasks for a company with filters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId');
    const status = searchParams.get('status') || undefined;
    const priority = searchParams.get('priority') || undefined;

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameter: companyId' },
        { status: 400 }
      );
    }

    const tasks = await getTasks(companyId, { status, priority });

    return NextResponse.json({ success: true, tasks }, { status: 200 });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tasks
 * Create new tasks (supports single or batch)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Support both single task and array of tasks
    const tasksToCreate = Array.isArray(body.tasks) ? body.tasks : [body];

    // Validate
    for (const task of tasksToCreate) {
      if (!task.companyId || !task.title) {
        return NextResponse.json(
          { success: false, error: 'Each task requires companyId and title' },
          { status: 400 }
        );
      }
    }

    const result = await saveTasks(
      tasksToCreate.map((t: Record<string, string | undefined>) => ({
        companyId: t.companyId!,
        analysisId: t.analysisId || undefined,
        title: t.title!,
        description: t.description,
        priority: (t.priority as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW') || 'MEDIUM',
        effort: (t.effort as 'QUICK' | 'MEDIUM' | 'SIGNIFICANT') || 'MEDIUM',
        dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
        assignedToId: t.assignedToId || undefined,
      }))
    );

    return NextResponse.json({ success: true, count: result.count }, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create task' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/tasks
 * Update a task (status, assignee, priority, etc.)
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, assignedToId, priority, completionNote, comment } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameter: id' },
        { status: 400 }
      );
    }

    // If there's a comment, add it
    if (comment) {
      await addTaskComment(id, comment);
    }

    const task = await updateTask(id, {
      ...(status ? { status } : {}),
      ...(priority ? { priority } : {}),
      ...(assignedToId !== undefined ? { assignedToId } : {}),
      ...(completionNote ? { completionNote } : {}),
    });

    return NextResponse.json({ success: true, task }, { status: 200 });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update task' },
      { status: 500 }
    );
  }
}
