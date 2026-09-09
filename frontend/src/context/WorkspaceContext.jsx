import React, { createContext, useContext, useState, useEffect } from 'react';
import { workspaceService } from '../services/workspaceService';

const WorkspaceContext = createContext();

export const WorkspaceProvider = ({ children }) => {
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [folders, setFolders] = useState([]);
  const [activeFolder, setActiveFolder] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchWorkspaces = async () => {
    try {
      setLoading(true);
      const data = await workspaceService.getWorkspaces();
      setWorkspaces(data);
      if (data.length > 0 && !activeWorkspace) {
        setActiveWorkspace(data[0]);
      }
    } catch (err) {
      console.error('Failed to load workspaces', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFolders = async (wsId) => {
    try {
      const data = await workspaceService.getFolders(wsId || activeWorkspace?.id);
      setFolders(data);
    } catch (err) {
      console.error('Failed to load folders', err);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  useEffect(() => {
    if (activeWorkspace) {
      fetchFolders(activeWorkspace.id);
    }
  }, [activeWorkspace]);

  const createWorkspace = async (name, description) => {
    const ws = await workspaceService.createWorkspace({ name, description });
    setWorkspaces(prev => [...prev, ws]);
    setActiveWorkspace(ws);
  };

  const createFolder = async (name, parentId) => {
    if (!activeWorkspace) return;
    const f = await workspaceService.createFolder({
      name,
      parentId,
      workspaceId: activeWorkspace.id
    });
    setFolders(prev => [...prev, f]);
  };

  const deleteFolder = async (id) => {
    await workspaceService.deleteFolder(id);
    setFolders(prev => prev.filter(f => f.id !== id));
  };

  return (
    <WorkspaceContext.Provider value={{
      workspaces,
      activeWorkspace,
      setActiveWorkspace,
      folders,
      activeFolder,
      setActiveFolder,
      fetchWorkspaces,
      fetchFolders,
      createWorkspace,
      createFolder,
      deleteFolder,
      loading
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => useContext(WorkspaceContext);
