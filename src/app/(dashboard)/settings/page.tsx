'use client';

import React, { useState } from 'react';
import {
  User,
  Building2,
  PlugZap,
  Bell,
  CreditCard,
  Upload,
  Shield,
  Check,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'company', label: 'Company', icon: Building2 },
  { id: 'integrations', label: 'Integrations', icon: PlugZap },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'billing', label: 'Billing', icon: CreditCard },
];

const INTEGRATIONS = [
  {
    id: 'google-ads',
    name: 'Google Ads',
    description: 'Connect Google Ads for campaign performance data',
    status: 'CONNECTED',
    lastSync: new Date(Date.now() - 3600000),
  },
  {
    id: 'meta-ads',
    name: 'Meta Ads',
    description: 'Connect Facebook/Instagram ads',
    status: 'CONNECTED',
    lastSync: new Date(Date.now() - 7200000),
  },
  {
    id: 'xero',
    name: 'Xero',
    description: 'Connect Xero for financial data',
    status: 'CONNECTED',
    lastSync: new Date(Date.now() - 86400000),
  },
  {
    id: 'search-console',
    name: 'Google Search Console',
    description: 'Connect Search Console for SEO insights',
    status: 'DISCONNECTED',
    lastSync: null,
  },
  {
    id: 'analytics',
    name: 'Google Analytics',
    description: 'Connect GA4 for website analytics',
    status: 'CONNECTED',
    lastSync: new Date(Date.now() - 43200000),
  },
];

const NOTIFICATION_SETTINGS = [
  {
    id: 'briefing',
    label: 'Monday Morning Briefing',
    description: 'Weekly executive summary every Monday',
    enabled: true,
  },
  {
    id: 'analysis',
    label: 'Analysis Reminders',
    description: 'Notifications when new analyses are available',
    enabled: true,
  },
  {
    id: 'overdue',
    label: 'Task Overdue Alerts',
    description: 'Alert when tasks become overdue',
    enabled: true,
  },
  {
    id: 'alerts',
    label: 'Proactive Alerts',
    description: 'Health score and metric anomalies',
    enabled: true,
  },
  {
    id: 'newsletter',
    label: 'Newsletter Reminders',
    description: 'Remind when newsletter drafts are ready for review',
    enabled: false,
  },
];

const BILLING_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 'R 999/month',
    features: [
      'Up to 2 companies',
      '5 analyses/month',
      'Basic dashboards',
      'Email support',
    ],
    current: false,
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 'R 2,999/month',
    features: [
      'Up to 5 companies',
      'Unlimited analyses',
      'All dashboards',
      'Priority support',
      'Custom integrations',
    ],
    current: true,
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    price: 'Custom',
    features: [
      'Unlimited companies',
      'Advanced analytics',
      'Dedicated support',
      'Custom workflows',
      'SLA guarantee',
    ],
    current: false,
  },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [notifications, setNotifications] = useState(NOTIFICATION_SETTINGS);
  const [integrationStates, setIntegrationStates] = useState(
    INTEGRATIONS.map((i) => i.status),
  );

  const ProfileTab = () => (
    <div className="space-y-6">
      <Card className="p-6 bg-slate-800/50 border-slate-700/50">
        <h2 className="text-lg font-semibold text-slate-100 mb-6">
          Profile Settings
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Full Name
            </label>
            <Input
              defaultValue="Brad Thompson"
              className="bg-slate-700/50 border-slate-700 text-slate-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email
            </label>
            <Input
              type="email"
              defaultValue="brad@epicdeals.co.za"
              className="bg-slate-700/50 border-slate-700 text-slate-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Avatar
            </label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-lg font-semibold text-blue-400">
                BT
              </div>
              <Button variant="outline" className="border-slate-700">
                <Upload className="w-4 h-4 mr-2" />
                Upload Photo
              </Button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Change Password
            </label>
            <Button variant="outline" className="border-slate-700">
              <Shield className="w-4 h-4 mr-2" />
              Update Password
            </Button>
          </div>
          <div className="pt-4">
            <Button className="w-full">Save Changes</Button>
          </div>
        </div>
      </Card>
    </div>
  );

  const CompanyTab = () => (
    <div className="space-y-6">
      <Card className="p-6 bg-slate-800/50 border-slate-700/50">
        <h2 className="text-lg font-semibold text-slate-100 mb-6">
          Company Settings
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Company Name
            </label>
            <Input
              defaultValue="Epic Deals"
              className="bg-slate-700/50 border-slate-700 text-slate-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Industry
            </label>
            <Input
              defaultValue="E-commerce / Retail"
              className="bg-slate-700/50 border-slate-700 text-slate-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Currency
            </label>
            <select className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-700 text-slate-100">
              <option>ZAR (South African Rand)</option>
              <option>USD (US Dollar)</option>
              <option>EUR (Euro)</option>
              <option>GBP (British Pound)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Timezone
            </label>
            <select className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-700 text-slate-100">
              <option>Africa/Johannesburg (SAST)</option>
              <option>UTC</option>
              <option>Europe/London</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Logo
            </label>
            <Button variant="outline" className="border-slate-700">
              <Upload className="w-4 h-4 mr-2" />
              Upload Logo
            </Button>
          </div>
          <div className="pt-4">
            <Button className="w-full">Save Changes</Button>
          </div>
        </div>
      </Card>
    </div>
  );

  const IntegrationsTab = () => (
    <div className="space-y-6">
      <Card className="p-6 bg-slate-800/50 border-slate-700/50">
        <h2 className="text-lg font-semibold text-slate-100 mb-6">
          Connected Integrations
        </h2>
        <div className="space-y-4">
          {INTEGRATIONS.map((integration, idx) => (
            <div
              key={integration.id}
              className="flex items-start justify-between p-4 rounded-lg border border-slate-700/50 bg-slate-700/20"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-slate-100">
                  {integration.name}
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  {integration.description}
                </p>
                {integration.lastSync && (
                  <p className="text-xs text-slate-500 mt-2">
                    Last synced:{' '}
                    {integration.lastSync.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 ml-4">
                <Badge
                  className={
                    integration.status === 'CONNECTED'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }
                >
                  {integration.status === 'CONNECTED' ? (
                    <Check className="w-3 h-3 mr-1" />
                  ) : (
                    <X className="w-3 h-3 mr-1" />
                  )}
                  {integration.status}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-700 text-slate-300 whitespace-nowrap"
                >
                  {integration.status === 'CONNECTED'
                    ? 'Disconnect'
                    : 'Connect'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const NotificationsTab = () => (
    <div className="space-y-6">
      <Card className="p-6 bg-slate-800/50 border-slate-700/50">
        <h2 className="text-lg font-semibold text-slate-100 mb-6">
          Email Notifications
        </h2>
        <div className="space-y-4">
          {notifications.map((setting) => (
            <div
              key={setting.id}
              className="flex items-start justify-between p-4 rounded-lg border border-slate-700/50 bg-slate-700/20"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-slate-100">
                  {setting.label}
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  {setting.description}
                </p>
              </div>
              <Switch
                checked={setting.enabled}
                onCheckedChange={(checked) => {
                  setNotifications((prev) =>
                    prev.map((s) =>
                      s.id === setting.id ? { ...s, enabled: checked } : s,
                    ),
                  );
                }}
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const BillingTab = () => (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card className="p-6 bg-slate-800/50 border-slate-700/50">
        <h2 className="text-lg font-semibold text-slate-100 mb-4">
          Current Plan
        </h2>
        <div className="p-6 rounded-lg border-2 border-blue-500/50 bg-blue-500/10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-slate-100">Growth</h3>
              <p className="text-blue-400 mt-1">R 2,999/month</p>
            </div>
            <Badge className="bg-green-500/20 text-green-400">
              <Check className="w-3 h-3 mr-1" />
              Active
            </Badge>
          </div>
          <ul className="space-y-2 text-sm text-slate-300 mb-4">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              Up to 5 companies
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              Unlimited analyses
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              All dashboards
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              Priority support
            </li>
          </ul>
          <div className="text-sm text-slate-400">
            Renews on {new Date(Date.now() + 30 * 86400000).toLocaleDateString()}
          </div>
        </div>
      </Card>

      {/* Usage Stats */}
      <Card className="p-6 bg-slate-800/50 border-slate-700/50">
        <h2 className="text-lg font-semibold text-slate-100 mb-4">
          Plan Usage
        </h2>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-300">Companies Used</span>
              <span className="font-semibold text-slate-100">1 / 5</span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-2">
              <div
                style={{ width: '20%' }}
                className="h-full bg-blue-500 rounded-full"
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-300">Analyses This Month</span>
              <span className="font-semibold text-slate-100">
                Unlimited
              </span>
            </div>
            <div className="text-sm text-slate-500">
              You've run 24 analyses this month
            </div>
          </div>
        </div>
      </Card>

      {/* Other Plans */}
      <div>
        <h2 className="text-lg font-semibold text-slate-100 mb-4">
          Upgrade Options
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BILLING_PLANS.filter((p) => !p.current).map((plan) => (
            <Card
              key={plan.id}
              className="p-6 bg-slate-800/50 border-slate-700/50"
            >
              <h3 className="text-xl font-bold text-slate-100 mb-2">
                {plan.name}
              </h3>
              <p className="text-blue-400 font-semibold mb-4">{plan.price}</p>
              <ul className="space-y-2 text-sm text-slate-300 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                className="w-full border-slate-700"
              >
                Upgrade to {plan.name}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="pt-6">
        <h1 className="text-3xl font-bold text-slate-100">Settings</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap',
                activeTab === tab.id
                  ? 'text-blue-400 border-blue-500'
                  : 'text-slate-400 border-transparent hover:text-slate-300',
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'company' && <CompanyTab />}
        {activeTab === 'integrations' && <IntegrationsTab />}
        {activeTab === 'notifications' && <NotificationsTab />}
        {activeTab === 'billing' && <BillingTab />}
      </div>
    </div>
  );
}
