'use client';

import { useState, useCallback } from 'react';
import { AnalysisResult } from '@/types';

interface AnalysisProgress {
  stage: 'idle' | 'preparing' | 'analyzing' | 'processing' | 'complete';
  percentComplete: number;
  message?: string;
}

interface AnalysisError {
  code: string;
  message: string;
}

interface UseAnalysisReturn {
  runAnalysis: (params: RunAnalysisParams) => Promise<AnalysisResult | null>;
  result: AnalysisResult | null;
  isLoading: boolean;
  error: AnalysisError | null;
  progress: AnalysisProgress;
  cancel: () => void;
  reset: () => void;
}

interface RunAnalysisParams {
  companyId: string;
  functionName: string;
  module: 'CMO' | 'CFO';
  data?: Record<string, any>;
  focusAreas?: string[];
  model?: 'fast' | 'standard' | 'deep';
  autoSave?: boolean;
}

/**
 * Hook for running analyses with streaming and auto-save support
 */
export function useAnalysis(): UseAnalysisReturn {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AnalysisError | null>(null);
  const [progress, setProgress] = useState<AnalysisProgress>({
    stage: 'idle',
    percentComplete: 0,
  });

  let abortController: AbortController | null = null;

  const cancel = useCallback(() => {
    if (abortController) {
      abortController.abort();
      abortController = null;
      setIsLoading(false);
      setProgress({ stage: 'idle', percentComplete: 0 });
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setProgress({ stage: 'idle', percentComplete: 0 });
    setIsLoading(false);
  }, []);

  const runAnalysis = useCallback(
    async (params: RunAnalysisParams): Promise<AnalysisResult | null> => {
      const {
        companyId,
        functionName,
        module,
        data = {},
        focusAreas = [],
        model = 'standard',
        autoSave = true,
      } = params;

      // Reset previous state
      setResult(null);
      setError(null);
      setIsLoading(true);
      setProgress({ stage: 'preparing', percentComplete: 10, message: 'Preparing analysis...' });

      // Create abort controller for this request
      abortController = new AbortController();

      try {
        // Call API to start analysis
        setProgress({ stage: 'analyzing', percentComplete: 30, message: 'Running analysis...' });

        const response = await fetch('/api/analyses/run', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            companyId,
            functionName,
            module,
            data,
            focusAreas,
            model,
            stream: true,
          }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Analysis failed');
        }

        // Handle streaming response
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('Failed to read response stream');
        }

        const decoder = new TextDecoder();
        let buffer = '';
        let analysisData: AnalysisResult | null = null;

        setProgress({ stage: 'processing', percentComplete: 50, message: 'Processing results...' });

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Parse streaming data (should be newline-delimited JSON)
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer

          for (const line of lines) {
            if (!line) continue;

            try {
              const parsed = JSON.parse(line);

              if (parsed.type === 'progress') {
                setProgress({
                  stage: 'processing',
                  percentComplete: parsed.progress || 50,
                  message: parsed.message,
                });
              } else if (parsed.type === 'result') {
                analysisData = parsed.data;
                setProgress({ stage: 'processing', percentComplete: 85 });
              }
            } catch {
              // Skip invalid JSON lines
            }
          }
        }

        // Final parsing of remaining buffer
        if (buffer) {
          try {
            const parsed = JSON.parse(buffer);
            if (parsed.type === 'result') {
              analysisData = parsed.data;
            }
          } catch {
            // Skip final invalid JSON
          }
        }

        if (!analysisData) {
          throw new Error('No analysis result received');
        }

        // Auto-save if enabled
        if (autoSave) {
          setProgress({ stage: 'processing', percentComplete: 90, message: 'Saving results...' });

          try {
            const saveResponse = await fetch('/api/analyses', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                companyId,
                functionName,
                module,
                data: analysisData,
              }),
              signal: abortController.signal,
            });

            if (!saveResponse.ok) {
              console.error('Failed to save analysis');
            } else {
              const saved = await saveResponse.json();
              analysisData.id = saved.id;
            }
          } catch (saveError) {
            console.error('Save error:', saveError);
            // Don't fail the analysis if save fails
          }
        }

        // Update state
        setResult(analysisData);
        setError(null);
        setProgress({ stage: 'complete', percentComplete: 100 });

        return analysisData;
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          // Request was cancelled
          setProgress({ stage: 'idle', percentComplete: 0 });
          return null;
        }

        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        const errorCode = err instanceof Error ? 'ANALYSIS_ERROR' : 'UNKNOWN_ERROR';

        setError({
          code: errorCode,
          message: errorMessage,
        });

        setProgress({ stage: 'idle', percentComplete: 0 });
        return null;
      } finally {
        setIsLoading(false);
        abortController = null;
      }
    },
    [],
  );

  return {
    runAnalysis,
    result,
    isLoading,
    error,
    progress,
    cancel,
    reset,
  };
}

/**
 * Hook for running multiple analyses in sequence
 */
export function useBatchAnalysis(): {
  runBatch: (analyses: RunAnalysisParams[]) => Promise<AnalysisResult[]>;
  results: AnalysisResult[];
  isLoading: boolean;
  error: AnalysisError | null;
  progress: { current: number; total: number };
} {
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AnalysisError | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const { runAnalysis } = useAnalysis();

  const runBatch = useCallback(
    async (analyses: RunAnalysisParams[]): Promise<AnalysisResult[]> => {
      setResults([]);
      setError(null);
      setIsLoading(true);
      setProgress({ current: 0, total: analyses.length });

      const batchResults: AnalysisResult[] = [];

      try {
        for (let i = 0; i < analyses.length; i++) {
          const result = await runAnalysis(analyses[i]);
          if (result) {
            batchResults.push(result);
          }
          setProgress({ current: i + 1, total: analyses.length });
        }

        setResults(batchResults);
        return batchResults;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Batch analysis failed';
        setError({
          code: 'BATCH_ERROR',
          message: errorMessage,
        });
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [runAnalysis],
  );

  return {
    runBatch,
    results,
    isLoading,
    error,
    progress,
  };
}

/**
 * Hook for running a single analysis with caching
 */
export function useCachedAnalysis(
  companyId: string,
  functionName: string,
  module: 'CMO' | 'CFO',
  cacheTime: number = 5 * 60 * 1000, // 5 minutes default
): UseAnalysisReturn & { isCached: boolean } {
  const analysisHook = useAnalysis();
  const [isCached, setIsCached] = useState(false);

  const runAnalysis = useCallback(
    async (params: RunAnalysisParams): Promise<AnalysisResult | null> => {
      // Check cache
      const cacheKey = `analysis_${companyId}_${functionName}`;
      const cached = localStorage.getItem(cacheKey);

      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached);
          const age = Date.now() - timestamp;

          if (age < cacheTime) {
            setIsCached(true);
            return data;
          }
        } catch {
          // Invalid cache, continue with new analysis
        }
      }

      setIsCached(false);

      // Run new analysis
      const result = await analysisHook.runAnalysis(params);

      if (result) {
        // Cache result
        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            data: result,
            timestamp: Date.now(),
          }),
        );
      }

      return result;
    },
    [companyId, functionName, cacheTime, analysisHook],
  );

  return {
    ...analysisHook,
    runAnalysis,
    isCached,
  };
}
