'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export interface WizardContainerProps {
  steps: WizardStep[];
  currentStep: number;
  onNext: () => void;
  onBack: () => void;
  onComplete: () => void;
  children: React.ReactNode;
  isProcessing?: boolean;
  canProceed?: boolean;
  title: string;
  subtitle?: string;
  onSaveDraft?: () => void;
}

export function WizardContainer({
  steps,
  currentStep,
  onNext,
  onBack,
  onComplete,
  children,
  isProcessing = false,
  canProceed = true,
  title,
  subtitle,
  onSaveDraft,
}: WizardContainerProps) {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="border-b bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                {/* Step Circle */}
                <div className="flex flex-col items-center flex-1 sm:flex-none sm:mr-8 last:mr-0">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all',
                      index < currentStep
                        ? 'bg-green-600 text-white'
                        : index === currentStep
                          ? 'bg-accent text-white ring-2 ring-accent ring-offset-2'
                          : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {index < currentStep ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-foreground mt-2 text-center line-clamp-2">
                    {step.title}
                  </p>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'hidden sm:block h-1 flex-grow mx-4 rounded-full transition-all',
                      index < currentStep - 1
                        ? 'bg-green-600'
                        : index < currentStep
                          ? 'bg-accent'
                          : 'bg-muted'
                    )}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isProcessing ? (
            <Card className="p-12 flex flex-col items-center justify-center min-h-96">
              <Loader2 className="w-12 h-12 text-accent animate-spin mb-4" />
              <p className="text-lg font-semibold text-foreground">Jim is analyzing...</p>
              <p className="text-sm text-muted-foreground mt-2">
                This may take a minute. Please don't close this window.
              </p>
            </Card>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-8 duration-300">
              {children}
            </div>
          )}
        </div>
      </div>

      {/* Footer Navigation — sticky so it's always visible */}
      <div className="sticky bottom-0 z-20 border-t bg-card shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {onSaveDraft && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSaveDraft}
                  disabled={isProcessing}
                >
                  Save Draft
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={onBack}
                disabled={isFirstStep || isProcessing}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>

              {isLastStep ? (
                <Button
                  onClick={onComplete}
                  disabled={!canProceed || isProcessing}
                  className="gap-2"
                >
                  <span>Complete</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={onNext}
                  disabled={!canProceed || isProcessing}
                  className="gap-2"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
