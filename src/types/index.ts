import { ReactNode } from 'react';

// ============================================================================
// ENUMS (from Prisma schema) - as string literal types
// ============================================================================

export type UserRole = 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'COMPANY_ADMIN' | 'ANALYST' | 'VIEWER';

export type Module = 'CMO' | 'CFO' | 'COO' | 'HR' | 'SALES';

export type AnalysisStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export type TaskPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';

export type TaskEffort = 'QUICK' | 'MEDIUM' | 'SIGNIFICANT';

export type ScheduleFrequency = 'DAILY' | 'WEEKLY' | 'FORTNIGHTLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY' | 'CUSTOM';

export type ScheduleTriggerType = 'REMINDER' | 'AUTO_RUN';

export type NewsletterStatus = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'SENT';

export type HealthScore = 'RED' | 'AMBER' | 'GREEN';

export type PromptStatus = 'ACTIVE' | 'DRAFT' | 'ARCHIVED';

export type DataSourceType = 'CSV' | 'EXCEL' | 'PDF' | 'SCREENSHOT' | 'IMAGE' | 'JSON' | 'MCP_GOOGLE_ADS' | 'MCP_META_ADS' | 'MCP_XERO' | 'MANUAL';

// ============================================================================
// DATABASE MODELS (manually defined)
// ============================================================================

export interface Account {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string | null;
  access_token?: string | null;
  expires_at?: number | null;
  token_type?: string | null;
  scope?: string | null;
  id_token?: string | null;
  session_state?: string | null;
}

export interface Session {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
}

export interface VerificationToken {
  identifier: string;
  token: string;
  expires: Date;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain?: string | null;
  logo?: string | null;
  primaryColor: string;
  plan: string;
  features: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Company {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  industry?: string | null;
  description?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  currency: string;
  taxId?: string | null;
  countryCode: string;
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  tenantId: string;
  email: string;
  name?: string | null;
  passwordHash?: string | null;
  image?: string | null;
  emailVerified?: Date | null;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyUser {
  id: string;
  userId: string;
  companyId: string;
  role: UserRole;
  createdAt: Date;
}

export interface BrandVoiceProfile {
  id: string;
  companyId: string;
  tone?: string | null;
  formality: number;
  humour: number;
  emojiUsage: string;
  vocabularyAlways: string[];
  vocabularyNever: string[];
  sentenceStyle: string;
  ctaStyle: string;
  audienceRelationship: string;
  contentPillars: string[];
  seasonalPriorities: string[];
  sampleOutputs: Record<string, any>;
  visualTone: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Prompt {
  id: string;
  tenantId: string;
  module: Module;
  functionName: string;
  title: string;
  description?: string | null;
  tags: string[];
  currentVersionId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PromptVersion {
  id: string;
  promptId: string;
  version: string;
  systemPrompt: string;
  userPromptTemplate: string;
  variables: Record<string, any>;
  changelog?: string | null;
  status: PromptStatus;
  createdBy: string;
  satisfaction?: number | null;
  usageCount: number;
  createdAt: Date;
}

export interface Analysis {
  id: string;
  companyId: string;
  userId: string;
  module: Module;
  functionName: string;
  title: string;
  promptId?: string | null;
  promptVersionId?: string | null;
  inputData: Record<string, any>;
  outputData: Record<string, any>;
  healthScore?: HealthScore | null;
  score?: number | null;
  status: AnalysisStatus;
  processingTimeMs?: number | null;
  modelUsed: string;
  tokenCount?: number | null;
  costEstimate?: number | null;
  createdAt: Date;
  completedAt?: Date | null;
}

export interface AnalysisDataPoint {
  id: string;
  analysisId: string;
  companyId: string;
  metric: string;
  value: number;
  unit?: string | null;
  period: string;
  periodType: string;
  category: string;
  metadata?: Record<string, any> | null;
  createdAt: Date;
}

export interface Task {
  id: string;
  companyId: string;
  analysisId?: string | null;
  title: string;
  description?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  effort: TaskEffort;
  category?: string | null;
  dueDate?: Date | null;
  assignedToId?: string | null;
  mcpEligible: boolean;
  completedAt?: Date | null;
  completionNote?: string | null;
  performanceImpact?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Schedule {
  id: string;
  companyId: string;
  tenantId: string;
  module: Module;
  functionName: string;
  title: string;
  frequency: ScheduleFrequency;
  cronExpression?: string | null;
  triggerType: ScheduleTriggerType;
  recipientEmails: string[];
  escalationEmail?: string | null;
  escalationDays: number;
  isActive: boolean;
  lastRunAt?: Date | null;
  nextRunAt?: Date | null;
  config?: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScheduleRun {
  id: string;
  scheduleId: string;
  status: string;
  analysisId?: string | null;
  emailSentAt?: Date | null;
  error?: string | null;
  createdAt: Date;
}

export interface NewsletterDraft {
  id: string;
  companyId: string;
  title: string;
  subjectLineOptions: string[];
  previewText?: string | null;
  bodyHtml?: string | null;
  bodyText?: string | null;
  status: NewsletterStatus;
  scheduledSendAt?: Date | null;
  contentSources: Record<string, any>;
  aiSuggestions?: Record<string, any> | null;
  editedByUserId?: string | null;
  humanEdits?: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date | null;
  sentAt?: Date | null;
}

export interface NewsletterTemplate {
  id: string;
  companyId: string;
  name: string;
  structure: Record<string, any>;
  htmlTemplate?: string | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface McpConnection {
  id: string;
  companyId: string;
  platform: string;
  accessToken: string;
  refreshToken?: string | null;
  tokenExpiresAt?: Date | null;
  scopes: string[];
  accountId?: string | null;
  isActive: boolean;
  lastSyncAt?: Date | null;
  metadata?: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProactiveAlert {
  id: string;
  companyId: string;
  module: Module;
  title: string;
  description: string;
  severity: HealthScore;
  metric?: string | null;
  triggerValue?: number | null;
  thresholdValue?: number | null;
  isRead: boolean;
  isDismissed: boolean;
  suggestedAnalysis?: string | null;
  createdAt: Date;
  readAt?: Date | null;
}

export interface ChatMessage {
  id: string;
  companyId: string;
  userId: string;
  role: string;
  content: string;
  referencedAnalyses: string[];
  referencedData?: Record<string, any> | null;
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  tenantId: string;
  companyId?: string | null;
  userId?: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  details?: Record<string, any> | null;
  ipAddress?: string | null;
  createdAt: Date;
}

// ============================================================================
// AUTHENTICATION & SESSION
// ============================================================================

export interface AuthSession {
  user: {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    role: UserRole;
    tenantId: string;
  };
  expires: string;
}

export interface NextAuthUser {
  id: string;
  email: string;
  name?: string;
  image?: string;
  role: UserRole;
  tenantId: string;
}

// ============================================================================
// WIZARD & CONFIGURATION
// ============================================================================

export interface WizardStep {
  id: string;
  title: string;
  description: string;
  component: ReactNode | string;
  validation?: (data: unknown) => boolean | Promise<boolean>;
  optional?: boolean;
}

export interface WizardConfig {
  id: string;
  steps: WizardStep[];
  module: Module;
  functionName: string;
  onComplete?: (data: Record<string, unknown>) => void | Promise<void>;
  showProgress?: boolean;
}

// ============================================================================
// ANALYSIS & RESULTS
// ============================================================================

export interface Chart {
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  title: string;
  data: Record<string, unknown>[];
  xAxis?: string;
  yAxis?: string;
}

export interface AnalysisResult {
  id?: string;
  title: string;
  summary: string;
  healthScore?: HealthScore;
  score?: number;
  findings: string[];
  recommendations: string[];
  actionItems: string[];
  charts: Chart[];
  metadata?: Record<string, unknown>;
}

export interface AnalysisMetadata {
  processingTimeMs?: number;
  tokenCount?: number;
  costEstimate?: number;
  modelUsed?: string;
}

// ============================================================================
// MODULES & FUNCTIONS
// ============================================================================

export type CmoFunctionId =
  | 'brand_audit'
  | 'market_positioning'
  | 'content_strategy'
  | 'messaging_clarity'
  | 'visual_identity'
  | 'customer_sentiment'
  | 'campaign_performance'
  | 'content_calendar_optimization'
  | 'newsletter_strategy'
  | 'lead_generation_analysis';

export type CfoFunctionId =
  | 'cash_flow_analysis'
  | 'expense_optimization'
  | 'revenue_forecast'
  | 'margin_analysis'
  | 'working_capital'
  | 'financial_health_score'
  | 'profitability_analysis'
  | 'budget_vs_actuals'
  | 'tax_optimization'
  | 'debt_analysis';

export type ModuleFunctionId = CmoFunctionId | CfoFunctionId;

export interface ModuleFunction {
  id: ModuleFunctionId;
  name: string;
  description: string;
  module: Module;
  category: string;
  icon: string;
  wizardConfig?: WizardConfig;
  isNew?: boolean;
  estimatedDuration?: number;
  requiredDataSources?: DataSourceType[];
}

export const CMO_FUNCTIONS: ModuleFunction[] = [
  {
    id: 'brand_audit',
    name: 'Brand Audit',
    description: 'Comprehensive analysis of your brand health and perception',
    module: 'CMO',
    category: 'Strategy',
    icon: 'Target',
    estimatedDuration: 10,
  },
  {
    id: 'market_positioning',
    name: 'Market Positioning',
    description: 'Evaluate your competitive position in the market',
    module: 'CMO',
    category: 'Strategy',
    icon: 'TrendingUp',
    estimatedDuration: 8,
  },
  {
    id: 'content_strategy',
    name: 'Content Strategy',
    description: 'AI-powered content planning and calendar optimization',
    module: 'CMO',
    category: 'Content',
    icon: 'FileText',
    estimatedDuration: 12,
  },
  {
    id: 'messaging_clarity',
    name: 'Messaging Clarity',
    description: 'Analyze and improve your core messaging',
    module: 'CMO',
    category: 'Strategy',
    icon: 'MessageSquare',
    estimatedDuration: 7,
  },
  {
    id: 'visual_identity',
    name: 'Visual Identity Review',
    description: 'Assessment of your visual branding and design consistency',
    module: 'CMO',
    category: 'Brand',
    icon: 'Palette',
    estimatedDuration: 9,
  },
  {
    id: 'customer_sentiment',
    name: 'Customer Sentiment Analysis',
    description: 'Track and analyze customer perception and feedback',
    module: 'CMO',
    category: 'Analytics',
    icon: 'Heart',
    estimatedDuration: 15,
  },
  {
    id: 'campaign_performance',
    name: 'Campaign Performance',
    description: 'Detailed analysis of marketing campaign effectiveness',
    module: 'CMO',
    category: 'Analytics',
    icon: 'BarChart3',
    estimatedDuration: 11,
  },
  {
    id: 'content_calendar_optimization',
    name: 'Content Calendar Optimization',
    description: 'Strategic content scheduling and timing recommendations',
    module: 'CMO',
    category: 'Content',
    icon: 'Calendar',
    estimatedDuration: 8,
  },
  {
    id: 'newsletter_strategy',
    name: 'Newsletter Strategy',
    description: 'AI-driven email newsletter planning and content generation',
    module: 'CMO',
    category: 'Content',
    icon: 'Mail',
    estimatedDuration: 10,
  },
  {
    id: 'lead_generation_analysis',
    name: 'Lead Generation Analysis',
    description: 'Assess and optimize your lead generation funnel',
    module: 'CMO',
    category: 'Analytics',
    icon: 'Users',
    estimatedDuration: 12,
  },
];

export const CFO_FUNCTIONS: ModuleFunction[] = [
  {
    id: 'cash_flow_analysis',
    name: 'Cash Flow Analysis',
    description: 'Deep dive into your cash flow patterns and health',
    module: 'CFO',
    category: 'Finance',
    icon: 'DollarSign',
    estimatedDuration: 10,
  },
  {
    id: 'expense_optimization',
    name: 'Expense Optimization',
    description: 'Identify cost-saving opportunities across your operations',
    module: 'CFO',
    category: 'Finance',
    icon: 'TrendingDown',
    estimatedDuration: 12,
  },
  {
    id: 'revenue_forecast',
    name: 'Revenue Forecast',
    description: 'AI-powered revenue projections based on historical data',
    module: 'CFO',
    category: 'Analytics',
    icon: 'LineChart',
    estimatedDuration: 8,
  },
  {
    id: 'margin_analysis',
    name: 'Margin Analysis',
    description: 'Comprehensive profitability and margin analysis',
    module: 'CFO',
    category: 'Finance',
    icon: 'Percent',
    estimatedDuration: 9,
  },
  {
    id: 'working_capital',
    name: 'Working Capital Optimization',
    description: 'Optimize your working capital and liquidity',
    module: 'CFO',
    category: 'Finance',
    icon: 'Target',
    estimatedDuration: 11,
  },
  {
    id: 'financial_health_score',
    name: 'Financial Health Score',
    description: 'Comprehensive financial health assessment',
    module: 'CFO',
    category: 'Analytics',
    icon: 'Heart',
    estimatedDuration: 7,
  },
  {
    id: 'profitability_analysis',
    name: 'Profitability Analysis',
    description: 'Detailed analysis of your profitability drivers',
    module: 'CFO',
    category: 'Finance',
    icon: 'BarChart3',
    estimatedDuration: 10,
  },
  {
    id: 'budget_vs_actuals',
    name: 'Budget vs Actuals Review',
    description: 'Variance analysis and budget performance review',
    module: 'CFO',
    category: 'Finance',
    icon: 'FileText',
    estimatedDuration: 8,
  },
  {
    id: 'tax_optimization',
    name: 'Tax Optimization',
    description: 'Identify tax planning opportunities',
    module: 'CFO',
    category: 'Finance',
    icon: 'Calculator',
    estimatedDuration: 9,
  },
  {
    id: 'debt_analysis',
    name: 'Debt Analysis',
    description: 'Assessment of your debt structure and repayment strategy',
    module: 'CFO',
    category: 'Finance',
    icon: 'TrendingUp',
    estimatedDuration: 10,
  },
];

export const ALL_FUNCTIONS: ModuleFunction[] = [...CMO_FUNCTIONS, ...CFO_FUNCTIONS];

export function getFunctionById(id: string): ModuleFunction | undefined {
  return ALL_FUNCTIONS.find((fn) => fn.id === id);
}

// ============================================================================
// COMPANY & CONTEXT
// ============================================================================

export interface CompanyContext {
  id: string;
  tenantId: string;
  name: string;
  industry?: string;
  description?: string;
  website?: string;
  logoUrl?: string;
  currency: string;
  countryCode: string;
  settings: Record<string, unknown>;
  brandVoiceProfile?: BrandVoiceProfile;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyWithRelations extends Company {
  brandVoiceProfile: BrandVoiceProfile | null;
  analyses: Analysis[];
  tasks: Task[];
}

// ============================================================================
// DASHBOARD & METRICS
// ============================================================================

export interface DashboardMetric {
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  unit?: string;
  sparkline?: number[];
}

export interface DashboardCard {
  id: string;
  title: string;
  description?: string;
  metrics: DashboardMetric[];
  chart?: Chart;
  action?: {
    label: string;
    href: string;
  };
}

export interface Dashboard {
  module: Module;
  cards: DashboardCard[];
  recentAnalyses: Analysis[];
  recentTasks: Task[];
  healthScore?: HealthScore;
}

// ============================================================================
// TASKS & ACTIONS
// ============================================================================

export interface TaskWithRelations extends Task {
  company: Company;
  analysis: Analysis | null;
  assignedTo: User | null;
}

export interface TaskGroup {
  status: TaskStatus;
  tasks: TaskWithRelations[];
  count: number;
}

// ============================================================================
// BRAND VOICE
// ============================================================================

export interface BrandVoiceProfileInput {
  tone?: string;
  formality?: number;
  humour?: number;
  emojiUsage?: string;
  vocabularyAlways?: string[];
  vocabularyNever?: string[];
  sentenceStyle?: string;
  ctaStyle?: string;
  audienceRelationship?: string;
  contentPillars?: string[];
  seasonalPriorities?: string[];
  sampleOutputs?: Record<string, unknown>[];
  visualTone?: Record<string, unknown>;
}

export interface BrandVoiceProfileWithCompany extends BrandVoiceProfile {
  company: Company;
}

// ============================================================================
// NEWSLETTER
// ============================================================================

export interface NewsletterContentSource {
  type: 'analysis' | 'metric' | 'news' | 'content';
  id: string;
  title: string;
  snippet?: string;
}

export interface NewsletterDraftWithRelations extends NewsletterDraft {
  company: Company;
  editedBy: User | null;
}

export interface NewsletterTemplateWithCompany extends NewsletterTemplate {
  company: Company;
}

// ============================================================================
// DATA & UPLOAD
// ============================================================================

export interface DataSourceFile {
  name: string;
  size: number;
  type: DataSourceType;
  mimeType: string;
  path?: string;
}

export interface ParsedData {
  columns: string[];
  rows: Record<string, unknown>[];
  preview: Record<string, unknown>[];
  stats: {
    rowCount: number;
    columnCount: number;
  };
}

// ============================================================================
// PROMPTS & VERSIONING
// ============================================================================

export interface PromptWithVersions extends Prompt {
  versions: PromptVersion[];
}

export interface PromptVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  required?: boolean;
  default?: unknown;
}

// ============================================================================
// SCHEDULING
// ============================================================================

export interface ScheduleWithRuns extends Schedule {
  runs: ScheduleRun[];
}

// ============================================================================
// MONITORING & ALERTS
// ============================================================================

export interface ProactiveAlertWithCompany extends ProactiveAlert {
  company: Company;
}

// ============================================================================
// CHAT
// ============================================================================

export interface ChatMessageWithRelations extends ChatMessage {
  company: Company;
  user: User;
}

export interface ChatContext {
  companyId: string;
  messages: ChatMessage[];
  recentAnalyses?: Analysis[];
  recentMetrics?: AnalysisDataPoint[];
}

// ============================================================================
// API RESPONSES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super('NOT_FOUND', `${resource} not found`, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super('UNAUTHORIZED', message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super('FORBIDDEN', message, 403);
  }
}

export class ValidationError extends AppError {
  constructor(
    public field: string,
    message: string,
  ) {
    super('VALIDATION_ERROR', message, 400);
  }
}

// ============================================================================
// FORM & INPUT
// ============================================================================

export interface FormField<T = string> {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'date' | 'file';
  placeholder?: string;
  required?: boolean;
  validation?: (value: T) => boolean | string;
  options?: Array<{ value: string; label: string }>;
}

// ============================================================================
// EXPORT ALL ENUMS FOR CONVENIENCE
// ============================================================================

export const MODULES = {
  CMO: 'CMO' as const,
  CFO: 'CFO' as const,
  COO: 'COO' as const,
  HR: 'HR' as const,
  SALES: 'SALES' as const,
};

export const HEALTH_SCORES = {
  RED: 'RED' as const,
  AMBER: 'AMBER' as const,
  GREEN: 'GREEN' as const,
};

export const TASK_STATUSES = {
  TODO: 'TODO' as const,
  IN_PROGRESS: 'IN_PROGRESS' as const,
  DONE: 'DONE' as const,
  CANCELLED: 'CANCELLED' as const,
};

export const TASK_PRIORITIES = {
  CRITICAL: 'CRITICAL' as const,
  HIGH: 'HIGH' as const,
  MEDIUM: 'MEDIUM' as const,
  LOW: 'LOW' as const,
};
