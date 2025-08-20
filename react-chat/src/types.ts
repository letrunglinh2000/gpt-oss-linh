import { ReactNode } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  meta?: {
    title?: string;
    subtitle?: string;
  };
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatConfig {
  model: string;
  temperature: number;
  systemPrompt: string;
}

export interface Column {
  key: string;
  header: string;
  width?: number;
  align?: 'left' | 'right' | 'center';
  formatter?: (value: any, row: any) => ReactNode;
}

export interface TableData {
  columns: Column[];
  rows: Array<Record<string, any>>;
}
