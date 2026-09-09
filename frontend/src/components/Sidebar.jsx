import React, { useState } from 'react';
import {
  PanelLeft, Plus, ChevronDown, ChevronRight, FolderOpen, Folder,
  MessageSquare, Trash2, Edit2, MoreHorizontal, Search, Sparkles,
  Check, X, Briefcase
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { useChat } from '../context/ChatContext';
import './Sidebar.css';

export default function Sidebar({ open, onToggle, onSearch }) {
  const { workspaces, activeWorkspace, setActiveWorkspace, folders, createWorkspace, createFolder, deleteFolder } = useWorkspace();
  const { conversations, activeConversation, selectConversation, startNewChat, deleteConversation, renameConversation } = useChat();

  const [expandedFolders, setExpandedFolders] = useState({});
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [showNewWorkspace, setShowNewWorkspace] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [contextMenu, setContextMenu] = useState(null);

  const toggleFolder = (id) => {
    setExpandedFolders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleRename = async (conv) => {
    if (renameValue.trim()) {
      await renameConversation(conv.id, renameValue.trim());
    }
    setRenamingId(null);
    setRenameValue('');
  };

  const startRename = (conv) => {
    setRenamingId(conv.id);
    setRenameValue(conv.title);
    setContextMenu(null);
  };

  const handleCreateWorkspace = async () => {
    if (newWsName.trim()) {
      await createWorkspace(newWsName.trim());
      setNewWsName('');
      setShowNewWorkspace(false);
    }
  };

  const handleCreateFolder = async () => {
    if (newFolderName.trim()) {
      await createFolder(newFolderName.trim());
      setNewFolderName('');
      setShowNewFolder(false);
    }
  };

  // Group conversations
  const unfoldered = conversations.filter(c => !c.folderId);
  const getConvsForFolder = (fid) => conversations.filter(c => c.folderId === fid);

  if (!open) return null;

  return (
    <aside className="sidebar" id="app-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Sparkles size={18} className="sidebar-logo-icon" />
          <span>Sparkle AI</span>
        </div>
        <div className="sidebar-header-actions">
          <button id="new-chat-btn" className="btn btn-primary sidebar-new-chat" onClick={startNewChat} title="New Chat">
            <Plus size={16} /> New Chat
          </button>
          <button id="sidebar-close-btn" className="btn btn-icon" onClick={onToggle} title="Close sidebar">
            <PanelLeft size={16} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="sidebar-search" onClick={onSearch} id="sidebar-search-btn" role="button" tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && onSearch()}>
        <Search size={14} />
        <span>Search... <kbd>Ctrl+K</kbd></span>
      </div>

      {/* Workspace Picker */}
      <div className="sidebar-section">
        <div className="sidebar-section-header">
          <Briefcase size={13} />
          <span>Workspace</span>
          <button id="add-workspace-btn" className="btn btn-icon sidebar-icon-btn" onClick={() => setShowNewWorkspace(v => !v)} title="New Workspace">
            <Plus size={13} />
          </button>
        </div>

        {showNewWorkspace && (
          <div className="sidebar-input-row">
            <input
              id="new-workspace-input"
              autoFocus
              className="sidebar-input"
              placeholder="Workspace name..."
              value={newWsName}
              onChange={e => setNewWsName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCreateWorkspace(); if (e.key === 'Escape') setShowNewWorkspace(false); }}
            />
            <button className="btn-icon-tiny" onClick={handleCreateWorkspace}><Check size={13} /></button>
            <button className="btn-icon-tiny" onClick={() => setShowNewWorkspace(false)}><X size={13} /></button>
          </div>
        )}

        <div className="workspace-list">
          {workspaces.map(ws => (
            <button
              key={ws.id}
              id={`workspace-${ws.id}`}
              className={`workspace-chip ${activeWorkspace?.id === ws.id ? 'active' : ''}`}
              onClick={() => setActiveWorkspace(ws)}
            >
              {ws.name}
            </button>
          ))}
          {workspaces.length === 0 && (
            <span className="sidebar-empty-hint">No workspaces yet</span>
          )}
        </div>
      </div>

      {/* Folders + Conversations */}
      <div className="sidebar-section sidebar-conversations">
        <div className="sidebar-section-header">
          <Folder size={13} />
          <span>Folders</span>
          <button id="add-folder-btn" className="btn btn-icon sidebar-icon-btn" onClick={() => setShowNewFolder(v => !v)} title="New Folder">
            <Plus size={13} />
          </button>
        </div>

        {showNewFolder && (
          <div className="sidebar-input-row">
            <input
              id="new-folder-input"
              autoFocus
              className="sidebar-input"
              placeholder="Folder name..."
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCreateFolder(); if (e.key === 'Escape') setShowNewFolder(false); }}
            />
            <button className="btn-icon-tiny" onClick={handleCreateFolder}><Check size={13} /></button>
            <button className="btn-icon-tiny" onClick={() => setShowNewFolder(false)}><X size={13} /></button>
          </div>
        )}

        <div className="conversation-tree">
          {/* Folders with nested convs */}
          {folders.map(folder => (
            <div key={folder.id} className="folder-group">
              <div
                className="folder-row"
                id={`folder-${folder.id}`}
                onClick={() => toggleFolder(folder.id)}
              >
                {expandedFolders[folder.id]
                  ? <><ChevronDown size={13} /><FolderOpen size={14} /></>
                  : <><ChevronRight size={13} /><Folder size={14} /></>
                }
                <span className="folder-name">{folder.name}</span>
                <button
                  className="btn-icon-tiny folder-delete"
                  onClick={e => { e.stopPropagation(); deleteFolder(folder.id); }}
                  title="Delete folder"
                >
                  <Trash2 size={12} />
                </button>
              </div>
              {expandedFolders[folder.id] && (
                <div className="folder-children">
                  {getConvsForFolder(folder.id).map(conv => (
                    <ConvItem
                      key={conv.id}
                      conv={conv}
                      active={activeConversation?.id === conv.id}
                      renamingId={renamingId}
                      renameValue={renameValue}
                      setRenameValue={setRenameValue}
                      onSelect={() => selectConversation(conv.id)}
                      onDelete={() => deleteConversation(conv.id)}
                      onStartRename={() => startRename(conv)}
                      onRename={() => handleRename(conv)}
                      onCancelRename={() => setRenamingId(null)}
                    />
                  ))}
                  {getConvsForFolder(folder.id).length === 0 && (
                    <span className="folder-empty">No chats</span>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Unfoldered conversations */}
          {unfoldered.length > 0 && (
            <div className="unfoldered-label">Recent Chats</div>
          )}
          {unfoldered.map(conv => (
            <ConvItem
              key={conv.id}
              conv={conv}
              active={activeConversation?.id === conv.id}
              renamingId={renamingId}
              renameValue={renameValue}
              setRenameValue={setRenameValue}
              onSelect={() => selectConversation(conv.id)}
              onDelete={() => deleteConversation(conv.id)}
              onStartRename={() => startRename(conv)}
              onRename={() => handleRename(conv)}
              onCancelRename={() => setRenamingId(null)}
            />
          ))}

          {conversations.length === 0 && (
            <div className="sidebar-no-chats">
              <MessageSquare size={32} style={{ opacity: 0.3 }} />
              <p>No conversations yet</p>
              <p>Start a new chat!</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

function ConvItem({ conv, active, renamingId, renameValue, setRenameValue, onSelect, onDelete, onStartRename, onRename, onCancelRename }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isRenaming = renamingId === conv.id;

  return (
    <div
      className={`conv-item ${active ? 'active' : ''}`}
      id={`conv-${conv.id}`}
      onClick={() => !isRenaming && onSelect()}
    >
      <MessageSquare size={14} className="conv-icon" />
      {isRenaming ? (
        <input
          autoFocus
          className="conv-rename-input"
          value={renameValue}
          onChange={e => setRenameValue(e.target.value)}
          onClick={e => e.stopPropagation()}
          onKeyDown={e => {
            e.stopPropagation();
            if (e.key === 'Enter') onRename();
            if (e.key === 'Escape') onCancelRename();
          }}
        />
      ) : (
        <span className="conv-title">{conv.title}</span>
      )}
      {!isRenaming && (
        <div className="conv-actions" onClick={e => e.stopPropagation()}>
          <button
            className="btn-icon-tiny"
            onClick={() => setMenuOpen(v => !v)}
            title="More options"
          >
            <MoreHorizontal size={13} />
          </button>
          {menuOpen && (
            <div className="conv-context-menu">
              <button onClick={() => { setMenuOpen(false); onStartRename(); }}>
                <Edit2 size={12} /> Rename
              </button>
              <button className="danger" onClick={() => { setMenuOpen(false); onDelete(); }}>
                <Trash2 size={12} /> Delete
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
