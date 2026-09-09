import api from './api';

export const workspaceService = {
  getWorkspaces: async () => {
    const res = await api.get('/workspaces');
    return res.data;
  },
  createWorkspace: async (data) => {
    const res = await api.post('/workspaces', data);
    return res.data;
  },
  updateWorkspace: async (id, data) => {
    const res = await api.put(`/workspaces/${id}`, data);
    return res.data;
  },
  deleteWorkspace: async (id) => {
    await api.delete(`/workspaces/${id}`);
  },
  getFolders: async (workspaceId) => {
    const res = await api.get('/folders', { params: { workspaceId } });
    return res.data;
  },
  createFolder: async (data) => {
    const res = await api.post('/folders', data);
    return res.data;
  },
  deleteFolder: async (id) => {
    await api.delete(`/folders/${id}`);
  }
};
