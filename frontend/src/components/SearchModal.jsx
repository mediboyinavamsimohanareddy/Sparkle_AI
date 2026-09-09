import React, { useState, useEffect, useRef } from 'react';
import { Search, X, MessageSquare, Folder, FileText } from 'lucide-react';
import { chatService } from '../services/chatService';
import { useChat } from '../context/ChatContext';
import './SearchModal.css';

export default function SearchModal({ onClose }) {
  const { selectConversation } = useChat();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await chatService.globalSearch(query);
        setResults(data);
      } catch (e) {
        setResults(null);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleConvSelect = async (id) => {
    await selectConversation(id);
    onClose();
  };

  const totalResults = results
    ? (results.conversations?.length || 0) + (results.folders?.length || 0) + (results.files?.length || 0)
    : 0;

  return (
    <div className="modal-overlay" id="search-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="search-modal-content" id="search-modal" role="dialog" aria-label="Global search">
        <div className="search-modal-header">
          <Search size={18} className="search-modal-icon" />
          <input
            ref={inputRef}
            id="search-query-input"
            className="search-modal-input"
            placeholder="Search conversations, folders, files..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Escape' && onClose()}
          />
          <button className="btn btn-icon" id="search-close-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="search-modal-body">
          {loading && <div className="search-loading">Searching...</div>}

          {!loading && query && results && totalResults === 0 && (
            <div className="search-no-results">
              <Search size={32} style={{ opacity: 0.3 }} />
              <p>No results for "<strong>{query}</strong>"</p>
            </div>
          )}

          {!loading && results && totalResults > 0 && (
            <>
              {results.conversations?.length > 0 && (
                <div className="search-section">
                  <div className="search-section-label">
                    <MessageSquare size={13} /> Conversations
                  </div>
                  {results.conversations.map(c => (
                    <button
                      key={c.id}
                      id={`search-conv-${c.id}`}
                      className="search-result-item"
                      onClick={() => handleConvSelect(c.id)}
                    >
                      <MessageSquare size={14} />
                      <div className="search-result-info">
                        <span className="search-result-title">{c.title}</span>
                        <span className="search-result-meta">{c.mode} · {c.model}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {results.folders?.length > 0 && (
                <div className="search-section">
                  <div className="search-section-label">
                    <Folder size={13} /> Folders
                  </div>
                  {results.folders.map(f => (
                    <div key={f.id} id={`search-folder-${f.id}`} className="search-result-item no-hover">
                      <Folder size={14} />
                      <div className="search-result-info">
                        <span className="search-result-title">{f.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {results.files?.length > 0 && (
                <div className="search-section">
                  <div className="search-section-label">
                    <FileText size={13} /> Files
                  </div>
                  {results.files.map(f => (
                    <div key={f.id} id={`search-file-${f.id}`} className="search-result-item no-hover">
                      <FileText size={14} />
                      <div className="search-result-info">
                        <span className="search-result-title">{f.originalName}</span>
                        <span className="search-result-meta">{f.fileType} · {f.fileSize ? `${Math.round(f.fileSize / 1024)} KB` : ''}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {!query && (
            <div className="search-empty-state">
              <p>Start typing to search across all your conversations, folders, and files.</p>
              <div className="search-shortcuts">
                <kbd>↵</kbd> Select &nbsp; <kbd>Esc</kbd> Close
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
