'use client';

import React, { useState } from 'react';
import {
  Search,
  Bell,
  LogOut,
  User,
  Settings,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Company {
  id: string;
  name: string;
  logo?: string;
}

interface TopBarProps {
  companies?: Company[];
  currentCompany?: Company;
  notificationCount?: number;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  onCompanyChange?: (companyId: string) => void;
  onSearch?: (query: string) => void;
  onNewAnalysis?: () => void;
}

export function TopBar({
  companies = [],
  currentCompany,
  notificationCount = 0,
  userName = 'User',
  userEmail = 'user@example.com',
  userAvatar,
  onCompanyChange,
  onSearch,
  onNewAnalysis,
}: TopBarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-4 px-6 py-4">
        {/* Left: Company Selector */}
        <div className="w-48">
          {companies.length > 0 && (
            <Select
              value={currentCompany?.id || ''}
              onValueChange={(value) => {
                onCompanyChange?.(value);
              }}
            >
              <SelectTrigger className="gap-2">
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Center: Search */}
        <div className="flex-1 flex justify-center">
          {searchOpen ? (
            <input
              type="text"
              placeholder="Search... (Cmd+K)"
              value={searchQuery}
              onChange={handleSearch}
              onKeyDown={handleKeyDown}
              onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
              autoFocus
              className={cn(
                'w-full max-w-md rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-200',
                'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background focus:border-transparent'
              )}
            />
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
            >
              <Search size={16} />
              <span className="hidden sm:inline">Search...</span>
              <span className="hidden sm:inline text-xs text-muted-foreground ml-auto">Cmd K</span>
            </button>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* New Analysis Button */}
          <Button
            size="sm"
            variant="default"
            onClick={onNewAnalysis}
            className="hidden sm:inline-flex"
          >
            + New Analysis
          </Button>

          {/* Notifications */}
          <div className="relative">
            <button className="relative rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
              <Bell size={20} />
              {notificationCount > 0 && (
                <span className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-xs font-semibold text-white">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <button className="flex items-center gap-2 rounded-lg px-2 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userAvatar} alt={userName} />
                <AvatarFallback className="text-xs font-semibold">
                  {getInitials(userName)}
                </AvatarFallback>
              </Avatar>
              <ChevronDown size={16} className="hidden sm:block" />
            </button>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex flex-col gap-1">
                <span className="text-sm font-semibold">{userName}</span>
                <span className="text-xs text-muted-foreground">{userEmail}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center gap-2">
                <User size={16} />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2">
                <Settings size={16} />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center gap-2 text-danger">
                <LogOut size={16} />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
