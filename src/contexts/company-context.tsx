'use client';

import React, { createContext, useContext, useState } from 'react';

interface Company {
  id: string;
  name: string;
  industry: string;
  website?: string;
  logo?: string;
}

interface CompanyContextType {
  company: Company | null;
  setCompany: (company: Company) => void;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [company, setCompany] = useState<Company | null>({
    id: 'company-1',
    name: 'Acme Corporation',
    industry: 'Technology',
    website: 'https://example.com',
  });

  return (
    <CompanyContext.Provider value={{ company, setCompany }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany must be used within CompanyProvider');
  }
  return context;
}
