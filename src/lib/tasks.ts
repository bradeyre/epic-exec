import { db } from '@/lib/db';
import { AnalysisResult, TaskStatus, TaskPriority } from '@/types';

/**
 * Extract action items from analysis output and create Task records
 */
export async function generateTasksFromAnalysis(
  analysisId: string,
  output: AnalysisResult,
): Promise<string[]> {
  try {
    const analysis = await db.analysis.findUnique({
      where: { id: analysisId },
    });

    if (!analysis) {
      throw new Error(`Analysis ${analysisId} not found`);
    }

    const taskIds: string[] = [];

    // Extract action items and recommendations
    const items = [...(output.actionItems || []), ...(output.recommendations || [])];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      // Determine priority based on position and content
      const isPriority =
        i < 2 || item.toLowerCase().includes('urgent') || item.toLowerCase().includes('critical');
      const priority: TaskPriority = isPriority ? 'HIGH' : 'MEDIUM';

      // Create task
      const task = await db.task.create({
        data: {
          title: item.substring(0, 200),
          description: item,
          status: 'TODO' as TaskStatus,
          priority,
          companyId: analysis.companyId,
          analysisId,
          dueDate: new Date(Date.now() + (isPriority ? 7 : 14) * 24 * 60 * 60 * 1000), // 7 or 14 days
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      taskIds.push(task.id);
    }

    return taskIds;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Task generation failed: ${error.message}`);
    }
    throw error;
  }
}

interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedToId?: string;
  dueAfter?: Date;
  dueBefore?: Date;
}

/**
 * Get filtered task list for a company
 */
export async function getTasksForCompany(
  companyId: string,
  filters?: TaskFilters,
): Promise<any[]> {
  try {
    const where: Record<string, any> = { companyId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.priority) {
      where.priority = filters.priority;
    }

    if (filters?.assignedToId) {
      where.assignedToId = filters.assignedToId;
    }

    if (filters?.dueAfter || filters?.dueBefore) {
      where.dueDate = {};
      if (filters.dueAfter) {
        where.dueDate.gte = filters.dueAfter;
      }
      if (filters.dueBefore) {
        where.dueDate.lte = filters.dueBefore;
      }
    }

    const tasks = await db.task.findMany({
      where,
      include: {
        company: true,
        analysis: true,
        assignedTo: true,
      },
      orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
    });

    return tasks;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch tasks: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Update task status
 */
export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus,
  userId: string,
): Promise<any> {
  try {
    const task = await db.task.update({
      where: { id: taskId },
      data: {
        status,
        updatedAt: new Date(),
      },
      include: {
        company: true,
        analysis: true,
        assignedTo: true,
      },
    });

    return task;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to update task: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Get overdue tasks for a company
 */
export async function getOverdueTasks(companyId: string): Promise<any[]> {
  try {
    const now = new Date();

    const tasks = await db.task.findMany({
      where: {
        companyId,
        dueDate: {
          lt: now,
        },
        status: {
          not: 'DONE',
        },
      },
      include: {
        company: true,
        analysis: true,
        assignedTo: true,
      },
      orderBy: { dueDate: 'asc' },
    });

    return tasks;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch overdue tasks: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Check if tasks from a previous analysis were completed
 * Useful for follow-up loops and iterative improvement
 */
export async function checkTaskCompletion(analysisId: string): Promise<{
  total: number;
  completed: number;
  pending: number;
  completionRate: number;
}> {
  try {
    const tasks = await db.task.findMany({
      where: { analysisId },
    });

    const completed = tasks.filter((t: any) => t.status === 'DONE').length;
    const pending = tasks.length - completed;
    const completionRate = tasks.length > 0 ? (completed / tasks.length) * 100 : 0;

    return {
      total: tasks.length,
      completed,
      pending,
      completionRate,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to check task completion: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Get task statistics for dashboard
 */
export async function getTaskStats(companyId: string): Promise<{
  total: number;
  byStatus: Record<TaskStatus, number>;
  byPriority: Record<TaskPriority, number>;
  overdue: number;
  dueThisWeek: number;
  dueThisMonth: number;
  completionTrend: Array<{ date: string; completed: number }>;
}> {
  try {
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const monthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const tasks = await db.task.findMany({
      where: { companyId },
    });

    // Count by status
    const byStatus: Record<any, number> = {
      TODO: 0,
      IN_PROGRESS: 0,
      DONE: 0,
      CANCELLED: 0,
    };

    // Count by priority
    const byPriority: Record<any, number> = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
    };

    let overdue = 0;
    let dueThisWeek = 0;
    let dueThisMonth = 0;

    tasks.forEach((task: any) => {
      byStatus[task.status]++;
      byPriority[task.priority]++;

      if (task.status !== 'DONE' && task.dueDate && task.dueDate < now) {
        overdue++;
      }

      if (task.dueDate && task.dueDate >= now && task.dueDate <= weekFromNow) {
        dueThisWeek++;
      }

      if (task.dueDate && task.dueDate >= now && task.dueDate <= monthFromNow) {
        dueThisMonth++;
      }
    });

    // Calculate completion trend (last 30 days)
    const completionTrend: Array<{ date: string; completed: number }> = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];

      const completed = tasks.filter(
        (t: any) => t.status === 'DONE' && t.updatedAt && t.updatedAt.toISOString().split('T')[0] === dateStr,
      ).length;

      completionTrend.push({ date: dateStr, completed });
    }

    return {
      total: tasks.length,
      byStatus,
      byPriority,
      overdue,
      dueThisWeek,
      dueThisMonth,
      completionTrend,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get task stats: ${error.message}`);
    }
    throw error;
  }
}
