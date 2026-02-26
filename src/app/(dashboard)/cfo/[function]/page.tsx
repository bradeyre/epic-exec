'use client';

import React, { useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { WizardContainer, WizardStep } from '@/components/wizard/wizard-container';
import { StepCompanyContext, type CompanyContextData } from '@/components/wizard/step-company-context';
import { StepDataIngestion } from '@/components/wizard/step-data-ingestion';
import { StepFocusAreas } from '@/components/wizard/step-focus-areas';
import { StepAnalysisResults } from '@/components/wizard/step-analysis-results';
import { StepActionItems } from '@/components/wizard/step-action-items';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

interface FunctionConfig {
  slug: string;
  name: string;
  description: string;
  category: string;
  focusAreas: Array<{
    id: string;
    title: string;
    description: string;
  }>;
}

// All 40 CFO function configurations
const FUNCTION_CONFIGS: { [key: string]: FunctionConfig } = {
  // ── CFO Advisory ──
  'cfo-advisory': {
    slug: 'cfo-advisory',
    name: 'General CFO Advisory',
    description: 'Strategic financial advice from a top-tier fractional CFO',
    category: 'CFO Advisory',
    focusAreas: [
      { id: '1', title: 'Financial Health Check', description: 'Overall financial health assessment and key risks' },
      { id: '2', title: 'Growth Readiness', description: 'Are your finances ready to scale toward your revenue target?' },
      { id: '3', title: 'Cash & Runway', description: 'Cash position, burn rate, and runway analysis' },
      { id: '4', title: 'Profitability Levers', description: 'Biggest opportunities to improve margins and profitability' },
      { id: '5', title: 'Bookkeeper & Reporting Quality', description: 'Feedback on your financial reporting and what to ask your bookkeeper for' },
      { id: '6', title: 'What to Focus on Next', description: 'The 3-5 things a top CFO would prioritise right now' },
    ],
  },

  // ── Core Financial Reporting ──
  'pl-analysis': {
    slug: 'pl-analysis',
    name: 'P&L Analysis',
    description: 'Income statement review and insights',
    category: 'Core Financial Reporting',
    focusAreas: [
      { id: '1', title: 'Revenue Trends', description: 'Analyze revenue growth patterns and trajectory' },
      { id: '2', title: 'Cost Structure', description: 'Review cost composition and allocation' },
      { id: '3', title: 'Gross Margin', description: 'Analyze COGS and gross margin trends' },
      { id: '4', title: 'Operating Expenses', description: 'Review OpEx allocation and efficiency' },
      { id: '5', title: 'EBITDA & Profitability', description: 'Analyze profitability metrics and margins' },
      { id: '6', title: 'YoY Comparisons', description: 'Year-over-year and period-over-period analysis' },
    ],
  },
  'balance-sheet': {
    slug: 'balance-sheet',
    name: 'Balance Sheet Review',
    description: 'Assets, liabilities, and equity analysis',
    category: 'Core Financial Reporting',
    focusAreas: [
      { id: '1', title: 'Asset Quality', description: 'Assess asset composition and utilization' },
      { id: '2', title: 'Liquidity Position', description: 'Current ratio and quick ratio analysis' },
      { id: '3', title: 'Debt Levels', description: 'Leverage and solvency analysis' },
      { id: '4', title: 'Working Capital', description: 'Working capital adequacy and trends' },
      { id: '5', title: 'Equity Structure', description: 'Shareholder equity and retained earnings' },
      { id: '6', title: 'Ratio Analysis', description: 'Key financial ratios and benchmarks' },
    ],
  },
  'cash-flow-analysis': {
    slug: 'cash-flow-analysis',
    name: 'Cash Flow Analysis',
    description: 'Operating, investing, and financing flows',
    category: 'Core Financial Reporting',
    focusAreas: [
      { id: '1', title: 'Operating Cash Flow', description: 'Core business cash generation' },
      { id: '2', title: 'Investing Activities', description: 'Capital expenditure and investment flows' },
      { id: '3', title: 'Financing Activities', description: 'Debt and equity financing flows' },
      { id: '4', title: 'Cash Conversion', description: 'Operating cycle and conversion efficiency' },
      { id: '5', title: 'Free Cash Flow', description: 'FCF calculation, trends, and sustainability' },
      { id: '6', title: 'Cash Runway', description: 'Liquidity outlook and cash runway' },
    ],
  },
  'management-accounts': {
    slug: 'management-accounts',
    name: 'Management Accounts',
    description: 'Prepare monthly management reporting',
    category: 'Core Financial Reporting',
    focusAreas: [
      { id: '1', title: 'Monthly Performance', description: 'Month-end financial performance summary' },
      { id: '2', title: 'Budget Variance', description: 'Actual vs budget variance analysis' },
      { id: '3', title: 'KPI Dashboard', description: 'Key performance indicators tracking' },
      { id: '4', title: 'Cash Position', description: 'Monthly cash position and movements' },
      { id: '5', title: 'Departmental Analysis', description: 'Performance by department or cost centre' },
    ],
  },
  'financial-statements': {
    slug: 'financial-statements',
    name: 'Financial Statements',
    description: 'Complete financial reporting package',
    category: 'Core Financial Reporting',
    focusAreas: [
      { id: '1', title: 'Income Statement', description: 'Full P&L with notes and commentary' },
      { id: '2', title: 'Balance Sheet', description: 'Statement of financial position' },
      { id: '3', title: 'Cash Flow Statement', description: 'Statement of cash flows' },
      { id: '4', title: 'Notes & Disclosures', description: 'Supporting notes and accounting policies' },
      { id: '5', title: 'Compliance Check', description: 'IFRS/GAAP compliance review' },
    ],
  },
  'board-financial-report': {
    slug: 'board-financial-report',
    name: 'Board Financial Report',
    description: 'Executive summary for board meetings',
    category: 'Core Financial Reporting',
    focusAreas: [
      { id: '1', title: 'Executive Summary', description: 'High-level financial overview for board' },
      { id: '2', title: 'Strategic Metrics', description: 'Key strategic financial indicators' },
      { id: '3', title: 'Risk Assessment', description: 'Financial risks and mitigation' },
      { id: '4', title: 'Forward Outlook', description: 'Projections and outlook commentary' },
      { id: '5', title: 'Capital Allocation', description: 'Investment and capital decisions' },
    ],
  },

  // ── Planning & Forecasting ──
  'annual-budget-builder': {
    slug: 'annual-budget-builder',
    name: 'Annual Budget Builder',
    description: 'Create comprehensive annual budgets',
    category: 'Planning & Forecasting',
    focusAreas: [
      { id: '1', title: 'Revenue Budget', description: 'Project annual revenue by stream' },
      { id: '2', title: 'Cost Budget', description: 'Allocate cost allowances by category' },
      { id: '3', title: 'Headcount Planning', description: 'Personnel cost and headcount planning' },
      { id: '4', title: 'CapEx Planning', description: 'Capital expenditure budget' },
      { id: '5', title: 'Cash Flow Forecast', description: 'Monthly cash flow projections' },
    ],
  },
  'budget-vs-actual': {
    slug: 'budget-vs-actual',
    name: 'Budget vs. Actual',
    description: 'Variance analysis and reporting',
    category: 'Planning & Forecasting',
    focusAreas: [
      { id: '1', title: 'Revenue Variance', description: 'Actual vs budgeted revenue analysis' },
      { id: '2', title: 'Cost Variance', description: 'Expense variances by category' },
      { id: '3', title: 'Profitability Impact', description: 'Margin impact of variances' },
      { id: '4', title: 'Root Cause Analysis', description: 'Identify drivers of variances' },
      { id: '5', title: 'Corrective Actions', description: 'Recommended adjustments and actions' },
    ],
  },
  'revenue-forecasting': {
    slug: 'revenue-forecasting',
    name: 'Revenue Forecasting',
    description: 'Project future revenue streams',
    category: 'Planning & Forecasting',
    focusAreas: [
      { id: '1', title: 'Historical Trends', description: 'Analyze past revenue performance' },
      { id: '2', title: 'Seasonal Patterns', description: 'Identify seasonal revenue variations' },
      { id: '3', title: 'Growth Drivers', description: 'Key revenue growth factors' },
      { id: '4', title: 'Market Conditions', description: 'External market and economic factors' },
      { id: '5', title: 'Customer Segments', description: 'Segment-specific revenue forecasts' },
    ],
  },
  'scenario-planning': {
    slug: 'scenario-planning',
    name: 'Scenario Planning',
    description: 'Model different business scenarios',
    category: 'Planning & Forecasting',
    focusAreas: [
      { id: '1', title: 'Base Case', description: 'Most likely business scenario' },
      { id: '2', title: 'Best Case', description: 'Optimistic growth scenario' },
      { id: '3', title: 'Worst Case', description: 'Downside risk scenario' },
      { id: '4', title: 'Sensitivity Analysis', description: 'Key variable sensitivity' },
      { id: '5', title: 'Risk Mitigation', description: 'Contingency planning for each scenario' },
    ],
  },
  'break-even-analysis': {
    slug: 'break-even-analysis',
    name: 'Break-Even Analysis',
    description: 'Calculate break-even points',
    category: 'Planning & Forecasting',
    focusAreas: [
      { id: '1', title: 'Fixed Costs', description: 'Identify all fixed cost components' },
      { id: '2', title: 'Variable Costs', description: 'Variable cost per unit analysis' },
      { id: '3', title: 'Contribution Margin', description: 'Contribution margin calculation' },
      { id: '4', title: 'Break-Even Units', description: 'Volume needed to break even' },
      { id: '5', title: 'Safety Margin', description: 'Margin of safety analysis' },
    ],
  },
  'capex-planning': {
    slug: 'capex-planning',
    name: 'CapEx Planning',
    description: 'Capital expenditure forecasting',
    category: 'Planning & Forecasting',
    focusAreas: [
      { id: '1', title: 'Current CapEx', description: 'Existing capital expenditure review' },
      { id: '2', title: 'ROI Analysis', description: 'Return on investment for capital projects' },
      { id: '3', title: 'Prioritization', description: 'Capital project prioritization' },
      { id: '4', title: 'Funding Strategy', description: 'How to fund capital projects' },
      { id: '5', title: 'Depreciation Impact', description: 'Depreciation and tax implications' },
    ],
  },

  // ── Cash & Treasury ──
  'cash-runway': {
    slug: 'cash-runway',
    name: 'Cash Runway Analysis',
    description: 'Determine months of runway remaining',
    category: 'Cash & Treasury',
    focusAreas: [
      { id: '1', title: 'Current Cash Position', description: 'Starting cash balance and reserves' },
      { id: '2', title: 'Monthly Burn Rate', description: 'Net cash burn analysis' },
      { id: '3', title: 'Revenue Growth', description: 'Revenue trajectory impact on runway' },
      { id: '4', title: 'Funding Sources', description: 'Available funding and credit options' },
      { id: '5', title: 'Break-Even Timeline', description: 'Path to cash flow positive' },
    ],
  },
  'cash-flow-optimisation': {
    slug: 'cash-flow-optimisation',
    name: 'Cash Flow Optimization',
    description: 'Improve cash conversion cycles',
    category: 'Cash & Treasury',
    focusAreas: [
      { id: '1', title: 'Cash Conversion Cycle', description: 'Days sales outstanding, inventory, payables' },
      { id: '2', title: 'Collection Efficiency', description: 'Accelerate cash collection' },
      { id: '3', title: 'Payment Optimization', description: 'Optimize payment timing' },
      { id: '4', title: 'Working Capital', description: 'Working capital optimization strategies' },
      { id: '5', title: 'Cash Forecasting', description: 'Improve cash flow predictability' },
    ],
  },
  'working-capital': {
    slug: 'working-capital',
    name: 'Working Capital Analysis',
    description: 'Optimize inventory, receivables, payables',
    category: 'Cash & Treasury',
    focusAreas: [
      { id: '1', title: 'Receivables', description: 'Accounts receivable aging and trends' },
      { id: '2', title: 'Payables', description: 'Accounts payable management' },
      { id: '3', title: 'Inventory', description: 'Inventory levels and turnover' },
      { id: '4', title: 'Net Working Capital', description: 'Overall working capital position' },
      { id: '5', title: 'Efficiency Ratios', description: 'Working capital efficiency metrics' },
    ],
  },
  'debtor-management': {
    slug: 'debtor-management',
    name: 'Debtor Management',
    description: 'Accounts receivable strategies',
    category: 'Cash & Treasury',
    focusAreas: [
      { id: '1', title: 'Aging Analysis', description: 'Receivables aging breakdown' },
      { id: '2', title: 'Collection Performance', description: 'Collection rate and DSO trends' },
      { id: '3', title: 'Bad Debt Risk', description: 'Identify at-risk accounts' },
      { id: '4', title: 'Credit Policy', description: 'Credit terms and policy review' },
      { id: '5', title: 'Collection Strategy', description: 'Improve collection processes' },
    ],
  },
  'creditor-management': {
    slug: 'creditor-management',
    name: 'Creditor Management',
    description: 'Accounts payable optimization',
    category: 'Cash & Treasury',
    focusAreas: [
      { id: '1', title: 'Payment Terms', description: 'Supplier payment terms analysis' },
      { id: '2', title: 'Early Payment Discounts', description: 'Discount capture opportunities' },
      { id: '3', title: 'Supplier Concentration', description: 'Supplier risk and dependency' },
      { id: '4', title: 'Cash Flow Timing', description: 'Optimize payment scheduling' },
      { id: '5', title: 'Creditor Aging', description: 'Payables aging and compliance' },
    ],
  },
  'loan-evaluation': {
    slug: 'loan-evaluation',
    name: 'Loan Evaluation',
    description: 'Assess financing options',
    category: 'Cash & Treasury',
    focusAreas: [
      { id: '1', title: 'Current Debt Profile', description: 'Existing debt obligations' },
      { id: '2', title: 'Borrowing Capacity', description: 'Debt capacity and coverage ratios' },
      { id: '3', title: 'Interest Rate Analysis', description: 'Rate comparison and cost of debt' },
      { id: '4', title: 'Repayment Structure', description: 'Amortization and repayment options' },
      { id: '5', title: 'Loan Comparison', description: 'Compare financing alternatives' },
    ],
  },

  // ── Profitability & Costing ──
  'pricing-strategy': {
    slug: 'pricing-strategy',
    name: 'Pricing Strategy',
    description: 'Optimize pricing models',
    category: 'Profitability & Costing',
    focusAreas: [
      { id: '1', title: 'Current Pricing', description: 'Review current pricing structure' },
      { id: '2', title: 'Cost-Plus Analysis', description: 'Cost-based pricing calculations' },
      { id: '3', title: 'Competitive Pricing', description: 'Market and competitor pricing' },
      { id: '4', title: 'Price Elasticity', description: 'Demand sensitivity to price changes' },
      { id: '5', title: 'Margin Impact', description: 'Pricing impact on profitability' },
    ],
  },
  'product-profitability': {
    slug: 'product-profitability',
    name: 'Product Profitability',
    description: 'Margin analysis by product',
    category: 'Profitability & Costing',
    focusAreas: [
      { id: '1', title: 'Revenue Mix', description: 'Revenue contribution by product' },
      { id: '2', title: 'Cost Allocation', description: 'Direct and indirect cost allocation' },
      { id: '3', title: 'Margin by Product', description: 'Gross and net margin per product' },
      { id: '4', title: 'Product Performance', description: 'Top and bottom performing products' },
      { id: '5', title: 'Portfolio Strategy', description: 'Product mix optimization' },
    ],
  },
  'customer-profitability': {
    slug: 'customer-profitability',
    name: 'Customer Profitability',
    description: 'Analyze margin by customer',
    category: 'Profitability & Costing',
    focusAreas: [
      { id: '1', title: 'Customer Revenue', description: 'Revenue distribution by customer' },
      { id: '2', title: 'Cost to Serve', description: 'Cost of serving each customer segment' },
      { id: '3', title: 'Customer Margins', description: 'Profitability by customer tier' },
      { id: '4', title: 'Customer Lifetime Value', description: 'CLV analysis and segmentation' },
      { id: '5', title: 'Retention Economics', description: 'Cost of retention vs acquisition' },
    ],
  },
  'cost-optimisation': {
    slug: 'cost-optimisation',
    name: 'Cost Optimization',
    description: 'Identify cost reduction opportunities',
    category: 'Profitability & Costing',
    focusAreas: [
      { id: '1', title: 'Cost Breakdown', description: 'Detailed cost category analysis' },
      { id: '2', title: 'Benchmarking', description: 'Compare costs to industry benchmarks' },
      { id: '3', title: 'Quick Wins', description: 'Immediate cost saving opportunities' },
      { id: '4', title: 'Structural Changes', description: 'Longer-term cost reduction initiatives' },
      { id: '5', title: 'Implementation Plan', description: 'Prioritized cost reduction roadmap' },
    ],
  },
  'unit-economics': {
    slug: 'unit-economics',
    name: 'Unit Economics',
    description: 'Analyze per-unit economics',
    category: 'Profitability & Costing',
    focusAreas: [
      { id: '1', title: 'Revenue Per Unit', description: 'Average revenue and pricing analysis' },
      { id: '2', title: 'Cost Per Unit', description: 'Variable and allocated fixed costs' },
      { id: '3', title: 'Contribution Margin', description: 'Unit contribution margin analysis' },
      { id: '4', title: 'CAC & LTV', description: 'Customer acquisition cost and lifetime value' },
      { id: '5', title: 'Scalability', description: 'Unit economics at scale projections' },
    ],
  },

  // ── Strategic Finance ──
  'acquisition-due-diligence': {
    slug: 'acquisition-due-diligence',
    name: 'Acquisition Due Diligence',
    description: 'Financial analysis for M&A',
    category: 'Strategic Finance',
    focusAreas: [
      { id: '1', title: 'Financial Health', description: 'Target company financial assessment' },
      { id: '2', title: 'Revenue Quality', description: 'Revenue sustainability and quality' },
      { id: '3', title: 'Liability Review', description: 'Hidden liabilities and contingencies' },
      { id: '4', title: 'Synergy Analysis', description: 'Cost and revenue synergy potential' },
      { id: '5', title: 'Valuation', description: 'Fair value assessment of the target' },
    ],
  },
  'business-valuation': {
    slug: 'business-valuation',
    name: 'Business Valuation',
    description: 'Determine enterprise value',
    category: 'Strategic Finance',
    focusAreas: [
      { id: '1', title: 'DCF Analysis', description: 'Discounted cash flow valuation' },
      { id: '2', title: 'Comparable Multiples', description: 'Industry multiples comparison' },
      { id: '3', title: 'Asset-Based', description: 'Net asset value calculation' },
      { id: '4', title: 'Growth Assumptions', description: 'Revenue and earnings growth rates' },
      { id: '5', title: 'Valuation Range', description: 'Triangulated valuation range' },
    ],
  },
  'investment-appraisal': {
    slug: 'investment-appraisal',
    name: 'Investment Appraisal',
    description: 'Evaluate investment opportunities',
    category: 'Strategic Finance',
    focusAreas: [
      { id: '1', title: 'NPV Analysis', description: 'Net present value calculation' },
      { id: '2', title: 'IRR Calculation', description: 'Internal rate of return' },
      { id: '3', title: 'Payback Period', description: 'Time to recoup investment' },
      { id: '4', title: 'Risk Assessment', description: 'Investment risk factors' },
      { id: '5', title: 'Recommendation', description: 'Go/no-go investment recommendation' },
    ],
  },
  'shareholder-distributions': {
    slug: 'shareholder-distributions',
    name: 'Shareholder Distributions',
    description: 'Plan dividends and distributions',
    category: 'Strategic Finance',
    focusAreas: [
      { id: '1', title: 'Distributable Reserves', description: 'Available profits for distribution' },
      { id: '2', title: 'Dividend Policy', description: 'Optimal dividend policy' },
      { id: '3', title: 'Tax Implications', description: 'Dividend tax and withholding' },
      { id: '4', title: 'Cash Impact', description: 'Distribution impact on cash reserves' },
      { id: '5', title: 'Shareholder Value', description: 'Total shareholder return analysis' },
    ],
  },
  'entity-structure': {
    slug: 'entity-structure',
    name: 'Entity Structure',
    description: 'Optimize corporate structure',
    category: 'Strategic Finance',
    focusAreas: [
      { id: '1', title: 'Current Structure', description: 'Review existing entity structure' },
      { id: '2', title: 'Tax Efficiency', description: 'Tax optimization opportunities' },
      { id: '3', title: 'Legal Protection', description: 'Asset protection and liability' },
      { id: '4', title: 'Intercompany', description: 'Intercompany transactions and transfer pricing' },
      { id: '5', title: 'Restructuring Options', description: 'Recommended structural changes' },
    ],
  },
  'tax-planning': {
    slug: 'tax-planning',
    name: 'Tax Planning',
    description: 'Tax optimization strategies',
    category: 'Strategic Finance',
    focusAreas: [
      { id: '1', title: 'Tax Position', description: 'Current tax liability and provisions' },
      { id: '2', title: 'Deductions', description: 'Available deductions and allowances' },
      { id: '3', title: 'Tax Incentives', description: 'Government incentives and rebates' },
      { id: '4', title: 'Compliance', description: 'Tax compliance status and risks' },
      { id: '5', title: 'Planning Strategies', description: 'Tax optimization recommendations' },
    ],
  },

  // ── Compliance & Governance ──
  'vat-review': {
    slug: 'vat-review',
    name: 'VAT Review',
    description: 'VAT compliance and optimization',
    category: 'Compliance & Governance',
    focusAreas: [
      { id: '1', title: 'VAT Returns', description: 'Review VAT return accuracy' },
      { id: '2', title: 'Input VAT', description: 'Input VAT claim optimization' },
      { id: '3', title: 'Output VAT', description: 'Output VAT calculation review' },
      { id: '4', title: 'Compliance Risk', description: 'SARS compliance risk assessment' },
      { id: '5', title: 'Process Improvements', description: 'VAT process optimization' },
    ],
  },
  'paye-analysis': {
    slug: 'paye-analysis',
    name: 'PAYE Analysis',
    description: 'Employment tax compliance',
    category: 'Compliance & Governance',
    focusAreas: [
      { id: '1', title: 'PAYE Calculations', description: 'Verify PAYE deductions accuracy' },
      { id: '2', title: 'UIF & SDL', description: 'UIF and skills levy compliance' },
      { id: '3', title: 'Employee Benefits', description: 'Tax treatment of benefits' },
      { id: '4', title: 'Compliance Status', description: 'SARS filing compliance status' },
      { id: '5', title: 'Cost Optimization', description: 'Payroll tax optimization' },
    ],
  },
  'financial-controls': {
    slug: 'financial-controls',
    name: 'Financial Controls',
    description: 'Audit and control assessment',
    category: 'Compliance & Governance',
    focusAreas: [
      { id: '1', title: 'Control Environment', description: 'Overall control framework assessment' },
      { id: '2', title: 'Segregation of Duties', description: 'Role-based control review' },
      { id: '3', title: 'Approval Workflows', description: 'Authorization and approval processes' },
      { id: '4', title: 'Reconciliations', description: 'Bank and account reconciliation review' },
      { id: '5', title: 'Risk Mitigation', description: 'Control gap identification and remediation' },
    ],
  },
  'insurance-review': {
    slug: 'insurance-review',
    name: 'Insurance Review',
    description: 'Coverage and risk assessment',
    category: 'Compliance & Governance',
    focusAreas: [
      { id: '1', title: 'Current Coverage', description: 'Review existing insurance policies' },
      { id: '2', title: 'Coverage Gaps', description: 'Identify uninsured or underinsured risks' },
      { id: '3', title: 'Premium Analysis', description: 'Insurance cost optimization' },
      { id: '4', title: 'Claims History', description: 'Claims experience review' },
      { id: '5', title: 'Recommendations', description: 'Coverage and policy recommendations' },
    ],
  },
  'regulatory-compliance': {
    slug: 'regulatory-compliance',
    name: 'Regulatory Compliance',
    description: 'Industry-specific compliance',
    category: 'Compliance & Governance',
    focusAreas: [
      { id: '1', title: 'Regulatory Landscape', description: 'Applicable regulations overview' },
      { id: '2', title: 'Compliance Status', description: 'Current compliance assessment' },
      { id: '3', title: 'Risk Areas', description: 'High-risk compliance areas' },
      { id: '4', title: 'Reporting Requirements', description: 'Mandatory reporting obligations' },
      { id: '5', title: 'Action Plan', description: 'Compliance improvement plan' },
    ],
  },

  // ── Analytics & KPIs ──
  'financial-health-dashboard': {
    slug: 'financial-health-dashboard',
    name: 'Financial Health Dashboard',
    description: 'Key financial metrics dashboard',
    category: 'Analytics & KPIs',
    focusAreas: [
      { id: '1', title: 'Liquidity Metrics', description: 'Cash and liquidity indicators' },
      { id: '2', title: 'Profitability Metrics', description: 'Margin and return indicators' },
      { id: '3', title: 'Efficiency Metrics', description: 'Asset and operational efficiency' },
      { id: '4', title: 'Growth Metrics', description: 'Revenue and earnings growth rates' },
      { id: '5', title: 'Risk Metrics', description: 'Leverage and coverage ratios' },
    ],
  },
  'kpi-framework': {
    slug: 'kpi-framework',
    name: 'KPI Framework',
    description: 'Define financial KPIs',
    category: 'Analytics & KPIs',
    focusAreas: [
      { id: '1', title: 'Strategic KPIs', description: 'Top-level strategic metrics' },
      { id: '2', title: 'Operational KPIs', description: 'Day-to-day operational metrics' },
      { id: '3', title: 'Leading Indicators', description: 'Forward-looking predictive metrics' },
      { id: '4', title: 'Lagging Indicators', description: 'Historical performance metrics' },
      { id: '5', title: 'Benchmarks', description: 'Industry benchmark targets' },
    ],
  },
  'ratio-analysis': {
    slug: 'ratio-analysis',
    name: 'Ratio Analysis',
    description: 'Financial ratio calculations',
    category: 'Analytics & KPIs',
    focusAreas: [
      { id: '1', title: 'Liquidity Ratios', description: 'Current, quick, and cash ratios' },
      { id: '2', title: 'Profitability Ratios', description: 'ROE, ROA, and margin ratios' },
      { id: '3', title: 'Leverage Ratios', description: 'Debt-to-equity and coverage ratios' },
      { id: '4', title: 'Efficiency Ratios', description: 'Turnover and activity ratios' },
      { id: '5', title: 'Industry Comparison', description: 'Benchmark against industry peers' },
    ],
  },
  'trend-anomaly-detection': {
    slug: 'trend-anomaly-detection',
    name: 'Trend & Anomaly Detection',
    description: 'Identify trends and outliers',
    category: 'Analytics & KPIs',
    focusAreas: [
      { id: '1', title: 'Revenue Trends', description: 'Revenue growth and seasonality' },
      { id: '2', title: 'Expense Anomalies', description: 'Unusual expense patterns' },
      { id: '3', title: 'Cash Flow Patterns', description: 'Cash flow trend analysis' },
      { id: '4', title: 'Margin Drift', description: 'Margin erosion or improvement trends' },
      { id: '5', title: 'Alert Thresholds', description: 'Define monitoring thresholds' },
    ],
  },
  'financial-scorecard': {
    slug: 'financial-scorecard',
    name: 'Financial Scorecard',
    description: 'Balanced scorecard for finance',
    category: 'Analytics & KPIs',
    focusAreas: [
      { id: '1', title: 'Financial Perspective', description: 'Financial performance metrics' },
      { id: '2', title: 'Customer Perspective', description: 'Customer-related financial metrics' },
      { id: '3', title: 'Process Perspective', description: 'Operational efficiency metrics' },
      { id: '4', title: 'Growth Perspective', description: 'Learning and growth metrics' },
      { id: '5', title: 'Overall Score', description: 'Weighted balanced scorecard' },
    ],
  },
};

interface DataFile {
  id: string;
  name: string;
  type: 'csv' | 'xlsx' | 'pdf' | 'screenshot' | 'mcp';
  size: number;
  uploadedAt: Date;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  error?: string;
  preview?: Array<{ [key: string]: string }>;
  extractedText?: string;
  entity?: 'Tech Revival' | 'ReCommerce SA' | 'Combined';
}

interface FocusArea {
  id: string;
  title: string;
  description: string;
  selected: boolean;
}

interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedEffort: 'low' | 'medium' | 'high';
  suggestedDueDate: string;
  assignedTo?: string;
  selected: boolean;
  isMCPEligible?: boolean;
}

interface AnalysisResult {
  executiveSummary: string;
  healthScore: number;
  healthStatus: 'red' | 'amber' | 'green';
  keyFindings: Array<{ icon: string; title: string; description: string }>;
  detailedAnalysis: Array<{
    title: string;
    content: string;
    chart?: { type: 'bar' | 'line' | 'pie'; data: any[] };
  }>;
  recommendations: Array<{
    id: string;
    title: string;
    description: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
  }>;
  actionItems: Array<{
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'completed';
  }>;
  bookkeeperFeedback?: {
    reportQuality: 'good' | 'adequate' | 'needs-improvement';
    feedback: string;
    trainingNotes: string[];
  } | null;
}

export default function CFOFunctionPage() {
  const params = useParams();
  const functionSlug = params.function as string;
  const config = FUNCTION_CONFIGS[functionSlug];

  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Step 1 - Company Context
  const [companyContext, setCompanyContext] = useState<CompanyContextData>({
    companyId: 'tech-revival',
    companyName: 'Tech Revival',
    industry: 'Technology',
    primaryGoal: 'Cost Optimization',
    targetGeography: 'South Africa',
    additionalContext: 'We operate through two entities: Tech Revival (Pty) Ltd and ReCommerce SA (Pty) Ltd. Tech Revival is the primary trading entity.',
  });

  // Step 2 - Data Ingestion
  const [dataFiles, setDataFiles] = useState<DataFile[]>([]);
  const [pastedContent, setPastedContent] = useState('');
  const uploadedDataRef = useRef<string>('');

  // Step 3 - Focus Areas
  const [focusAreas, setFocusAreas] = useState<FocusArea[]>(
    (config?.focusAreas || []).map((area) => ({
      ...area,
      selected: false,
    }))
  );
  const [additionalFocus, setAdditionalFocus] = useState('');

  // Step 4 - Analysis Results (from Claude)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [savedAnalysisId, setSavedAnalysisId] = useState<string | null>(null);
  const [savedCompanyId, setSavedCompanyId] = useState<string | null>(null);

  // Step 5 - Action Items (generated from analysis)
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);

  if (!config) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 gap-4">
        <h1 className="text-2xl font-bold text-foreground">Function Not Found</h1>
        <p className="text-muted-foreground">The requested function does not exist.</p>
        <Link href="/cfo">
          <Button variant="outline" className="gap-2">
            <ChevronLeft className="w-4 h-4" />
            Back to CFO
          </Button>
        </Link>
      </div>
    );
  }

  const steps: WizardStep[] = [
    { id: 'company-context', title: 'Company Context', description: 'Tell us about your business', icon: '🏢' },
    { id: 'data-ingestion', title: 'Upload Data', description: 'Provide your financial data', icon: '📤' },
    { id: 'focus-areas', title: 'Focus Areas', description: 'What should we focus on?', icon: '🎯' },
    { id: 'analysis-results', title: 'Analysis Results', description: 'AI-powered insights', icon: '✨' },
    { id: 'action-items', title: 'Action Items', description: 'Next steps and tasks', icon: '📋' },
  ];

  const runAnalysis = async () => {
    setIsProcessing(true);
    setAnalysisError(null);

    try {
      // Gather uploaded data text with entity labels
      const fileParts = dataFiles
        .filter((f) => f.status === 'ready' && f.extractedText)
        .map((f) => {
          const entityLabel = f.entity ? ` [Entity: ${f.entity}]` : '';
          return `--- File: ${f.name}${entityLabel} ---\n${f.extractedText}`;
        });

      // Include pasted content if any
      if (pastedContent.trim()) {
        fileParts.push(`--- Pasted Content (Bookkeeper Notes / Email) ---\n${pastedContent}`);
      }

      const uploadedData = fileParts.join('\n\n');

      // Debug logging — helps trace data passing issues
      console.log(`[runAnalysis] ${fileParts.length} file(s) ready, uploadedData length: ${uploadedData.length} chars`);
      if (uploadedData.length > 0) {
        console.log(`[runAnalysis] First 300 chars:`, uploadedData.substring(0, 300));
      } else {
        console.warn('[runAnalysis] WARNING: uploadedData is EMPTY — no file data will be sent to Claude');
      }

      const selectedFocusAreas = focusAreas
        .filter((a) => a.selected)
        .map((a) => a.title);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          functionSlug: config.slug,
          functionName: config.name,
          category: config.category,
          companyContext: {
            companyName: companyContext.companyName,
            industry: companyContext.industry,
            primaryGoal: companyContext.primaryGoal,
            targetGeography: companyContext.targetGeography,
            additionalContext: companyContext.additionalContext,
          },
          uploadedData,
          focusAreas: selectedFocusAreas,
          additionalFocus,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Analysis failed');
      }

      setAnalysisResult(result.analysis);

      // Persist analysis to database
      try {
        // Ensure company exists
        const companyRes = await fetch('/api/companies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: companyContext.companyName,
            industry: companyContext.industry,
          }),
        });
        const companyData = await companyRes.json();
        const companyId = companyData.company?.id;
        if (companyId) {
          setSavedCompanyId(companyId);

          const analysisRes = await fetch('/api/analyses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              companyId,
              module: 'CFO',
              functionName: config.slug,
              title: `${config.name} — ${new Date().toLocaleDateString()}`,
              inputData: {
                companyContext,
                focusAreas: selectedFocusAreas,
                additionalFocus,
                fileCount: dataFiles.filter((f) => f.status === 'ready').length,
              },
              outputData: result.analysis,
              healthScore: result.analysis.healthStatus?.toUpperCase(),
              score: result.analysis.healthScore,
            }),
          });
          const analysisData = await analysisRes.json();
          if (analysisData.analysis?.id) {
            setSavedAnalysisId(analysisData.analysis.id);
          }
        }
      } catch (saveErr) {
        console.warn('Could not save analysis to database:', saveErr);
      }

      // Convert analysis action items to the format needed by StepActionItems
      if (result.analysis.actionItems) {
        const items: ActionItem[] = result.analysis.actionItems.map((item: any, idx: number) => ({
          id: item.id || String(idx + 1),
          title: item.title,
          description: item.description,
          priority: item.priority || 'medium',
          estimatedEffort: item.estimatedEffort || 'medium',
          suggestedDueDate: item.suggestedDueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          selected: true,
          isMCPEligible: false,
        }));
        setActionItems(items);
      }

      setCurrentStep(3);
    } catch (error: any) {
      console.error('Analysis failed:', error);
      setAnalysisError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 2) {
      // Run real Claude analysis
      runAnalysis();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    const selectedItems = actionItems.filter((item) => item.selected);
    if (selectedItems.length === 0) {
      alert('Please select at least one action item to create as a task.');
      return;
    }

    const companyId = savedCompanyId;
    if (!companyId) {
      alert('Tasks created! (Note: could not persist — no company ID)');
      return;
    }

    try {
      const effortMap: Record<string, string> = { low: 'QUICK', medium: 'MEDIUM', high: 'SIGNIFICANT' };
      const priorityMap: Record<string, string> = { critical: 'CRITICAL', high: 'HIGH', medium: 'MEDIUM', low: 'LOW' };

      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: selectedItems.map((item) => ({
            companyId,
            analysisId: savedAnalysisId || undefined,
            title: item.title,
            description: item.description,
            priority: priorityMap[item.priority] || 'MEDIUM',
            effort: effortMap[item.estimatedEffort] || 'MEDIUM',
            dueDate: item.suggestedDueDate,
            assignedToId: item.assignedTo || undefined,
          })),
        }),
      });

      alert(`✅ ${selectedItems.length} task${selectedItems.length > 1 ? 's' : ''} created! View them in the Tasks dashboard.`);
    } catch (err) {
      console.error('Error saving tasks:', err);
      alert('Tasks saved locally but could not persist to database.');
    }
  };

  const handleSaveDraft = () => {
    alert('Draft saved!');
  };

  // Allow proceeding from step 1 even without files (we'll do general analysis)
  const canProceed =
    currentStep === 0
      ? !!companyContext.companyName && !!companyContext.industry
      : currentStep === 1
        ? true // Allow proceeding without files - Claude will do general analysis
        : currentStep === 2
          ? focusAreas.some((a) => a.selected) || additionalFocus.includes('[JIM_GENERAL]')
          : true;

  return (
    <WizardContainer
      title={config.name}
      subtitle={config.description}
      steps={steps}
      currentStep={currentStep}
      onNext={handleNext}
      onBack={handleBack}
      onComplete={handleComplete}
      onSaveDraft={handleSaveDraft}
      isProcessing={isProcessing}
      canProceed={canProceed}
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/cfo" className="hover:text-foreground transition-colors">
          CFO
        </Link>
        <span>/</span>
        <Link href="/cfo" className="hover:text-foreground transition-colors">
          {config.category}
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">{config.name}</span>
      </div>

      {/* Analysis Error */}
      {analysisError && currentStep === 2 && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-900 dark:text-red-100 font-semibold">Analysis Error</p>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">{analysisError}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={runAnalysis}
            className="mt-3"
          >
            Try Again
          </Button>
        </div>
      )}

      {currentStep === 0 && (
        <StepCompanyContext
          data={companyContext}
          onDataChange={setCompanyContext}
          companyProfile={{
            name: companyContext.companyName,
            industry: companyContext.industry,
            website: undefined,
            logo: undefined,
          }}
        />
      )}

      {currentStep === 1 && (
        <StepDataIngestion
          data={{
            files: dataFiles,
            mcpConnections: [
              { id: '1', name: 'Xero Accounting', connected: false },
              { id: '2', name: 'QuickBooks', connected: false },
              { id: '3', name: 'Sage', connected: false },
            ],
            manualMetrics: { pastedContent },
          }}
          onDataChange={(data) => {
            setDataFiles(data.files);
            if (data.manualMetrics?.pastedContent !== undefined) {
              setPastedContent(data.manualMetrics.pastedContent);
            }
          }}
          functionType={functionSlug}
        />
      )}

      {currentStep === 2 && (
        <StepFocusAreas
          focusAreas={focusAreas}
          onFocusAreasChange={setFocusAreas}
          additionalFocus={additionalFocus}
          onAdditionalFocusChange={setAdditionalFocus}
        />
      )}

      {currentStep === 3 && (
        <StepAnalysisResults
          analysis={analysisResult || undefined}
          isLoading={isProcessing}
          onDownloadPDF={() => alert('PDF download coming soon')}
          onShare={() => alert('Share feature coming soon')}
          onRunAnother={() => {
            setAnalysisResult(null);
            setActionItems([]);
            setCurrentStep(0);
          }}
        />
      )}

      {currentStep === 4 && (
        <StepActionItems
          actionItems={actionItems}
          onActionItemsChange={setActionItems}
          onCreateSelected={() => handleComplete()}
        />
      )}
    </WizardContainer>
  );
}
