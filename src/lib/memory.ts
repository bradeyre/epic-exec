/**
 * memory.ts — Jim's brain. Central persistence layer for all data operations.
 * Everything flows through here: analyses, tasks, goals, context notes, chat.
 */

import db from './db';
import type { Prisma } from '@prisma/client';

// ============================================================================
// BOOTSTRAP — Ensure default tenant/user/company exist
// ============================================================================

const DEFAULT_TENANT_ID = 'default-tenant';
const DEFAULT_USER_ID = 'default-user';

export async function ensureDefaults() {
  // Create tenant if not exists
  const tenant = await db.tenant.upsert({
    where: { id: DEFAULT_TENANT_ID },
    update: {},
    create: {
      id: DEFAULT_TENANT_ID,
      name: 'Epic Exec',
      slug: 'epic-exec',
      plan: 'PRO',
    },
  });

  // Create default user if not exists
  const user = await db.user.upsert({
    where: { id: DEFAULT_USER_ID },
    update: {},
    create: {
      id: DEFAULT_USER_ID,
      tenantId: DEFAULT_TENANT_ID,
      email: 'admin@epicexec.com',
      name: 'Admin',
      role: 'SUPER_ADMIN',
    },
  });

  return { tenant, user };
}

export async function ensureCompany(name: string, industry: string, slug?: string) {
  const companySlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const existing = await db.company.findFirst({
    where: { tenantId: DEFAULT_TENANT_ID, slug: companySlug },
  });

  if (existing) return existing;

  return db.company.create({
    data: {
      tenantId: DEFAULT_TENANT_ID,
      name,
      slug: companySlug,
      industry,
      currency: 'ZAR',
      countryCode: 'ZA',
    },
  });
}

// ============================================================================
// COMPANIES
// ============================================================================

export async function getCompanies() {
  return db.company.findMany({
    where: { tenantId: DEFAULT_TENANT_ID },
    orderBy: { name: 'asc' },
  });
}

export async function getCompany(companyId: string) {
  return db.company.findUnique({ where: { id: companyId } });
}

// ============================================================================
// ANALYSES
// ============================================================================

export async function saveAnalysis(data: {
  companyId: string;
  module: 'CFO' | 'CMO' | 'COO' | 'HR' | 'SALES';
  functionName: string;
  title: string;
  inputData: Record<string, unknown>;
  outputData: Record<string, unknown>;
  healthScore?: 'RED' | 'AMBER' | 'GREEN';
  score?: number;
  processingTimeMs?: number;
}) {
  return db.analysis.create({
    data: {
      companyId: data.companyId,
      userId: DEFAULT_USER_ID,
      module: data.module,
      functionName: data.functionName,
      title: data.title,
      inputData: data.inputData as Prisma.InputJsonValue,
      outputData: data.outputData as Prisma.InputJsonValue,
      healthScore: data.healthScore || null,
      score: data.score || 0,
      status: 'COMPLETED',
      processingTimeMs: data.processingTimeMs,
      modelUsed: 'claude-sonnet-4-5-20250929',
      completedAt: new Date(),
    },
  });
}

export async function getAnalyses(companyId: string, options?: {
  module?: string;
  limit?: number;
  offset?: number;
}) {
  return db.analysis.findMany({
    where: {
      companyId,
      ...(options?.module ? { module: options.module as 'CFO' | 'CMO' | 'COO' | 'HR' | 'SALES' } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: options?.limit || 20,
    skip: options?.offset || 0,
    include: {
      tasks: { select: { id: true, title: true, status: true, priority: true } },
    },
  });
}

export async function getAnalysis(analysisId: string) {
  return db.analysis.findUnique({
    where: { id: analysisId },
    include: {
      tasks: true,
    },
  });
}

export async function getRecentAnalysesSummary(companyId: string, limit = 5) {
  const analyses = await db.analysis.findMany({
    where: { companyId, status: 'COMPLETED' },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      functionName: true,
      title: true,
      healthScore: true,
      score: true,
      createdAt: true,
      outputData: true,
    },
  });

  return analyses.map((a) => {
    const output = a.outputData as Record<string, unknown>;
    return {
      id: a.id,
      functionName: a.functionName,
      title: a.title,
      healthScore: a.healthScore,
      score: a.score,
      date: a.createdAt,
      executiveSummary: (output?.executiveSummary as string) || '',
    };
  });
}

// ============================================================================
// TASKS
// ============================================================================

export async function saveTasks(tasks: Array<{
  companyId: string;
  analysisId?: string;
  title: string;
  description?: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  effort: 'QUICK' | 'MEDIUM' | 'SIGNIFICANT';
  dueDate?: Date;
  assignedToId?: string;
}>) {
  return db.task.createMany({
    data: tasks.map((t) => ({
      companyId: t.companyId,
      analysisId: t.analysisId || null,
      title: t.title,
      description: t.description || null,
      priority: t.priority,
      effort: t.effort,
      dueDate: t.dueDate || null,
      assignedToId: t.assignedToId || null,
    })),
  });
}

export async function getTasks(companyId: string, options?: {
  status?: string;
  priority?: string;
  assignedToId?: string;
}) {
  return db.task.findMany({
    where: {
      companyId,
      ...(options?.status ? { status: options.status as 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED' } : {}),
      ...(options?.priority ? { priority: options.priority as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' } : {}),
      ...(options?.assignedToId ? { assignedToId: options.assignedToId } : {}),
    },
    orderBy: [{ priority: 'asc' }, { dueDate: 'asc' }],
    include: {
      assignedTo: { select: { id: true, name: true, email: true, image: true } },
      analysis: { select: { id: true, title: true, functionName: true } },
      comments: { orderBy: { createdAt: 'desc' }, take: 3 },
    },
  });
}

export async function updateTask(taskId: string, data: {
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
  priority?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  assignedToId?: string | null;
  completionNote?: string;
}) {
  return db.task.update({
    where: { id: taskId },
    data: {
      ...data,
      ...(data.status === 'DONE' ? { completedAt: new Date() } : {}),
    },
  });
}

export async function addTaskComment(taskId: string, content: string, userId?: string) {
  return db.taskComment.create({
    data: {
      taskId,
      userId: userId || DEFAULT_USER_ID,
      content,
    },
  });
}

// ============================================================================
// CONTEXT NOTES (Jim's memory of user-provided context)
// ============================================================================

export async function addContextNote(data: {
  companyId: string;
  note: string;
  source: string;
  relatedAnalysisId?: string;
}) {
  return db.contextNote.create({
    data: {
      companyId: data.companyId,
      userId: DEFAULT_USER_ID,
      note: data.note,
      source: data.source,
      relatedAnalysisId: data.relatedAnalysisId || null,
    },
  });
}

export async function getContextNotes(companyId: string, limit = 20) {
  return db.contextNote.findMany({
    where: { companyId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

// ============================================================================
// GOALS
// ============================================================================

export async function saveGoal(data: {
  companyId: string;
  title: string;
  target: string;
  deadline: Date;
  breakdown?: Record<string, unknown>;
}) {
  return db.goal.create({
    data: {
      companyId: data.companyId,
      userId: DEFAULT_USER_ID,
      title: data.title,
      target: data.target,
      deadline: data.deadline,
      breakdown: data.breakdown as Prisma.InputJsonValue || undefined,
    },
  });
}

export async function getGoals(companyId: string) {
  return db.goal.findMany({
    where: { companyId, status: 'active' },
    orderBy: { deadline: 'asc' },
    include: {
      progress: { orderBy: { createdAt: 'desc' }, take: 3 },
    },
  });
}

export async function addGoalProgress(data: {
  goalId: string;
  month: string;
  actualData?: Record<string, unknown>;
  jimFeedback?: string;
  onTrack?: boolean;
}) {
  return db.goalProgress.create({
    data: {
      goalId: data.goalId,
      month: data.month,
      actualData: data.actualData as Prisma.InputJsonValue || undefined,
      jimFeedback: data.jimFeedback || null,
      onTrack: data.onTrack ?? null,
    },
  });
}

// ============================================================================
// CHAT
// ============================================================================

export async function saveChatMessage(data: {
  companyId: string;
  role: string;
  content: string;
  referencedAnalyses?: string[];
}) {
  return db.chatMessage.create({
    data: {
      companyId: data.companyId,
      userId: DEFAULT_USER_ID,
      role: data.role,
      content: data.content,
      referencedAnalyses: data.referencedAnalyses || [],
    },
  });
}

export async function getChatMessages(companyId: string, limit = 50) {
  return db.chatMessage.findMany({
    where: { companyId },
    orderBy: { createdAt: 'asc' },
    take: limit,
  });
}

// ============================================================================
// TEAM MEMBERS
// ============================================================================

export async function getTeamMembers(companyId: string) {
  const companyUsers = await db.companyUser.findMany({
    where: { companyId },
    include: {
      user: { select: { id: true, name: true, email: true, image: true, role: true } },
    },
  });
  return companyUsers.map((cu) => ({ ...cu.user, companyRole: cu.role }));
}

export async function addTeamMember(companyId: string, data: {
  name: string;
  email: string;
  role?: 'ANALYST' | 'VIEWER' | 'COMPANY_ADMIN';
}) {
  // Create user if not exists
  const user = await db.user.upsert({
    where: { email: data.email },
    update: { name: data.name },
    create: {
      tenantId: DEFAULT_TENANT_ID,
      email: data.email,
      name: data.name,
      role: 'VIEWER',
    },
  });

  // Link to company
  return db.companyUser.upsert({
    where: { userId_companyId: { userId: user.id, companyId } },
    update: { role: data.role || 'ANALYST' },
    create: {
      userId: user.id,
      companyId,
      role: data.role || 'ANALYST',
    },
  });
}

export async function removeTeamMember(companyId: string, userId: string) {
  return db.companyUser.delete({
    where: { userId_companyId: { userId, companyId } },
  });
}

// ============================================================================
// BUILD MEMORY CONTEXT — Jim's complete knowledge of the company
// ============================================================================

export async function buildMemoryContext(companyId: string): Promise<string> {
  const [company, recentAnalyses, activeTasks, goals, contextNotes, recentChat] = await Promise.all([
    getCompany(companyId),
    getRecentAnalysesSummary(companyId, 5),
    getTasks(companyId, { status: undefined }), // Get all non-cancelled
    getGoals(companyId),
    getContextNotes(companyId, 10),
    getChatMessages(companyId, 10),
  ]);

  if (!company) return 'No company data found.';

  const sections: string[] = [];

  // Company Profile
  sections.push(`## Company Profile
- Name: ${company.name}
- Industry: ${company.industry || 'Not specified'}
- Currency: ${company.currency}
- Country: ${company.countryCode}`);

  // Recent Analyses
  if (recentAnalyses.length > 0) {
    const analysisList = recentAnalyses.map((a) => {
      const dateStr = a.date.toISOString().split('T')[0];
      return `- [${dateStr}] ${a.title} (${a.healthScore || 'N/A'}): ${a.executiveSummary.substring(0, 150)}`;
    }).join('\n');
    sections.push(`## Recent Analyses (last ${recentAnalyses.length})\n${analysisList}`);
  }

  // Active Tasks
  const openTasks = activeTasks.filter((t) => t.status !== 'DONE' && t.status !== 'CANCELLED');
  if (openTasks.length > 0) {
    const taskList = openTasks.slice(0, 10).map((t) => {
      return `- [${t.priority}] ${t.title} (${t.status})${t.dueDate ? ` — due ${t.dueDate.toISOString().split('T')[0]}` : ''}`;
    }).join('\n');
    sections.push(`## Open Tasks (${openTasks.length} total)\n${taskList}`);
  }

  // Goals
  if (goals.length > 0) {
    const goalList = goals.map((g) => {
      const latestProgress = g.progress[0];
      const trackStatus = latestProgress?.onTrack === true ? '✅ On track' :
        latestProgress?.onTrack === false ? '⚠️ Off track' : 'No check-in yet';
      return `- "${g.title}" → ${g.target} by ${g.deadline.toISOString().split('T')[0]} [${trackStatus}]`;
    }).join('\n');
    sections.push(`## Active Goals\n${goalList}`);
  }

  // Context Notes (things the user has told Jim)
  if (contextNotes.length > 0) {
    const noteList = contextNotes.map((n) => {
      return `- [${n.source}] ${n.note}`;
    }).join('\n');
    sections.push(`## Things I Know About This Business\n${noteList}`);
  }

  return sections.join('\n\n');
}
