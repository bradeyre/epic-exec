'use client';

/**
 * Re-export everything from the unified company context.
 * This file exists so that existing imports from '@/hooks/use-company' continue to work.
 */
export {
  CompanyProvider,
  useCompany,
  useCurrentCompany,
  useSwitchCompany,
  useCompanies,
} from '@/contexts/company-context';
export type { CompanyInfo } from '@/contexts/company-context';
