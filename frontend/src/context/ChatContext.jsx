import React, { createContext, useContext, useState, useEffect } from 'react';
import { chatService } from '../services/chatService';
import { useWorkspace } from './WorkspaceContext';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { activeWorkspace } = useWorkspace();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [selectedMode, setSelectedMode] = useState('General');
  const [selectedModel, setSelectedModel] = useState('gemini-3.6-flash');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadConversations = async () => {
    try {
      const data = await chatService.getConversations(activeWorkspace?.id, searchQuery);
      setConversations(data);
    } catch (err) {
      console.error('Failed to load conversations', err);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [activeWorkspace, searchQuery]);

  const selectConversation = async (id) => {
    if (!id) {
      setActiveConversation(null);
      return;
    }
    try {
      setLoading(true);
      const conv = await chatService.getConversation(id);
      setActiveConversation(conv);
      if (conv.mode) setSelectedMode(conv.mode);
      if (conv.model) setSelectedModel(conv.model);
    } catch (err) {
      console.error('Failed to select conversation', err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async ({ prompt, imageUrl, fileContent, fileName }) => {
    try {
      setLoading(true);
      const req = {
        conversationId: activeConversation?.id,
        prompt,
        mode: selectedMode,
        model: selectedModel,
        workspaceId: activeWorkspace?.id,
        imageUrl,
        fileContent,
        fileName
      };

      const res = await chatService.sendMessage(req);
      setActiveConversation(res.conversation);
      await loadConversations();
      return res;
    } catch (err) {
      console.error('Error sending message:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const regenerateResponse = async () => {
    if (!activeConversation) return;
    try {
      setLoading(true);
      const res = await chatService.regenerateResponse(activeConversation.id);
      setActiveConversation(res.conversation);
      await loadConversations();
    } catch (err) {
      console.error('Error regenerating response:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteConversation = async (id) => {
    await chatService.deleteConversation(id);
    if (activeConversation?.id === id) {
      setActiveConversation(null);
    }
    await loadConversations();
  };

  const renameConversation = async (id, newTitle) => {
    const updated = await chatService.updateConversation(id, { title: newTitle });
    if (activeConversation?.id === id) {
      setActiveConversation(updated);
    }
    await loadConversations();
  };

  const startNewChat = () => {
    setActiveConversation(null);
  };

  return (
    <ChatContext.Provider value={{
      conversations,
      activeConversation,
      selectConversation,
      sendMessage,
      regenerateResponse,
      deleteConversation,
      renameConversation,
      startNewChat,
      selectedMode,
      setSelectedMode,
      selectedModel,
      setSelectedModel,
      loading,
      searchQuery,
      setSearchQuery,
      loadConversations
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
