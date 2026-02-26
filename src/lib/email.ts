import { Resend } from 'resend';
import { formatDate, formatCurrency } from '@/lib/utils';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Base email sending function
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@virtualexecutive.com',
      to,
      subject,
      html,
    });

    if (result.error) {
      return { success: false, error: result.error.message };
    }

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Unknown error occurred' };
  }
}

/**
 * Send analysis reminder email per V2 §2.4
 */
export async function sendReminderEmail(
  schedule: any,
  company: any,
  recipient: string,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const functionName = schedule.functionName.replace(/_/g, ' ');
  const nextRun = schedule.nextRunAt || new Date();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; line-height: 1.6; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .card { background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
    .header p { margin: 8px 0 0 0; font-size: 16px; opacity: 0.9; }
    .content { padding: 30px; }
    .section { margin: 20px 0; }
    .section-title { font-size: 14px; font-weight: 600; color: #666; text-transform: uppercase; margin-bottom: 12px; }
    .metric-box { background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 10px 0; border-left: 4px solid #667eea; }
    .metric-label { font-size: 12px; color: #666; }
    .metric-value { font-size: 18px; font-weight: 600; color: #1a1a1a; margin-top: 4px; }
    .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500; margin-top: 20px; }
    .cta-button:hover { background: #5568d3; }
    .footer { text-align: center; padding: 20px; background: #f8f9fa; color: #666; font-size: 12px; }
    .divider { height: 1px; background: #e5e5e5; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <h1>${functionName}</h1>
        <p>Scheduled Analysis Reminder</p>
      </div>
      <div class="content">
        <p>Hi there,</p>
        <p>Your scheduled <strong>${functionName}</strong> analysis for <strong>${company.name}</strong> is coming up soon.</p>

        <div class="divider"></div>

        <div class="section">
          <div class="section-title">Scheduled Date</div>
          <div class="metric-box">
            <div class="metric-label">Analysis will run on</div>
            <div class="metric-value">${formatDate(nextRun)}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Details</div>
          <div class="metric-box">
            <div class="metric-label">Analysis Type</div>
            <div class="metric-value">${schedule.module}</div>
          </div>
          <div class="metric-box">
            <div class="metric-label">Frequency</div>
            <div class="metric-value">${schedule.frequency.replace(/_/g, ' ')}</div>
          </div>
        </div>

        <p>Make sure your data sources are up to date. The analysis will run automatically at the scheduled time.</p>

        <a href="${process.env.NEXTAUTH_URL || 'https://virtualexecutive.com'}/dashboard?tab=analyses" class="cta-button">View Dashboard</a>
      </div>
      <div class="footer">
        <p>You received this email because you are subscribed to ${functionName.toLowerCase()} analysis reminders for ${company.name}.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail(recipient, `${functionName} Analysis Reminder - ${company.name}`, html);
}

/**
 * Send Monday Morning Briefing per V2 §7.1
 */
export async function sendMondayBriefing(
  company: any,
  metrics: Array<{ label: string; value: string; change?: string }>,
  alerts: Array<{ severity: 'high' | 'medium' | 'low'; message: string }>,
  tasks: Array<{ title: string; priority: string; dueDate: Date }>,
  recipient: string,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const metricsHtml = metrics
    .map(
      (m) => `
    <div class="metric-box">
      <div class="metric-label">${m.label}</div>
      <div class="metric-value">${m.value}</div>
      ${m.change ? `<div class="metric-change" style="font-size: 12px; color: ${m.change.startsWith('+') ? '#10b981' : '#ef4444'}; margin-top: 4px;">${m.change}</div>` : ''}
    </div>
  `,
    )
    .join('');

  const alertsHtml = alerts
    .map((a) => {
      const severity = a.severity === 'high' ? '#ef4444' : a.severity === 'medium' ? '#f59e0b' : '#3b82f6';
      return `
    <div style="padding: 12px; background: ${severity}20; border-left: 4px solid ${severity}; margin: 10px 0; border-radius: 4px;">
      <div style="color: ${severity}; font-weight: 500; margin-bottom: 4px;">${a.severity.toUpperCase()} - Alert</div>
      <div style="color: #1a1a1a;">${a.message}</div>
    </div>
  `;
    })
    .join('');

  const tasksHtml = tasks
    .map(
      (t) => `
    <div style="padding: 12px; background: #f8f9fa; border-left: 4px solid #667eea; margin: 8px 0; border-radius: 4px;">
      <div style="font-weight: 500; color: #1a1a1a; margin-bottom: 4px;">${t.title}</div>
      <div style="font-size: 12px; color: #666;">Priority: ${t.priority} • Due: ${formatDate(t.dueDate)}</div>
    </div>
  `,
    )
    .join('');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; line-height: 1.6; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .card { background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
    .content { padding: 30px; }
    .section { margin: 30px 0; }
    .section-title { font-size: 14px; font-weight: 600; color: #666; text-transform: uppercase; margin-bottom: 16px; }
    .metric-box { background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 10px 0; border-left: 4px solid #667eea; }
    .metric-label { font-size: 12px; color: #666; }
    .metric-value { font-size: 22px; font-weight: 600; color: #1a1a1a; margin-top: 6px; }
    .footer { text-align: center; padding: 20px; background: #f8f9fa; color: #666; font-size: 12px; }
    .divider { height: 1px; background: #e5e5e5; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <h1>Monday Morning Briefing</h1>
        <p>${company.name}</p>
      </div>
      <div class="content">
        <p>Good morning,</p>
        <p>Here's your weekly briefing for ${company.name}.</p>

        ${
          metrics.length > 0
            ? `
        <div class="section">
          <div class="section-title">Key Metrics</div>
          ${metricsHtml}
        </div>
        `
            : ''
        }

        ${
          alerts.length > 0
            ? `
        <div class="divider"></div>
        <div class="section">
          <div class="section-title">Alerts</div>
          ${alertsHtml}
        </div>
        `
            : ''
        }

        ${
          tasks.length > 0
            ? `
        <div class="divider"></div>
        <div class="section">
          <div class="section-title">This Week's Tasks</div>
          ${tasksHtml}
        </div>
        `
            : ''
        }
      </div>
      <div class="footer">
        <p>You received this email because you are subscribed to the Monday Morning Briefing for ${company.name}.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail(recipient, `Monday Morning Briefing - ${company.name}`, html);
}

/**
 * Send newsletter content request per V3 §1.3
 */
export async function sendNewsletterContentRequest(
  company: any,
  brandVoice: any,
  upcomingDates: Array<{ date: Date; topic: string }>,
  recipient: string,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const datesHtml = upcomingDates
    .map((d) => `<li><strong>${formatDate(d.date)}</strong> - ${d.topic}</li>`)
    .join('');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; line-height: 1.6; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .card { background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
    .content { padding: 30px; }
    .section { margin: 20px 0; }
    .section-title { font-size: 14px; font-weight: 600; color: #666; text-transform: uppercase; margin-bottom: 12px; }
    .brand-box { background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 10px 0; }
    .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500; margin-top: 20px; }
    .cta-button:hover { background: #5568d3; }
    .footer { text-align: center; padding: 20px; background: #f8f9fa; color: #666; font-size: 12px; }
    ul { list-style: none; padding: 0; }
    li { padding: 8px 0; border-bottom: 1px solid #e5e5e5; }
    li:last-child { border-bottom: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <h1>Newsletter Content Request</h1>
        <p>${company.name}</p>
      </div>
      <div class="content">
        <p>Hi,</p>
        <p>It's time to prepare content for your upcoming newsletter issues. Below are the scheduled publication dates and topics.</p>

        <div class="section">
          <div class="section-title">Upcoming Newsletter Issues</div>
          <ul>
            ${datesHtml}
          </ul>
        </div>

        <div class="section">
          <div class="section-title">Brand Voice Guidelines</div>
          <div class="brand-box">
            <p><strong>Tone:</strong> ${brandVoice.tone || 'Professional'}</p>
            <p><strong>Formality:</strong> ${brandVoice.formality ? `${brandVoice.formality}% formal` : 'Balanced'}</p>
            <p><strong>Key Themes:</strong> ${brandVoice.contentPillars?.join(', ') || 'Industry insights, customer stories, best practices'}</p>
          </div>
        </div>

        <p>Please submit your content ideas and drafts to maintain consistency with our brand voice and publishing schedule.</p>

        <a href="${process.env.NEXTAUTH_URL || 'https://virtualexecutive.com'}/dashboard?tab=newsletter" class="cta-button">Submit Content</a>
      </div>
      <div class="footer">
        <p>You received this email because you manage newsletters for ${company.name}.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail(
    recipient,
    `Newsletter Content Request - ${company.name} - ${formatDate(new Date())}`,
    html,
  );
}

/**
 * Send proactive alert notification
 */
export async function sendAlertEmail(
  alert: { severity: 'HIGH' | 'MEDIUM' | 'LOW'; message: string; context?: string },
  company: any,
  recipients: string[],
): Promise<Array<{ success: boolean; messageId?: string; error?: string }>> {
  const severityColor = {
    HIGH: '#ef4444',
    MEDIUM: '#f59e0b',
    LOW: '#3b82f6',
  };

  const color = severityColor[alert.severity];

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; line-height: 1.6; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .card { background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden; }
    .header { background: ${color}; color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
    .content { padding: 30px; }
    .alert-box { background: ${color}20; border: 2px solid ${color}; border-radius: 6px; padding: 20px; margin: 20px 0; }
    .alert-title { color: ${color}; font-weight: 600; font-size: 16px; margin-bottom: 10px; }
    .alert-message { color: #1a1a1a; }
    .cta-button { display: inline-block; background: ${color}; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500; margin-top: 20px; }
    .cta-button:hover { opacity: 0.9; }
    .footer { text-align: center; padding: 20px; background: #f8f9fa; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <h1>Proactive Alert</h1>
        <p>${alert.severity} Severity</p>
      </div>
      <div class="content">
        <p>Hi,</p>

        <div class="alert-box">
          <div class="alert-title">${alert.severity} - ${alert.message}</div>
          ${alert.context ? `<div class="alert-message">${alert.context}</div>` : ''}
        </div>

        <p>This alert requires your attention. Please review the details and take appropriate action.</p>

        <a href="${process.env.NEXTAUTH_URL || 'https://virtualexecutive.com'}/dashboard?tab=alerts" class="cta-button">View Details</a>
      </div>
      <div class="footer">
        <p>You received this alert for ${company.name} because you are subscribed to ${alert.severity.toLowerCase()} severity notifications.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  const results = await Promise.all(
    recipients.map((recipient) =>
      sendEmail(recipient, `[${alert.severity}] Alert for ${company.name}`, html),
    ),
  );

  return results;
}
