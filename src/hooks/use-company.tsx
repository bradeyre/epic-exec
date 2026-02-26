'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Company } from '@/types';

interface CompanyContextType {
  company: Company | null;
  companies: Company[];
  switchCompany: (companyId: string) => void;
  isLoading: boolean;
  error?: string;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

interface CompanyProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component for company selection context
 */
export function CompanyProvider({ children }: CompanyProviderProps) {
  const [company, setCompany] = useState<Company | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();

  // Fetch companies on mount
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/companies');

        if (!response.ok) {
          throw new Error('Failed to fetch companies');
        }

        const data = await response.json();
        setCompanies(data.companies || []);

        // Restore selected company from localStorage or use first company
        const savedCompanyId = localStorage.getItem('selectedCompanyId');
        let selectedCompany: Company | null = null;

        if (savedCompanyId && data.companies) {
          selectedCompany = data.companies.find((c: Company) => c.id === savedCompanyId) || null;
        }

        if (!selectedCompany && data.companies && data.companies.length > 0) {
          selectedCompany = data.companies[0];
        }

        if (selectedCompany) {
          setCompany(selectedCompany);
          localStorage.setItem('selectedCompanyId', selectedCompany.id);
        }

        setError(undefined);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An error occurred';
        setError(message);
        console.error('Failed to fetch companies:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const switchCompany = (companyId: string) => {
    const selectedCompany = companies.find((c) => c.id === companyId);
    if (selectedCompany) {
      setCompany(selectedCompany);
      localStorage.setItem('selectedCompanyId', companyId);
    }
  };

  const value: CompanyContextType = {
    company,
    companies,
    switchCompany,
    isLoading,
    error,
  };

  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
}

/**
 * Hook to access company context
 */
export function useCompany(): CompanyContextType {
  const context = useContext(CompanyContext);

  if (!context) {
    throw new Error('useCompany must be used within CompanyProvider');
  }

  return context;
}

/**
 * Hook to access just the current company
 */
export function useCurrentCompany(): Company | null {
  const { company } = useCompany();
  return company;
}

/**
 * Hook to access all companies
 */
export function useCompanies(): Company[] {
  const { companies } = useCompany();
  return companies;
}

/**
 * Hook to switch company
 */
export function useSwitchCompany(): (companyId: string) => void {
  const { switchCompany } = useCompany();
  return switchCompany;
}
