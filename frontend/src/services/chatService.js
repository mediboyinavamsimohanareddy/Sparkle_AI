import api from './api';

export const chatService = {
  sendMessage: async (data) => {
    const res = await api.post('/chats', data);
    return res.data;
  },
  getConversations: async (workspaceId, query) => {
    const params = {};
    if (workspaceId) params.workspaceId = workspaceId;
    if (query) params.q = query;
    const res = await api.get('/chats', { params });
    return res.data;
  },
  getConversation: async (id) => {
    const res = await api.get(`/chats/${id}`);
    return res.data;
  },
  updateConversation: async (id, data) => {
    const res = await api.put(`/chats/${id}`, data);
    return res.data;
  },
  deleteConversation: async (id) => {
    await api.delete(`/chats/${id}`);
  },
  regenerateResponse: async (id) => {
    const res = await api.post(`/chats/${id}/regenerate`);
    return res.data;
  },
  globalSearch: async (q) => {
    const res = await api.get('/search', { params: { q } });
    return res.data;
  }
};
