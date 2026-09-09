import api from './api';

export const fileService = {
  uploadFile: async (file, folderId, workspaceId) => {
    const formData = new FormData();
    formData.append('file', file);
    if (folderId) formData.append('folderId', folderId);
    if (workspaceId) formData.append('workspaceId', workspaceId);

    const res = await api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/images/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  getFiles: async (workspaceId, folderId) => {
    const params = {};
    if (workspaceId) params.workspaceId = workspaceId;
    if (folderId) params.folderId = folderId;
    const res = await api.get('/files', { params });
    return res.data;
  },
  deleteFile: async (id) => {
    await api.delete(`/files/${id}`);
  }
};
