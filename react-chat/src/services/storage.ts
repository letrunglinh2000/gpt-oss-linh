import { Chat, ChatConfig } from '../types';

const STORAGE_KEYS = {
  CHATS: 'lm-studio-chats-v2',
  CONFIG: 'lm-studio-config-v2',
  CURRENT_CHAT: 'lm-studio-current-chat-v2',
} as const;

export class StorageService {
  static getChats(): Record<string, Chat> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CHATS);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  static saveChats(chats: Record<string, Chat>): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
    } catch (error) {
      console.error('Failed to save chats:', error);
    }
  }

  static getConfig(): ChatConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CONFIG);
      return stored ? JSON.parse(stored) : {
        model: '',
        temperature: 0.7,
        systemPrompt: 'You are a helpful assistant.',
      };
    } catch {
      return {
        model: '',
        temperature: 0.7,
        systemPrompt: 'You are a helpful assistant.',
      };
    }
  }

  static saveConfig(config: ChatConfig): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  }

  static getCurrentChatId(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.CURRENT_CHAT);
    } catch {
      return null;
    }
  }

  static setCurrentChatId(chatId: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_CHAT, chatId);
    } catch (error) {
      console.error('Failed to save current chat ID:', error);
    }
  }

  static exportChats(chats: Record<string, Chat>): void {
    const dataStr = JSON.stringify(chats, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `lm-studio-chats-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  static async importChats(file: File): Promise<Record<string, Chat>> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          resolve(imported);
        } catch (error) {
          reject(new Error('Invalid file format'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }
}
