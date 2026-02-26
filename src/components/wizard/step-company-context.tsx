'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export interface CompanyContextData {
  companyId: string;
  companyName: string;
  industry: string;
  primaryGoal: string;
  targetGeography: string;
  additionalContext: string;
}

interface StepCompanyContextProps {
  data: CompanyContextData;
  onDataChange: (data: CompanyContextData) => void;
  companyProfile?: {
    name: string;
    industry: string;
    website?: string;
    logo?: string;
  };
}

const PRIMARY_GOALS = [
  'Just tell me what you see — full CFO review',
  'We\'re running out of cash — help me fix it',
  'I want to grow revenue to R100m+',
  'Margins are too thin — where\'s the money going?',
  'Getting ready to raise funding / bring in investors',
  'We need to cut costs without killing growth',
  'I don\'t trust my numbers — help me make sense of them',
  'Planning for next quarter / next year',
];

const INDUSTRIES = [
  'E-commerce / Online Retail',
  'Retail / Wholesale',
  'Tech / SaaS',
  'Professional Services / Consulting',
  'Manufacturing / Production',
  'Construction / Property',
  'Hospitality / Tourism',
  'Agriculture / Agri-processing',
  'Healthcare / Medical',
  'Financial Services / Fintech',
  'Logistics / Transport',
  'Media / Creative / Agency',
  'Education / Training',
  'Mining / Resources',
  'Other',
];

const GEOGRAPHIES = [
  'South Africa',
  'Sub-Saharan Africa',
  'Africa (Continent)',
  'Global',
];

export function StepCompanyContext({
  data,
  onDataChange,
  companyProfile,
}: StepCompanyContextProps) {
  const handleFieldChange = (field: keyof CompanyContextData, value: string) => {
    onDataChange({
      ...data,
      [field]: value,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Form */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Company Information</h3>

          {/* Company Name */}
          <div className="mb-6">
            <Label htmlFor="company-name" className="text-sm font-medium">
              Company Name
            </Label>
            <Select value={data.companyName} onValueChange={(v) => handleFieldChange('companyName', v)}>
              <SelectTrigger id="company-name" className="mt-2">
                <SelectValue placeholder="Select company..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tech Revival">Tech Revival (Pty) Ltd</SelectItem>
                <SelectItem value="ReCommerce SA">ReCommerce SA (Pty) Ltd</SelectItem>
                <SelectItem value="Combined">Combined — Both Entities</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              Select the company entity for this analysis
            </p>
          </div>

          {/* Industry */}
          <div className="mb-6">
            <Label htmlFor="industry" className="text-sm font-medium">
              Industry / Niche
            </Label>
            <Select value={data.industry} onValueChange={(v) => handleFieldChange('industry', v)}>
              <SelectTrigger id="industry" className="mt-2">
                <SelectValue placeholder="Select your industry..." />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Primary Goal */}
          <div className="mb-6">
            <Label htmlFor="goal" className="text-sm font-medium">
              What&apos;s keeping you up at night?
            </Label>
            <Select
              value={data.primaryGoal}
              onValueChange={(v) => handleFieldChange('primaryGoal', v)}
            >
              <SelectTrigger id="goal" className="mt-2">
                <SelectValue placeholder="Pick what matters most right now..." />
              </SelectTrigger>
              <SelectContent>
                {PRIMARY_GOALS.map((goal) => (
                  <SelectItem key={goal} value={goal}>
                    {goal}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Target Geography */}
          <div className="mb-6">
            <Label htmlFor="geography" className="text-sm font-medium">
              Target Geography
            </Label>
            <Select
              value={data.targetGeography}
              onValueChange={(v) => handleFieldChange('targetGeography', v)}
            >
              <SelectTrigger id="geography" className="mt-2">
                <SelectValue placeholder="Select target geography..." />
              </SelectTrigger>
              <SelectContent>
                {GEOGRAPHIES.map((geo) => (
                  <SelectItem key={geo} value={geo}>
                    {geo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Additional Context */}
          <div>
            <Label htmlFor="context" className="text-sm font-medium">
              Additional Context
            </Label>
            <Textarea
              id="context"
              value={data.additionalContext}
              onChange={(e) => handleFieldChange('additionalContext', e.target.value)}
              placeholder="e.g. We just lost a big client, we're hiring 5 people next month, stock issues in Dec..."
              className="mt-2 min-h-28"
            />
            <p className="text-xs text-muted-foreground mt-2">
              The more Jim knows, the better the advice. Think: recent wins, problems, big decisions coming up.
            </p>
          </div>
        </Card>
      </div>

      {/* Sidebar - Company Profile Summary */}
      {companyProfile && (
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Company Profile</h3>

            {companyProfile.logo && (
              <div className="mb-4 flex items-center justify-center h-16 bg-muted rounded-lg">
                <img
                  src={companyProfile.logo}
                  alt={companyProfile.name}
                  className="max-h-14 max-w-full"
                />
              </div>
            )}

            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Company</p>
                <p className="text-sm font-medium text-foreground">{companyProfile.name}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Industry</p>
                <p className="text-sm font-medium text-foreground">{companyProfile.industry}</p>
              </div>

              {companyProfile.website && (
                <div>
                  <p className="text-xs text-muted-foreground">Website</p>
                  <a
                    href={companyProfile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-accent hover:underline"
                  >
                    Visit →
                  </a>
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t">
              <Badge variant="outline" className="text-xs">
                Information from company profile
              </Badge>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
