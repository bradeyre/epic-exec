import { db } from '@/lib/db';
import { ScheduleFrequency, Module, ScheduleTriggerType } from '@/types';
import { formatDate } from '@/lib/utils';

interface CreateScheduleParams {
  companyId: string;
  functionName: string;
  module: Module;
  frequency: ScheduleFrequency;
  triggerType: ScheduleTriggerType;
  triggerConfig?: Record<string, any>;
  isActive?: boolean;
  recipients?: string[];
}

/**
 * Create a new recurring schedule for analyses
 */
export async function createSchedule(params: CreateScheduleParams): Promise<any> {
  const {
    companyId,
    functionName,
    module,
    frequency,
    triggerType,
    triggerConfig = {},
    isActive = true,
    recipients = [],
  } = params;

  try {
    const schedule = await db.schedule.create({
      data: {
        companyId,
        tenantId: 'default-tenant',
        title: `${module} - ${functionName}`,
        functionName,
        module,
        frequency,
        triggerType,
        config: triggerConfig,
        isActive,
        recipientEmails: recipients,
        nextRunAt: calculateNextRun(frequency),
      },
    });

    return schedule;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to create schedule: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Get upcoming scheduled runs
 */
export async function getUpcomingSchedules(
  tenantId: string,
  daysAhead: number = 30,
): Promise<any[]> {
  try {
    const now = new Date();
    const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    const schedules = await db.schedule.findMany({
      where: {
        company: {
          tenantId,
        },
        isActive: true,
        nextRunAt: {
          gte: now,
          lte: futureDate,
        },
      },
      include: {
        company: true,
      },
      orderBy: { nextRunAt: 'asc' },
    });

    return schedules;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch upcoming schedules: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Execute a scheduled analysis
 */
export async function executeSchedule(scheduleId: string): Promise<any> {
  try {
    const schedule = await db.schedule.findUnique({
      where: { id: scheduleId },
      include: { company: true },
    });

    if (!schedule) {
      throw new Error(`Schedule ${scheduleId} not found`);
    }

    // Create run record
    const run = await db.scheduleRun.create({
      data: {
        scheduleId,
        status: 'RUNNING',
      },
    });

    // Update next run time
    const nextRunAt = calculateNextRun(schedule.frequency);
    await db.schedule.update({
      where: { id: scheduleId },
      data: { nextRunAt, lastRunAt: new Date() },
    });

    return {
      schedule,
      run,
      nextRunAt,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to execute schedule: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Generate reminder email HTML
 */
export function generateReminderEmail(schedule: any, company: any): string {
  const nextRun = schedule.nextRunAt || new Date();
  const functionName = schedule.functionName.replace(/_/g, ' ');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
    .metric { margin: 20px 0; padding: 15px; background: white; border-left: 4px solid #667eea; border-radius: 4px; }
    .metric-label { font-size: 12px; color: #666; text-transform: uppercase; margin-bottom: 5px; }
    .metric-value { font-size: 20px; font-weight: bold; color: #1a1a1a; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; margin-top: 20px; font-weight: 500; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${functionName} Reminder</h1>
      <p>${company.name}</p>
    </div>
    <div class="content">
      <p>Hi there,</p>
      <p>Your scheduled <strong>${functionName}</strong> analysis is coming up soon.</p>

      <div class="metric">
        <div class="metric-label">Scheduled For</div>
        <div class="metric-value">${formatDate(nextRun)}</div>
      </div>

      <div class="metric">
        <div class="metric-label">Analysis Type</div>
        <div class="metric-value">${schedule.module}</div>
      </div>

      <div class="metric">
        <div class="metric-label">Frequency</div>
        <div class="metric-value">${schedule.frequency}</div>
      </div>

      <p>Make sure your data sources are up to date and ready. The analysis will run automatically on the scheduled date.</p>

      <a href="${process.env.NEXTAUTH_URL}/dashboard?tab=analyses" class="button">View Dashboard</a>

      <div class="footer">
        <p>You received this email because you are scheduled to receive ${schedule.frequency.toLowerCase()} ${functionName.toLowerCase()} analysis reminders.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Calculate next run time based on frequency
 */
export function calculateNextRun(frequency: ScheduleFrequency): Date {
  const now = new Date();

  switch (frequency) {
    case 'DAILY':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case 'WEEKLY':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case 'FORTNIGHTLY':
      return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    case 'MONTHLY':
      const nextMonth = new Date(now);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      return nextMonth;
    case 'QUARTERLY':
      const nextQuarter = new Date(now);
      nextQuarter.setMonth(nextQuarter.getMonth() + 3);
      return nextQuarter;
    case 'ANNUALLY':
      const nextYear = new Date(now);
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      return nextYear;
    default:
      return now;
  }
}

/**
 * Get default schedule templates for a module
 * Per V2 §2.3
 */
export function getDefaultSchedules(module: Module): CreateScheduleParams[] {
  if (module === 'CFO') {
    return [
      {
        companyId: '',
        functionName: 'financial_health_score',
        module: 'CFO',
        frequency: 'WEEKLY',
        triggerType: 'REMINDER',
        isActive: true,
        recipients: [],
      },
      {
        companyId: '',
        functionName: 'cash_flow_analysis',
        module: 'CFO',
        frequency: 'WEEKLY',
        triggerType: 'REMINDER',
        isActive: true,
        recipients: [],
      },
      {
        companyId: '',
        functionName: 'budget_vs_actuals',
        module: 'CFO',
        frequency: 'WEEKLY',
        triggerType: 'REMINDER',
        isActive: true,
        recipients: [],
      },
      {
        companyId: '',
        functionName: 'profitability_analysis',
        module: 'CFO',
        frequency: 'MONTHLY',
        triggerType: 'REMINDER',
        isActive: true,
        recipients: [],
      },
      {
        companyId: '',
        functionName: 'balance_sheet_analysis',
        module: 'CFO',
        frequency: 'QUARTERLY',
        triggerType: 'REMINDER',
        isActive: true,
        recipients: [],
      },
    ];
  }

  if (module === 'CMO') {
    return [
      {
        companyId: '',
        functionName: 'campaign_performance',
        module: 'CMO',
        frequency: 'WEEKLY',
        triggerType: 'REMINDER',
        isActive: true,
        recipients: [],
      },
      {
        companyId: '',
        functionName: 'content_calendar_optimization',
        module: 'CMO',
        frequency: 'WEEKLY',
        triggerType: 'REMINDER',
        isActive: true,
        recipients: [],
      },
      {
        companyId: '',
        functionName: 'customer_sentiment',
        module: 'CMO',
        frequency: 'FORTNIGHTLY',
        triggerType: 'REMINDER',
        isActive: true,
        recipients: [],
      },
      {
        companyId: '',
        functionName: 'market_positioning',
        module: 'CMO',
        frequency: 'MONTHLY',
        triggerType: 'REMINDER',
        isActive: true,
        recipients: [],
      },
      {
        companyId: '',
        functionName: 'brand_audit',
        module: 'CMO',
        frequency: 'QUARTERLY',
        triggerType: 'REMINDER',
        isActive: true,
        recipients: [],
      },
    ];
  }

  return [];
}

/**
 * Set up default schedules for a company
 */
export async function setupDefaultSchedules(companyId: string, module: Module): Promise<any[]> {
  try {
    const templates = getDefaultSchedules(module);
    const schedules = [];

    for (const template of templates) {
      const schedule = await createSchedule({
        ...template,
        companyId,
      });
      schedules.push(schedule);
    }

    return schedules;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to setup default schedules: ${error.message}`);
    }
    throw error;
  }
}
