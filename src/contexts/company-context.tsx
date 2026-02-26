'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

// Minimal Company shape for the context — matches what /api/companies returns
export interface CompanyInfo {
  id: string;
  name: string;
  industry?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  currency?: string;
  countryCode?: string;
  slug?: string;
}

interface CompanyContextType {
  company: CompanyInfo | null;
  companies: CompanyInfo[];
  switchCompany: (companyId: string) => void;
  isLoading: boolean;
  error?: string;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

/**
 * Provider component that fetches companies from the API and stores
 * the user's selected company in localStorage.
 */
export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [companies, setCompanies] = useState<CompanyInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();

  // Fetch companies on mount
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/companies');
        if (!response.ok) throw new Error('Failed to fetch companies');

        const data = await response.json();
        const companyList: CompanyInfo[] = data.companies || data.data || [];
        setCompanies(companyList);

        // Restore selection from localStorage or pick first company
        const savedId =
          typeof window !== 'undefined'
            ? localStorage.getItem('selectedCompanyId')
            : null;

        let selected: CompanyInfo | null = null;
        if (savedId) {
          selected = companyList.find((c) => c.id === savedId) || null;
        }
        if (!selected && companyList.length > 0) {
          selected = companyList[0];
        }

        if (selected) {
          setCompany(selected);
          localStorage.setItem('selectedCompanyId', selected.id);
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
    const selected = companies.find((c) => c.id === companyId);
    if (selected) {
      setCompany(selected);
      localStorage.setItem('selectedCompanyId', companyId);
    }
  };

  return (
    <CompanyContext.Provider
      value={{ company, companies, switchCompany, isLoading, error }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

/**
 * Access the full company context (company, companies list, switcher, loading state)
 */
export function useCompany(): CompanyContextType {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany must be used within CompanyProvider');
  }
  return context;
}

/**
 * Convenience hook — returns just the currently selected company
 */
export function useCurrentCompany(): CompanyInfo | null {
  const { company } = useCompany();
  return company;
}

/**
 * Convenience hook — returns just the company switcher function
 */
export function useSwitchCompany(): (companyId: string) => void {
  const { switchCompany } = useCompany();
  return switchCompany;
}

/**
 * Convenience hook — returns all companies
 */
export function useCompanies(): CompanyInfo[] {
  const { companies } = useCompany();
  return companies;
}
