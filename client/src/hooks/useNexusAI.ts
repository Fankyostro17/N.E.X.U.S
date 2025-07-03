import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export interface NexusResponse {
  response: string;
  emotion: string;
  action?: string;
  systemCommandResult?: {
    success: boolean;
    result: string;
    error?: string;
  };
}

export interface NexusAIHook {
  sendMessage: (message: string, isVoice?: boolean) => void;
  isProcessing: boolean;
  error: string | null;
  lastResponse: NexusResponse | null;
}

export function useNexusAI(): NexusAIHook {
  const [lastResponse, setLastResponse] = useState<NexusResponse | null>(null);

  const conversationMutation = useMutation({
    mutationFn: async (data: { message: string; isVoiceActivated: boolean }) => {
      const response = await apiRequest('POST', '/api/nexus/conversation', data);
      return response.json();
    },
    onSuccess: (data: NexusResponse) => {
      setLastResponse(data);
    },
    onError: (error) => {
      console.error('N.E.X.U.S. conversation error:', error);
    }
  });

  const sendMessage = useCallback((message: string, isVoice = false) => {
    if (!message.trim()) return;
    
    conversationMutation.mutate({
      message,
      isVoiceActivated: isVoice
    });
  }, [conversationMutation]);

  return {
    sendMessage,
    isProcessing: conversationMutation.isPending,
    error: conversationMutation.error?.message || null,
    lastResponse
  };
}
