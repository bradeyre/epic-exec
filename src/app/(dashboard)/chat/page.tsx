'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send,
  MessageCircle,
  Loader,
  HelpCircle,
  Loader2,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useCurrentCompany } from '@/contexts/company-context';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ---------------------------------------------------------------------------
// Suggested questions
// ---------------------------------------------------------------------------

const SUGGESTED_QUESTIONS = [
  'How is our business doing overall?',
  'What are the most urgent tasks I should focus on?',
  'Summarize our recent analyses',
  'What should we do to improve cash flow?',
];

// ---------------------------------------------------------------------------
// Chat Page
// ---------------------------------------------------------------------------

export default function ChatPage() {
  const company = useCurrentCompany();
  const companyId = company?.id || null;
  const companyName = company?.name || '';
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 2. Load chat history
  const loadHistory = useCallback(async () => {
    if (!companyId) return;
    try {
      setLoadingHistory(true);
      const res = await fetch(`/api/chat?companyId=${companyId}`);
      const data = await res.json();
      if (data.success && data.messages) {
        setMessages(
          data.messages.map((m: { id: string; role: string; content: string; createdAt: string }) => ({
            id: m.id,
            role: m.role as 'user' | 'assistant',
            content: m.content,
            timestamp: new Date(m.createdAt),
          })),
        );
      }
    } catch (err) {
      console.error('Failed to load chat history', err);
    } finally {
      setLoadingHistory(false);
    }
  }, [companyId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // 3. Send message
  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText || !companyId) return;

    // Add user message optimistically
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText, companyId }),
      });

      const data = await res.json();

      if (data.success && data.message) {
        const assistantMessage: Message = {
          id: data.message.id,
          role: 'assistant',
          content: data.message.content,
          timestamp: new Date(data.message.createdAt),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        // Show error as assistant message
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: 'assistant',
            content: `Sorry, I encountered an error: ${data.error || 'Unknown error'}. Please try again.`,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (err) {
      console.error('Failed to send message', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I couldn\'t connect to the server. Please check your connection and try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // New chat — clear messages (history remains in DB)
  const handleNewChat = () => {
    setMessages([]);
  };

  // Show welcome message if no history
  const showWelcome = messages.length === 0 && !loadingHistory;

  return (
    <div className="flex h-[calc(100vh-120px)] gap-6 pb-12">
      {/* Sidebar */}
      <div className="w-64 border-r border-slate-700 pr-6 py-6 flex flex-col">
        <Button className="w-full gap-2 mb-6" onClick={handleNewChat}>
          <MessageCircle className="w-4 h-4" />
          New Chat
        </Button>

        <div className="flex-1" />

        {/* Context Info */}
        <Card className="p-3 bg-slate-800/50 border-slate-700/50">
          <div className="text-xs text-slate-400 mb-2 font-medium">Context</div>
          <div className="text-xs text-slate-500 space-y-1">
            <div>Company: {companyName || 'Loading...'}</div>
            <div>AI: Jim (CFO Advisor)</div>
            <div>Messages: {messages.length}</div>
          </div>
        </Card>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col pt-6">
        {/* Loading history */}
        {loadingHistory && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto" />
              <p className="text-slate-400 text-sm">Loading chat history...</p>
            </div>
          </div>
        )}

        {/* Welcome state */}
        {showWelcome && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-center max-w-md mb-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">J</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-100 mb-2">Chat with Jim</h2>
              <p className="text-slate-400">
                Your virtual CFO. Jim knows your business — recent analyses, open tasks, and goals.
                Ask anything about your financial performance or strategy.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-lg w-full">
              {SUGGESTED_QUESTIONS.map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(question)}
                  className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 text-slate-300 hover:text-slate-100 transition-colors text-sm text-left"
                >
                  <HelpCircle className="w-3 h-3 mb-1 inline mr-2 text-blue-400" />
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {!loadingHistory && messages.length > 0 && (
          <div className="flex-1 overflow-y-auto mb-6 space-y-4 pr-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-2xl rounded-lg p-4',
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-800/50 border border-slate-700/50 text-slate-100',
                  )}
                >
                  {msg.role === 'assistant' ? (
                    <div className="text-sm whitespace-pre-wrap prose prose-invert prose-sm max-w-none">
                      {msg.content.replace(/\[CONTEXT:\s*[^\]]+\]/g, '').trim()}
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  )}

                  <span className="text-xs opacity-50 mt-2 block">
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800/50 border border-slate-700/50 text-slate-100 rounded-lg p-4 flex items-center gap-2">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Jim is thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input Area — always visible */}
        {!loadingHistory && (
          <div className="flex gap-3">
            <Input
              placeholder="Ask Jim about your business..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={isLoading || !companyId}
              className="flex-1 bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500"
            />
            <Button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputValue.trim() || !companyId}
              className="gap-2"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
