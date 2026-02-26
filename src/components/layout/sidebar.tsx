'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  BarChart3,
  TrendingUp,
  Users,
  PieChart,
  BookOpen,
  MessageSquare,
  Settings,
  Shield,
  ListTodo,
  AlertCircle,
  Bell,
  Zap,
  DollarSign,
  Target,
  FileText,
  TrendingDown,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  children?: NavItem[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const CMO_FUNCTIONS: NavSection[] = [
  {
    title: 'Advertising & Paid Media',
    items: [
      { label: 'Campaign Manager', href: '/cmo/campaigns', icon: <Zap size={18} /> },
      { label: 'Budget Allocation', href: '/cmo/budget', icon: <DollarSign size={18} /> },
      { label: 'Performance Metrics', href: '/cmo/metrics', icon: <BarChart3 size={18} /> },
    ],
  },
  {
    title: 'SEO & Organic',
    items: [
      { label: 'SEO Strategy', href: '/cmo/seo', icon: <TrendingUp size={18} /> },
      { label: 'Content Calendar', href: '/cmo/content', icon: <BookOpen size={18} /> },
      { label: 'Keyword Tracking', href: '/cmo/keywords', icon: <Target size={18} /> },
    ],
  },
  {
    title: 'Content & Social',
    items: [
      { label: 'Social Hub', href: '/cmo/social', icon: <MessageSquare size={18} /> },
      { label: 'Content Planning', href: '/cmo/content-planning', icon: <BookOpen size={18} /> },
      { label: 'Audience Insights', href: '/cmo/audience', icon: <Users size={18} /> },
    ],
  },
  {
    title: 'Brand & Strategy',
    items: [
      { label: 'Brand Health', href: '/cmo/brand', icon: <PieChart size={18} /> },
      { label: 'Competitive Analysis', href: '/cmo/competitive', icon: <TrendingDown size={18} /> },
      { label: 'Strategy Planning', href: '/cmo/strategy', icon: <FileText size={18} /> },
    ],
  },
  {
    title: 'Analytics & Reporting',
    items: [
      { label: 'Dashboard', href: '/cmo/analytics', icon: <BarChart3 size={18} /> },
      { label: 'Reports', href: '/cmo/reports', icon: <FileText size={18} /> },
      { label: 'Attribution', href: '/cmo/attribution', icon: <TrendingUp size={18} /> },
    ],
  },
  {
    title: 'Marketplace',
    items: [
      { label: 'Ad Networks', href: '/cmo/marketplace', icon: <Users size={18} /> },
      { label: 'Tools & Services', href: '/cmo/tools', icon: <Zap size={18} /> },
    ],
  },
];

const CFO_FUNCTIONS: NavSection[] = [
  {
    title: 'Core Financial Reporting',
    items: [
      { label: 'Financial Statements', href: '/cfo/statements', icon: <FileText size={18} /> },
      { label: 'Income Statement', href: '/cfo/income', icon: <TrendingUp size={18} /> },
      { label: 'Balance Sheet', href: '/cfo/balance', icon: <PieChart size={18} /> },
      { label: 'Cash Flow', href: '/cfo/cashflow', icon: <DollarSign size={18} /> },
    ],
  },
  {
    title: 'Planning & Forecasting',
    items: [
      { label: 'Budgeting', href: '/cfo/budget', icon: <Target size={18} /> },
      { label: 'Forecasts', href: '/cfo/forecasts', icon: <TrendingUp size={18} /> },
      { label: 'Scenario Planning', href: '/cfo/scenarios', icon: <BarChart3 size={18} /> },
    ],
  },
  {
    title: 'Cash & Treasury',
    items: [
      { label: 'Cash Position', href: '/cfo/cash', icon: <DollarSign size={18} /> },
      { label: 'Working Capital', href: '/cfo/working-capital', icon: <TrendingUp size={18} /> },
      { label: 'Debt Management', href: '/cfo/debt', icon: <AlertCircle size={18} /> },
    ],
  },
  {
    title: 'Profitability & Costing',
    items: [
      { label: 'Cost Analysis', href: '/cfo/costs', icon: <BarChart3 size={18} /> },
      { label: 'Margins', href: '/cfo/margins', icon: <PieChart size={18} /> },
      { label: 'Unit Economics', href: '/cfo/unit-economics', icon: <Target size={18} /> },
    ],
  },
  {
    title: 'Strategic Finance',
    items: [
      { label: 'M&A Analysis', href: '/cfo/ma', icon: <TrendingUp size={18} /> },
      { label: 'Investment Planning', href: '/cfo/investments', icon: <DollarSign size={18} /> },
      { label: 'Capital Allocation', href: '/cfo/capital', icon: <Zap size={18} /> },
    ],
  },
  {
    title: 'Compliance & Governance',
    items: [
      { label: 'Tax Planning', href: '/cfo/tax', icon: <FileText size={18} /> },
      { label: 'Audit Trail', href: '/cfo/audit', icon: <Shield size={18} /> },
      { label: 'Controls', href: '/cfo/controls', icon: <AlertCircle size={18} /> },
    ],
  },
  {
    title: 'Analytics & KPIs',
    items: [
      { label: 'Financial Dashboard', href: '/cfo/dashboard', icon: <BarChart3 size={18} /> },
      { label: 'KPI Tracking', href: '/cfo/kpis', icon: <Target size={18} /> },
      { label: 'Benchmarking', href: '/cfo/benchmarking', icon: <TrendingUp size={18} /> },
    ],
  },
];

const BOTTOM_MENU: NavItem[] = [
  { label: 'Tasks', href: '/tasks', icon: <ListTodo size={18} /> },
  { label: 'Tracking', href: '/tracking', icon: <BarChart3 size={18} /> },
  { label: 'Newsletters', href: '/newsletters', icon: <Bell size={18} /> },
  { label: 'Chat', href: '/chat', icon: <MessageSquare size={18} /> },
  { label: 'Settings', href: '/settings', icon: <Settings size={18} /> },
];

interface SidebarProps {
  userRole?: 'admin' | 'user';
  currentModule?: 'cmo' | 'cfo';
  onModuleChange?: (module: 'cmo' | 'cfo') => void;
}

export function Sidebar({
  userRole = 'user',
  currentModule = 'cmo',
  onModuleChange,
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [expandedSections, setExpandedSections] = useState<string[]>(['Advertising & Paid Media']);
  const pathname = usePathname();

  const functions = currentModule === 'cmo' ? CMO_FUNCTIONS : CFO_FUNCTIONS;

  const toggleSection = (title: string) => {
    setExpandedSections((prev) =>
      prev.includes(title) ? prev.filter((s) => s !== title) : [...prev, title]
    );
  };

  const isItemActive = (href: string) => {
    return pathname === href || pathname.startsWith(href);
  };

  const NavLink = ({ item }: { item: NavItem }) => (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200',
        isItemActive(item.href)
          ? 'bg-accent/10 text-accent border-l-2 border-accent'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      )}
    >
      {item.icon}
      <span className="flex-1">{item.label}</span>
      {item.badge && (
        <span className="inline-flex items-center justify-center rounded-full bg-danger px-2 py-1 text-xs font-semibold text-white">
          {item.badge}
        </span>
      )}
    </Link>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-4 z-40 rounded-lg p-2 text-muted-foreground hover:bg-muted md:hidden"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 flex flex-col bg-background border-r border-border transition-all duration-300 md:relative md:translate-x-0',
          isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'
        )}
        style={{ height: '100vh' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-border px-6 py-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
            <span className="font-bold text-white">VX</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">Virtual</span>
            <span className="text-xs text-muted-foreground">Executive</span>
          </div>
        </div>

        {/* Module Selector */}
        <div className="border-b border-border px-4 py-4">
          <div className="flex gap-2">
            <button
              onClick={() => onModuleChange?.('cmo')}
              className={cn(
                'flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors duration-200',
                currentModule === 'cmo'
                  ? 'bg-accent/10 text-accent border border-accent/20'
                  : 'bg-muted text-muted-foreground hover:text-foreground border border-border'
              )}
            >
              CMO
            </button>
            <button
              onClick={() => onModuleChange?.('cfo')}
              className={cn(
                'flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors duration-200',
                currentModule === 'cfo'
                  ? 'bg-accent/10 text-accent border border-accent/20'
                  : 'bg-muted text-muted-foreground hover:text-foreground border border-border'
              )}
            >
              CFO
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-4">
          {functions.map((section) => (
            <div key={section.title} className="mb-6">
              <button
                onClick={() => toggleSection(section.title)}
                className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                {section.title}
                <ChevronDown
                  size={16}
                  className={cn(
                    'transition-transform duration-200',
                    expandedSections.includes(section.title) ? 'rotate-180' : ''
                  )}
                />
              </button>
              {expandedSections.includes(section.title) && (
                <div className="mt-2 space-y-1">
                  {section.items.map((item) => (
                    <NavLink key={item.href} item={item} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Bottom Menu */}
        <div className="border-t border-border px-4 py-4 space-y-1">
          {BOTTOM_MENU.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
          {userRole === 'admin' && (
            <NavLink
              item={{
                label: 'Admin',
                href: '/admin',
                icon: <Shield size={18} />,
              }}
            />
          )}
        </div>
      </aside>
    </>
  );
}
