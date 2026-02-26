'use client';

import React, { useState } from 'react';
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

// Function configurations
const FUNCTION_CONFIGS: { [key: string]: FunctionConfig } = {
  'google-ads-audit': {
    slug: 'google-ads-audit',
    name: 'Google Ads Audit',
    description: 'Comprehensive analysis of your Google Ads campaigns',
    category: 'Advertising & Paid Media',
    focusAreas: [
      { id: '1', title: 'Campaign Performance', description: 'Analyze campaign-level metrics' },
      { id: '2', title: 'Ad Group Efficiency', description: 'Review ad group performance' },
      { id: '3', title: 'Keyword Quality', description: 'Assess keyword relevance and quality' },
      { id: '4', title: 'Budget Allocation', description: 'Optimize budget distribution' },
      { id: '5', title: 'Conversion Tracking', description: 'Review conversion setup' },
      { id: '6', title: 'Landing Page Quality', description: 'Analyze landing page experience' },
    ],
  },
  'facebook-ads-audit': {
    slug: 'facebook-ads-audit',
    name: 'Facebook Ads Audit',
    description: 'Performance review and optimization recommendations',
    category: 'Advertising & Paid Media',
    focusAreas: [
      { id: '1', title: 'Ad Account Health', description: 'Overall account status' },
      { id: '2', title: 'Campaign Structure', description: 'Campaign organization' },
      { id: '3', title: 'Audience Targeting', description: 'Audience segment analysis' },
      { id: '4', title: 'Creative Performance', description: 'Ad creative effectiveness' },
      { id: '5', title: 'Bidding Strategy', description: 'Bid optimization review' },
      { id: '6', title: 'Attribution Setup', description: 'Conversion tracking review' },
    ],
  },
  'revenue-forecasting': {
    slug: 'revenue-forecasting',
    name: 'Revenue Forecasting',
    description: 'Project future revenue based on trends',
    category: 'Planning & Forecasting',
    focusAreas: [
      { id: '1', title: 'Historical Trends', description: 'Analyze past performance' },
      { id: '2', title: 'Seasonal Patterns', description: 'Identify seasonal variations' },
      { id: '3', title: 'Growth Drivers', description: 'Key growth factors' },
      { id: '4', title: 'Risk Factors', description: 'Potential risks to forecast' },
      { id: '5', title: 'Market Conditions', description: 'External market factors' },
    ],
  },
  'seo-audit': {
    slug: 'seo-audit',
    name: 'SEO Audit',
    description: 'Technical and on-page SEO review',
    category: 'SEO & Organic',
    focusAreas: [
      { id: '1', title: 'Technical SEO', description: 'Site speed, structure, crawlability' },
      { id: '2', title: 'On-Page Optimization', description: 'Content and metadata' },
      { id: '3', title: 'Backlink Profile', description: 'Link quality and authority' },
      { id: '4', title: 'Content Quality', description: 'Content relevance and coverage' },
      { id: '5', title: 'User Experience', description: 'Mobile friendliness, UX signals' },
      { id: '6', title: 'Competitive Analysis', description: 'Competitor benchmarking' },
    ],
  },
  'brand-strategy': {
    slug: 'brand-strategy',
    name: 'Brand Strategy',
    description: 'Develop brand positioning',
    category: 'Brand & Strategy',
    focusAreas: [
      { id: '1', title: 'Market Positioning', description: 'Brand position in market' },
      { id: '2', title: 'Target Audience', description: 'Customer segments and personas' },
      { id: '3', title: 'Value Proposition', description: 'Unique value communication' },
      { id: '4', title: 'Brand Voice', description: 'Tone and messaging guidelines' },
      { id: '5', title: 'Visual Identity', description: 'Design system consistency' },
      { id: '6', title: 'Competitor Differentiation', description: 'How you stand out' },
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

export default function CMOFunctionPage() {
  const params = useParams();
  const functionSlug = params.function as string;
  const config = FUNCTION_CONFIGS[functionSlug];

  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Step 1 - Company Context
  const [companyContext, setCompanyContext] = useState<CompanyContextData>({
    companyId: 'company-1',
    companyName: 'Acme Corporation',
    industry: 'Technology',
    primaryGoal: 'Lead Generation',
    targetGeography: 'South Africa',
    additionalContext: '',
  });

  // Step 2 - Data Ingestion
  const [dataFiles, setDataFiles] = useState<DataFile[]>([]);

  // Step 3 - Focus Areas
  const [focusAreas, setFocusAreas] = useState<FocusArea[]>(
    (config?.focusAreas || []).map((area) => ({
      ...area,
      selected: false,
    }))
  );
  const [additionalFocus, setAdditionalFocus] = useState('');

  // Step 4 - Action Items
  const [actionItems, setActionItems] = useState<ActionItem[]>([
    {
      id: '1',
      title: 'Review Campaign Settings',
      description: 'Audit current campaign configurations',
      priority: 'high',
      estimatedEffort: 'medium',
      suggestedDueDate: '2025-03-01',
      selected: true,
      isMCPEligible: true,
    },
    {
      id: '2',
      title: 'Update Bid Strategy',
      description: 'Implement recommended bid changes',
      priority: 'critical',
      estimatedEffort: 'high',
      suggestedDueDate: '2025-03-05',
      selected: true,
    },
    {
      id: '3',
      title: 'Consolidate Audiences',
      description: 'Merge overlapping audience segments',
      priority: 'medium',
      estimatedEffort: 'medium',
      suggestedDueDate: '2025-03-10',
      selected: false,
    },
  ]);

  if (!config) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 gap-4">
        <h1 className="text-2xl font-bold text-foreground">Function Not Found</h1>
        <p className="text-muted-foreground">The requested function does not exist.</p>
        <Link href="/cmo">
          <Button variant="outline" className="gap-2">
            <ChevronLeft className="w-4 h-4" />
            Back to CMO
          </Button>
        </Link>
      </div>
    );
  }

  const steps: WizardStep[] = [
    {
      id: 'company-context',
      title: 'Company Context',
      description: 'Tell us about your business',
      icon: '🏢',
    },
    {
      id: 'data-ingestion',
      title: 'Upload Data',
      description: 'Provide your data for analysis',
      icon: '📤',
    },
    {
      id: 'focus-areas',
      title: 'Focus Areas',
      description: 'What should we focus on?',
      icon: '🎯',
    },
    {
      id: 'analysis-results',
      title: 'Analysis Results',
      description: 'AI-powered insights',
      icon: '✨',
    },
    {
      id: 'action-items',
      title: 'Action Items',
      description: 'Next steps and tasks',
      icon: '📋',
    },
  ];

  const handleNext = () => {
    if (currentStep === 2) {
      // Before moving to results, start processing
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        setCurrentStep(currentStep + 1);
      }, 3000);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Tasks created successfully
    alert('Tasks created successfully!');
  };

  const handleSaveDraft = () => {
    alert('Draft saved!');
  };

  const canProceed =
    currentStep === 0
      ? !!companyContext.companyName && !!companyContext.industry
      : currentStep === 1
        ? dataFiles.length > 0 || Object.values(companyContext).some((v) => v)
        : currentStep === 2
          ? focusAreas.some((a) => a.selected)
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
        <Link href="/cmo" className="hover:text-foreground transition-colors">
          CMO
        </Link>
        <span>/</span>
        <Link
          href="/cmo"
          className="hover:text-foreground transition-colors"
        >
          {config.category}
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">{config.name}</span>
      </div>

      {currentStep === 0 && (
        <StepCompanyContext
          data={companyContext}
          onDataChange={setCompanyContext}
          companyProfile={{
            name: companyContext.companyName,
            industry: companyContext.industry,
            website: 'https://example.com',
            logo: undefined,
          }}
        />
      )}

      {currentStep === 1 && (
        <StepDataIngestion
          data={{
            files: dataFiles,
            mcpConnections: [
              { id: '1', name: 'Google Analytics 4', connected: true },
              { id: '2', name: 'Google Ads', connected: false },
              { id: '3', name: 'Shopify', connected: false },
            ],
            manualMetrics: {},
          }}
          onDataChange={(data) => setDataFiles(data.files)}
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
          isLoading={isProcessing}
          onDownloadPDF={() => alert('PDF downloaded')}
          onShare={() => alert('Analysis shared')}
          onRunAnother={() => setCurrentStep(0)}
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
