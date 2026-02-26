'use client';

import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Upload,
  Image,
  Database,
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  Copy,
  MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DataFile {
  id: string;
  name: string;
  type: 'csv' | 'xlsx' | 'pdf' | 'screenshot' | 'mcp';
  size: number;
  uploadedAt: Date;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  error?: string;
  preview?: Array<{ [key: string]: string }>;
  extractedText?: string;
  entity?: 'Tech Revival' | 'ReCommerce SA' | 'Combined';
}

interface StepDataIngestionProps {
  data: {
    files: DataFile[];
    mcpConnections: Array<{ id: string; name: string; connected: boolean }>;
    manualMetrics: { [key: string]: string };
  };
  onDataChange: (data: any) => void;
  functionType?: string;
}

const MANUAL_METRIC_FIELDS: { [key: string]: string[] } = {
  'google-ads-audit': ['campaign_name', 'clicks', 'impressions', 'spend', 'conversions'],
  'facebook-ads-audit': ['campaign_id', 'reach', 'impressions', 'clicks', 'spend'],
  'revenue-forecasting': ['month', 'revenue', 'growth_rate'],
  'pl-analysis': ['revenue', 'cogs', 'operating_expenses', 'tax_expense'],
};

export function StepDataIngestion({
  data,
  onDataChange,
  functionType = 'google-ads-audit',
}: StepDataIngestionProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = [...(e.dataTransfer?.files || [])];
    handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    setUploading(true);
    setUploadProgress(0);

    // Track accumulated files locally to avoid stale closure issues
    let accumulatedFiles = [...data.files];

    for (const file of files) {
      const validTypes = [
        'text/csv',
        'text/plain',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'application/pdf',
        'image/jpeg',
        'image/png',
      ];

      // Also allow by extension for files with generic MIME types
      const ext = file.name.toLowerCase().split('.').pop() || '';
      const validExtensions = ['csv', 'xlsx', 'xls', 'pdf', 'txt', 'doc', 'docx', 'jpg', 'jpeg', 'png'];
      if (!validTypes.includes(file.type) && !validExtensions.includes(ext)) {
        continue;
      }

      const fileType = (ext === 'csv' || file.type.includes('csv'))
        ? 'csv'
        : (ext === 'xlsx' || ext === 'xls' || file.type.includes('sheet'))
          ? 'xlsx'
          : (ext === 'pdf' || file.type.includes('pdf'))
            ? 'pdf'
            : (ext === 'txt' || ext === 'doc' || ext === 'docx' || file.type.includes('text/plain') || file.type.includes('word'))
              ? 'csv' // treat text/doc as csv type so the parser reads it as text
              : 'screenshot';

      const fileId = Math.random().toString(36).substring(2);
      const newFile: DataFile = {
        id: fileId,
        name: file.name,
        type: fileType,
        size: file.size,
        uploadedAt: new Date(),
        status: 'uploading',
      };

      // Add file in uploading state
      accumulatedFiles = [...accumulatedFiles, newFile];
      onDataChange({ ...data, files: accumulatedFiles });

      // Show upload progress
      for (let i = 0; i <= 60; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        setUploadProgress(i);
      }

      // Update to processing state
      accumulatedFiles = accumulatedFiles.map((f) =>
        f.id === fileId ? { ...f, status: 'processing' as const } : f
      );
      onDataChange({ ...data, files: accumulatedFiles });
      setUploadProgress(80);

      try {
        // Send file to parse API
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/parse-file', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();
        setUploadProgress(100);

        if (result.success) {
          accumulatedFiles = accumulatedFiles.map((f) =>
            f.id === fileId
              ? {
                  ...f,
                  status: 'ready' as const,
                  preview: result.preview,
                  extractedText: result.extractedText,
                }
              : f
          );
          onDataChange({ ...data, files: accumulatedFiles });
        } else {
          accumulatedFiles = accumulatedFiles.map((f) =>
            f.id === fileId
              ? { ...f, status: 'error' as const, error: result.error || 'Failed to parse file' }
              : f
          );
          onDataChange({ ...data, files: accumulatedFiles });
        }
      } catch (error: any) {
        accumulatedFiles = accumulatedFiles.map((f) =>
          f.id === fileId
            ? { ...f, status: 'error' as const, error: error.message || 'Upload failed' }
            : f
        );
        onDataChange({ ...data, files: accumulatedFiles });
      }
    }

    setUploading(false);
    setUploadProgress(0);
  };

  const removeFile = (fileId: string) => {
    onDataChange({
      ...data,
      files: data.files.filter((f) => f.id !== fileId),
    });
  };

  const manualFields = MANUAL_METRIC_FIELDS[functionType] || [];

  return (
    <Tabs defaultValue="upload" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="upload" className="gap-2">
          <Upload className="w-4 h-4 hidden sm:inline" />
          <span className="hidden sm:inline">File Upload</span>
          <span className="sm:hidden">Upload</span>
        </TabsTrigger>
        <TabsTrigger value="screenshot" className="gap-2">
          <Image className="w-4 h-4 hidden sm:inline" />
          <span className="hidden sm:inline">Screenshots</span>
          <span className="sm:hidden">Screens</span>
        </TabsTrigger>
        <TabsTrigger value="mcp" className="gap-2">
          <Database className="w-4 h-4 hidden sm:inline" />
          <span className="hidden sm:inline">Live Connection</span>
          <span className="sm:hidden">Live</span>
        </TabsTrigger>
        <TabsTrigger value="manual" className="gap-2">
          <FileText className="w-4 h-4 hidden sm:inline" />
          <span className="hidden sm:inline">Paste Text</span>
          <span className="sm:hidden">Paste</span>
        </TabsTrigger>
      </TabsList>

      {/* File Upload Tab */}
      <TabsContent value="upload" className="space-y-6">
        <Card className="p-12">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? 'border-accent bg-accent/5' : 'border-muted-foreground/25'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Drag and drop your files here
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Supports CSV, Excel, PDF, Word, and text files up to 10MB
            </p>

            <Button
              variant="outline"
              type="button"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              Choose File
            </Button>
            <input
              id="file-upload"
              type="file"
              multiple
              accept=".csv,.xlsx,.xls,.pdf,.txt,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(e) => {
                handleFiles(Array.from(e.currentTarget.files || []));
                e.currentTarget.value = '';
              }}
              className="hidden"
            />
          </div>

          {/* Upload Guide */}
          <div className="mt-8 pt-8 border-t">
            <h4 className="font-semibold text-foreground mb-4">What to upload:</h4>
            <div className="space-y-3 text-sm">
              <div className="flex gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p>
                  <span className="font-medium">Financial Statements:</span> P&L, Balance Sheet,
                  Cash Flow statements (CSV, Excel, or PDF)
                </p>
              </div>
              <div className="flex gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p>
                  <span className="font-medium">Bookkeeper Reports:</span> Monthly reports, notes,
                  or summaries from your bookkeeper (PDF, Word, or text)
                </p>
              </div>
              <div className="flex gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p>
                  <span className="font-medium">Management Accounts:</span> Trial balance, aged
                  debtors/creditors, VAT reports
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Uploaded Files List */}
        {data.files.length > 0 && (
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Uploaded Files</h3>
            <div className="space-y-4">
              {data.files.map((file) => (
                <div key={file.id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {file.type.toUpperCase()}
                      </Badge>
                    </div>

                    {/* Entity tag for multi-entity support */}
                    {file.status === 'ready' && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-muted-foreground">Entity:</span>
                        <select
                          className="text-xs bg-background border border-border rounded px-2 py-1"
                          value={file.entity || ''}
                          onChange={(e) => {
                            const updatedFiles = data.files.map((f) =>
                              f.id === file.id ? { ...f, entity: e.target.value as DataFile['entity'] } : f
                            );
                            onDataChange({ ...data, files: updatedFiles });
                          }}
                        >
                          <option value="">Auto-detect</option>
                          <option value="Tech Revival">Tech Revival</option>
                          <option value="ReCommerce SA">ReCommerce SA</option>
                          <option value="Combined">Combined</option>
                        </select>
                      </div>
                    )}

                    {file.status === 'uploading' && (
                      <div className="space-y-2">
                        <Progress value={uploadProgress} className="h-2" />
                        <p className="text-xs text-muted-foreground">Uploading...</p>
                      </div>
                    )}

                    {file.status === 'processing' && (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-accent" />
                        <p className="text-xs text-muted-foreground">Processing file...</p>
                      </div>
                    )}

                    {file.status === 'ready' && (
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Ready to analyze
                      </p>
                    )}

                    {file.status === 'error' && (
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {file.error}
                      </p>
                    )}

                    {file.preview && (
                      <div className="mt-4 overflow-x-auto">
                        <table className="w-full text-xs border-collapse">
                          <thead>
                            <tr className="border-b">
                              {Object.keys(file.preview[0]).map((key) => (
                                <th key={key} className="text-left p-2 text-muted-foreground">
                                  {key}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {file.preview.slice(0, 2).map((row, idx) => (
                              <tr key={idx} className="border-b">
                                {Object.values(row).map((val, cidx) => (
                                  <td key={cidx} className="p-2">
                                    {val}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {file.preview.length > 2 && (
                          <p className="text-xs text-muted-foreground mt-2">
                            ... and {file.preview.length - 2} more rows
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => removeFile(file.id)}>
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </Card>
        )}
      </TabsContent>

      {/* Screenshots Tab */}
      <TabsContent value="screenshot" className="space-y-6">
        <Card className="p-12">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? 'border-accent bg-accent/5' : 'border-muted-foreground/25'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Image className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Upload screenshots or images
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              PNG, JPG, or other image formats. Perfect for dashboard or report screenshots.
            </p>

            <Button
              variant="outline"
              type="button"
              onClick={() => document.getElementById('screenshot-upload')?.click()}
            >
              Choose Images
            </Button>
            <input
              id="screenshot-upload"
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => {
                handleFiles(Array.from(e.currentTarget.files || []));
                e.currentTarget.value = '';
              }}
              className="hidden"
            />
          </div>

          <div className="mt-8 pt-8 border-t">
            <h4 className="font-semibold text-foreground mb-4">Example of good screenshot:</h4>
            <div className="bg-muted rounded-lg p-6 aspect-video flex items-center justify-center">
              <p className="text-muted-foreground text-sm">Screenshot showing data tables or charts</p>
            </div>
          </div>
        </Card>
      </TabsContent>

      {/* Live Connection Tab */}
      <TabsContent value="mcp" className="space-y-6">
        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4">Connected Platforms</h3>
          <div className="space-y-3">
            {data.mcpConnections.map((connection) => (
              <div
                key={connection.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <p className="font-medium text-foreground">{connection.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {connection.connected ? 'Connected' : 'Not connected'}
                  </p>
                </div>
                {connection.connected ? (
                  <Button size="sm" onClick={() => alert('Pull data from ' + connection.name)}>
                    Pull Data
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => alert('Setup ' + connection.name)}
                  >
                    Connect
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            More integrations coming soon. Contact support to request your platform.
          </p>
        </Card>
      </TabsContent>

      {/* Manual Entry / Paste Tab */}
      <TabsContent value="manual" className="space-y-6">
        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-2">Paste Data or Notes</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Paste financial data, bookkeeper notes, or email content directly below.
          </p>
          <textarea
            className="w-full min-h-64 bg-background border border-border rounded-md p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-y"
            placeholder={"Paste your bookkeeper's email, P&L data, notes, or any financial information here...\n\nExample:\nHi,\n\nPlease find below the P&L for Tech Revival for January 2025:\n\nRevenue: R230,000\nCost of Sales: R92,000\nGross Profit: R138,000\n..."}
            value={data.manualMetrics['pastedContent'] || ''}
            onChange={(e) =>
              onDataChange({
                ...data,
                manualMetrics: {
                  ...data.manualMetrics,
                  pastedContent: e.target.value,
                },
              })
            }
          />
          {data.manualMetrics['pastedContent'] && (
            <p className="text-xs text-muted-foreground mt-2">
              {data.manualMetrics['pastedContent'].length.toLocaleString()} characters pasted
            </p>
          )}

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              You can paste emails, WhatsApp messages, or any text from your bookkeeper. The AI will extract the financial data and provide analysis along with feedback on the bookkeeper&apos;s reporting.
            </p>
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
