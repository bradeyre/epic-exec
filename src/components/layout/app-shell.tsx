'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Menu,
  X,
  LogOut,
  Settings,
  BarChart3,
  DollarSign,
  Home,
  ChevronDown,
  CheckSquare,
  MessageCircle,
  Target,
  FileText,
  Building2,
  ChevronsUpDown,
  Check,
  Loader2,
  Plus,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useCompany } from '@/contexts/company-context';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { company, companies, switchCompany, isLoading: companiesLoading } = useCompany();

  // Add-company dialog state
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyIndustry, setNewCompanyIndustry] = useState('');
  const [addingCompany, setAddingCompany] = useState(false);

  const handleAddCompany = async () => {
    if (!newCompanyName.trim()) return;
    setAddingCompany(true);
    try {
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCompanyName.trim(),
          industry: newCompanyIndustry.trim() || 'General',
        }),
      });
      const data = await res.json();
      if (data.success && data.company) {
        // Refresh the page so the CompanyProvider re-fetches companies
        setShowAddCompany(false);
        setNewCompanyName('');
        setNewCompanyIndustry('');
        window.location.reload();
      }
    } catch (err) {
      console.error('Failed to add company:', err);
    } finally {
      setAddingCompany(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('vx-token');
    router.push('/login');
  };

  // Paths that belong to the CFO section
  const cfoSubPaths = ['/cfo', '/analyses', '/tasks', '/goals', '/chat'];
  const isCfoSection = cfoSubPaths.some((p) => pathname.startsWith(p));

  const navItems = [
    {
      label: 'Dashboard',
      href: '/cfo',
      icon: Home,
    },
    {
      label: 'CMO',
      href: '/cmo',
      icon: BarChart3,
    },
    {
      label: 'CFO',
      href: '/cfo',
      icon: DollarSign,
      // CFO section is "active" when on any CFO-related page
      isOpen: isCfoSection,
      submenu: [
        { label: 'New Analysis', href: '/cfo', icon: DollarSign },
        { label: 'Past Analyses', href: '/analyses', icon: FileText },
        { label: 'Tasks', href: '/tasks', icon: CheckSquare },
        { label: 'Goals', href: '/goals', icon: Target },
        { label: 'Chat with Jim', href: '/chat', icon: MessageCircle },
      ],
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: Settings,
    },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:static lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b">
            <Link href="/" className="flex items-center gap-3">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-accent">
                <span className="text-lg font-bold text-white">VX</span>
              </div>
              <div>
                <p className="font-bold text-foreground">Virtual Executive</p>
                <p className="text-xs text-muted-foreground">Executive Intelligence</p>
              </div>
            </Link>
          </div>

          {/* Company Selector */}
          <div className="px-4 py-3 border-b">
            {companiesLoading ? (
              <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left">
                    <Building2 className="w-4 h-4 text-accent flex-shrink-0" />
                    <span className="text-sm font-medium text-foreground truncate flex-1">
                      {company?.name || 'Select company'}
                    </span>
                    <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 z-50">
                  {companies.map((c) => (
                    <DropdownMenuItem
                      key={c.id}
                      onClick={() => switchCompany(c.id)}
                      className="flex items-center gap-2"
                    >
                      {c.id === company?.id ? (
                        <Check className="w-4 h-4 text-accent" />
                      ) : (
                        <div className="w-4 h-4" />
                      )}
                      <span className="truncate">{c.name}</span>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowAddCompany(true)}
                    className="flex items-center gap-2 text-accent"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Company</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
            {navItems.map((item) => {
              const isItemActive = item.isOpen ?? pathname.startsWith(item.href);
              const hasSubmenu = item.submenu && item.submenu.length > 0;

              return (
                <div key={item.label}>
                  {/* Top-level nav item */}
                  <Link href={item.href}>
                    <button
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-left ${
                        isItemActive && !hasSubmenu
                          ? 'bg-accent text-white'
                          : isItemActive && hasSubmenu
                            ? 'bg-accent/10 text-accent font-semibold'
                            : 'text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                      {hasSubmenu && (
                        <ChevronDown
                          className={`w-4 h-4 ml-auto transition-transform ${
                            isItemActive ? 'rotate-0' : '-rotate-90'
                          }`}
                        />
                      )}
                    </button>
                  </Link>

                  {/* Sub-items */}
                  {hasSubmenu && isItemActive && (
                    <div className="ml-3 pl-3 border-l border-border/50 space-y-0.5 mt-1 mb-2">
                      {item.submenu!.map((subitem) => {
                        // Exact match for /cfo (New Analysis) so it doesn't match /cfo/pl-analysis
                        const isSubActive =
                          subitem.href === '/cfo'
                            ? pathname === '/cfo'
                            : pathname.startsWith(subitem.href);

                        return (
                          <Link key={subitem.label} href={subitem.href}>
                            <button
                              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                                isSubActive
                                  ? 'bg-accent text-white font-medium'
                                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                              }`}
                            >
                              {subitem.icon && <subitem.icon className="w-4 h-4" />}
                              <span>{subitem.label}</span>
                            </button>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t space-y-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground hover:text-foreground"
                >
                  <Settings className="w-5 h-5 mr-3" />
                  <span className="flex-1 text-left">Account</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 z-50">
                <DropdownMenuItem disabled>
                  <p className="text-xs text-muted-foreground">user@example.com</p>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/settings')}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/settings')}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/settings')}>
                  Billing
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-card border-b px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
          >
            {sidebarOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-sm font-bold">
                    A
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem disabled>
                  <p className="text-xs text-muted-foreground">user@example.com</p>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/settings')}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Add Company Dialog */}
      {showAddCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowAddCompany(false)}
          />
          <div className="relative bg-card border border-border rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">
              Add New Company
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  placeholder="e.g. Acme Trading"
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                  Industry
                </label>
                <input
                  type="text"
                  value={newCompanyIndustry}
                  onChange={(e) => setNewCompanyIndustry(e.target.value)}
                  placeholder="e.g. E-commerce / Retail"
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="ghost"
                onClick={() => setShowAddCompany(false)}
                disabled={addingCompany}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddCompany}
                disabled={!newCompanyName.trim() || addingCompany}
              >
                {addingCompany ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Company'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
