import React, { useState, useEffect, useRef } from 'react';
import { Plus, Settings, Download, Upload, Trash2, Send, Bot, User, Menu, X } from 'lucide-react';
import { Chat, ChatConfig, Message } from './types';
import { StorageService } from './services/storage';
import { LMStudioAPI } from './services/api';
import { MarkdownRenderer } from './components/MarkdownRenderer';
import SquidGameBackground from './components/SquidGameBackground';
import { clsx } from 'clsx';

const App: React.FC = () => {
  const [chats, setChats] = useState<Record<string, Chat>>({});
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [config, setConfig] = useState<ChatConfig>({
    model: '',
    temperature: 0.7,
    systemPrompt: 'You are a helpful assistant.',
  });
  const [userInput, setUserInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const api = new LMStudioAPI();

  // Load data on mount
  useEffect(() => {
    const loadedChats = StorageService.getChats();
    const loadedConfig = StorageService.getConfig();
    const currentId = StorageService.getCurrentChatId();

    setChats(loadedChats);
    setConfig(loadedConfig);

    if (currentId && loadedChats[currentId]) {
      setCurrentChatId(currentId);
    } else if (Object.keys(loadedChats).length > 0) {
      const firstChatId = Object.keys(loadedChats)[0];
      setCurrentChatId(firstChatId);
      StorageService.setCurrentChatId(firstChatId);
    } else {
      createNewChat();
    }
  }, []);

  // Scroll to bottom function with throttling for performance
  const scrollToBottom = (immediate = false) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: immediate ? 'auto' : 'smooth',
        block: 'end'
      });
    }
  };

  // Auto-scroll to bottom when chats change
  useEffect(() => {
    scrollToBottom();
  }, [chats, currentChatId]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [userInput]);

  const createNewChat = () => {
    const chatId = Date.now().toString();
    const newChat: Chat = {
      id: chatId,
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedChats = { ...chats, [chatId]: newChat };
    setChats(updatedChats);
    setCurrentChatId(chatId);
    StorageService.saveChats(updatedChats);
    StorageService.setCurrentChatId(chatId);
  };

  const selectChat = (chatId: string) => {
    setCurrentChatId(chatId);
    StorageService.setCurrentChatId(chatId);
  };

  const clearCurrentChat = () => {
    if (!currentChatId) return;

    const updatedChat = {
      ...chats[currentChatId],
      messages: [],
      title: 'New Chat',
      updatedAt: new Date().toISOString(),
    };

    const updatedChats = { ...chats, [currentChatId]: updatedChat };
    setChats(updatedChats);
    StorageService.saveChats(updatedChats);
  };

  const deleteCurrentChat = () => {
    if (!currentChatId) return;

    const updatedChats = { ...chats };
    delete updatedChats[currentChatId];
    
    // If there are other chats, switch to the first one
    const remainingChatIds = Object.keys(updatedChats);
    if (remainingChatIds.length > 0) {
      const firstChatId = remainingChatIds[0];
      setCurrentChatId(firstChatId);
      StorageService.setCurrentChatId(firstChatId);
      setChats(updatedChats);
      StorageService.saveChats(updatedChats);
    } else {
      // If no chats left, create a new one
      setChats({});
      StorageService.saveChats({});
      createNewChat();
    }
  };

  const sendMessage = async () => {
    if (!userInput.trim() || !config.model.trim() || isStreaming || !currentChatId) return;

    const currentChat = chats[currentChatId];
    if (!currentChat) return;

    setError(null);

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userInput.trim(),
      timestamp: new Date().toISOString(),
    };

    // Update chat title if it's the first message
    const updatedTitle = currentChat.messages.length === 0 ? userInput.slice(0, 50) : currentChat.title;

    const updatedChat = {
      ...currentChat,
      title: updatedTitle,
      messages: [...currentChat.messages, userMessage],
      updatedAt: new Date().toISOString(),
    };

    const updatedChats = { ...chats, [currentChatId]: updatedChat };
    setChats(updatedChats);
    StorageService.saveChats(updatedChats);

    setUserInput('');
    setIsStreaming(true);

    // Scroll to show user message immediately
    setTimeout(() => scrollToBottom(true), 50);

    try {
      // Prepare messages for API
      const apiMessages = [];
      if (config.systemPrompt.trim()) {
        apiMessages.push({ role: 'system', content: config.systemPrompt });
      }
      apiMessages.push(...updatedChat.messages.map(m => ({ role: m.role, content: m.content })));

      // Create assistant message placeholder
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
      };

      const chatWithAssistant = {
        ...updatedChat,
        messages: [...updatedChat.messages, assistantMessage],
        updatedAt: new Date().toISOString(),
      };

      const chatsWithAssistant = { ...updatedChats, [currentChatId]: chatWithAssistant };
      setChats(chatsWithAssistant);

      // Stream response
      let fullContent = '';
      let scrollCounter = 0;
      
      for await (const chunk of api.streamChatCompletion({
        model: config.model,
        messages: apiMessages,
        temperature: config.temperature,
        stream: true,
      })) {
        fullContent += chunk;
        
        // Update assistant message content
        const updatedAssistantMessage = { ...assistantMessage, content: fullContent };
        const updatedChatMessages = [...updatedChat.messages, updatedAssistantMessage];
        const finalUpdatedChat = {
          ...updatedChat,
          messages: updatedChatMessages,
          updatedAt: new Date().toISOString(),
        };

        const finalUpdatedChats = { ...updatedChats, [currentChatId]: finalUpdatedChat };
        setChats(finalUpdatedChats);
        
        // Scroll to bottom frequently during streaming for better UX
        scrollCounter++;
        if (scrollCounter % 2 === 0) { // Every 2nd chunk for responsive scrolling
          requestAnimationFrame(() => scrollToBottom(true));
        }
      }

      // Save final state
      const finalChats = { ...chats };
      if (currentChatId && finalChats[currentChatId]) {
        finalChats[currentChatId].messages = [...updatedChat.messages, { ...assistantMessage, content: fullContent }];
        finalChats[currentChatId].updatedAt = new Date().toISOString();
        StorageService.saveChats(finalChats);
      }

      // Final scroll to ensure we're at the bottom
      requestAnimationFrame(() => scrollToBottom(true));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const exportChats = () => {
    StorageService.exportChats(chats);
  };

  const importChats = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const importedChats = await StorageService.importChats(file);
      const mergedChats = { ...chats, ...importedChats };
      setChats(mergedChats);
      StorageService.saveChats(mergedChats);
      
      // Load first imported chat
      const firstImportedId = Object.keys(importedChats)[0];
      if (firstImportedId) {
        setCurrentChatId(firstImportedId);
        StorageService.setCurrentChatId(firstImportedId);
      }
    } catch (err) {
      setError('Failed to import chats: Invalid file format');
    }
    
    // Reset file input
    event.target.value = '';
  };

  const currentChat = currentChatId ? chats[currentChatId] : null;
  const chatList = Object.values(chats).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return (
    <div className="flex h-screen relative overflow-hidden">
      {/* Squid Game 3D Background */}
      <SquidGameBackground />
      
      {/* Floating background orbs for ambiance */}
      <div className="floating-orb w-64 h-64 top-10 left-10 opacity-20" style={{ animationDelay: '0s' }} />
      <div className="floating-orb w-48 h-48 top-1/2 right-20 opacity-15" style={{ animationDelay: '2s' }} />
      <div className="floating-orb w-32 h-32 bottom-20 left-1/3 opacity-25" style={{ animationDelay: '4s' }} />
      
      {/* Floating sidebar toggle when hidden */}
      {!sidebarVisible && (
        <button
          onClick={() => setSidebarVisible(true)}
          className="fixed top-6 left-6 z-50 glass-button p-3 rounded-2xl focus-ring glass-glow-blue hover:scale-105 transition-transform duration-200"
          title="Show sidebar"
        >
          <Menu className="w-5 h-5 glass-text" />
        </button>
      )}
      
      {/* Sidebar */}
      {sidebarVisible && (
        <div className="w-80 glass-sidebar flex flex-col transition-all duration-300">
          {/* Sidebar Header */}
        <div className="p-6 border-b border-white/10">
          <button
            onClick={createNewChat}
            className="w-full flex items-center gap-3 px-6 py-3 glass-button rounded-2xl focus-ring glass-glow-blue glass-text font-medium"
          >
            <Plus className="w-5 h-5" />
            New Chat
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {chatList.map((chat) => (
            <button
              key={chat.id}
              onClick={() => selectChat(chat.id)}
              className={clsx(
                'w-full text-left p-4 rounded-2xl border transition-all duration-300 focus-ring glass-text',
                currentChatId === chat.id
                  ? 'glass-card glass-glow-blue scale-[1.02]'
                  : 'glass-message glass-hover'
              )}
            >
              <div className="font-medium text-sm truncate">
                {chat.title}
              </div>
              <div className="text-xs opacity-70 mt-2">
                {chat.messages.length > 0 
                  ? chat.messages[chat.messages.length - 1].content.slice(0, 60) + '...'
                  : 'No messages yet'
                }
              </div>
            </button>
          ))}
        </div>
      </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Sidebar Toggle Button */}
              <button
                onClick={() => setSidebarVisible(!sidebarVisible)}
                className="glass-button p-3 rounded-2xl focus-ring glass-glow-blue hover:scale-105 transition-transform duration-200"
                title={sidebarVisible ? "Hide sidebar" : "Show sidebar"}
              >
                {sidebarVisible ? <X className="w-5 h-5 glass-text" /> : <Menu className="w-5 h-5 glass-text" />}
              </button>
              <select
                value={config.model}
                onChange={(e) => setConfig(prev => ({ ...prev, model: e.target.value }))}
                className={clsx(
                  'px-4 py-3 rounded-2xl focus-ring text-sm min-w-[300px] glass-input glass-text font-medium',
                  !config.model.trim() && error
                    ? 'border-red-300/50 bg-red-500/10'
                    : ''
                )}
              >
                <option value="" disabled>
                  Select a model...
                </option>
                <option value="openai/gpt-oss-20b">
                  openai/gpt-oss-20b
                </option>
                <option value="openai/gpt-oss-120b">
                  openai/gpt-oss-120b
                </option>
              </select>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium glass-text">
                  Temp:
                </label>
                <input
                  type="range"
                  min="0"
                  max="1.5"
                  step="0.1"
                  value={config.temperature}
                  onChange={(e) => setConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                  className="w-24"
                />
                <span className="text-sm glass-text min-w-[2rem] font-mono">
                  {config.temperature}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-3 glass-button rounded-2xl focus-ring glass-text"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={deleteCurrentChat}
                className="p-3 glass-button rounded-2xl focus-ring glass-text"
                title="Delete Chat"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                onClick={exportChats}
                className="p-3 glass-button rounded-2xl focus-ring glass-text"
                title="Export Chats"
              >
                <Download className="w-5 h-5" />
              </button>
              <label className="p-3 glass-button rounded-2xl focus-ring cursor-pointer glass-text" title="Import Chats">
                <Upload className="w-5 h-5" />
                <input
                  type="file"
                  accept=".json"
                  onChange={importChats}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* System Prompt */}
          {showSettings && (
            <div className="mt-6 p-6 glass-card rounded-3xl">
              <label className="block text-sm font-medium glass-text mb-3">
                System Prompt
              </label>
              <textarea
                value={config.systemPrompt}
                onChange={(e) => setConfig(prev => ({ ...prev, systemPrompt: e.target.value }))}
                onBlur={() => StorageService.saveConfig(config)}
                className="w-full p-4 glass-input rounded-2xl focus-ring resize-none glass-text"
                rows={3}
                placeholder="Enter system instructions..."
              />
            </div>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {!currentChat || currentChat.messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <div className="glass-card p-12 rounded-3xl glass-glow">
                <Bot className="w-16 h-16 mx-auto mb-6 glass-text opacity-80" />
                <h2 className="text-2xl font-semibold glass-text mb-4">
                  Welcome to Le Trung Linh Chat
                </h2>
                <p className="glass-text opacity-70 text-lg">
                  Enter your model name above and start chatting!
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-8 max-w-4xl mx-auto">
              {currentChat.messages.map((message) => (
                <div key={message.id}>
                  <div className={clsx(
                    'flex gap-6',
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  )}>
                    <div className={clsx(
                      'flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium glass-glow',
                      message.role === 'user' 
                        ? 'glass-user-message glass-glow-blue' 
                        : 'glass-card'
                    )}>
                      {message.role === 'user' ? <User className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
                    </div>
                    
                    <div className={clsx(
                      'flex-1 max-w-3xl rounded-3xl px-6 py-5',
                      message.role === 'user'
                        ? 'glass-user-message glass-glow-blue'
                        : 'glass-card glass-glow'
                    )}>
                      {message.role === 'user' ? (
                        <div className="whitespace-pre-wrap glass-text font-medium">{message.content}</div>
                      ) : (
                        <MarkdownRenderer 
                          content={message.content} 
                          className="prose prose-sm max-w-none glass-text"
                        />
                      )}
                      <div className="text-xs mt-3 opacity-60 glass-text">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isStreaming && (
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full glass-card glass-glow flex items-center justify-center">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div className="flex-1 max-w-3xl rounded-3xl px-6 py-5 glass-card glass-glow">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-white/60 rounded-full typing-dot"></div>
                      <div className="w-3 h-3 bg-white/60 rounded-full typing-dot"></div>
                      <div className="w-3 h-3 bg-white/60 rounded-full typing-dot"></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="glass-panel p-6">
          {error && (
            <div className="mb-6 p-4 glass-card rounded-2xl border border-red-300/30 bg-red-500/10 text-red-200 text-sm font-medium">
              {error}
            </div>
          )}
          
          <div className="flex gap-4 items-end max-w-4xl mx-auto">
            <textarea
              ref={textareaRef}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
              className="flex-1 resize-none glass-input rounded-2xl px-6 py-4 focus-ring glass-text font-medium shadow-2xl"
              rows={1}
              style={{ minHeight: '56px', maxHeight: '200px' }}
              spellCheck={false}
            />
            <button
              onClick={sendMessage}
              disabled={!userInput.trim() || !config.model.trim() || isStreaming}
              className="px-6 py-4 glass-button disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl focus-ring glass-glow-blue glass-text font-medium"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
