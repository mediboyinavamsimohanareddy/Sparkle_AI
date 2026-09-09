import { useState } from 'react';
import { fileService } from '../services/fileService';

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const uploadFile = async (file, folderId, workspaceId) => {
    try {
      setUploading(true);
      setError(null);
      setProgress(30);
      const res = await fileService.uploadFile(file, folderId, workspaceId);
      setProgress(100);
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const uploadImage = async (file) => {
    try {
      setUploading(true);
      setError(null);
      const res = await fileService.uploadImage(file);
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return { uploadFile, uploadImage, uploading, progress, error };
};
