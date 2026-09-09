import React, { useState, useRef, useEffect } from 'react';
import {
  Plus, Send, Square, Paperclip, Image as ImageIcon, Folder, Globe, Search,
  Code2, PenLine, BookOpen, X, FileText, Loader2, Mic, StopCircle, Sparkles
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { useFileUpload } from '../hooks/useFileUpload';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useVoice } from '../context/VoiceContext';
import NovaOrb from './NovaOrb';
import './ChatInput.css';

const ACCEPTED_DOCS = '.pdf,.docx,.txt,.csv,.xlsx';
const ACCEPTED_IMAGES = 'image/png,image/jpeg,image/webp';

const PLUS_MENU_ITEMS = [
  {
    id: 'upload-file',
    icon: <Paperclip size={16} />,
    title: 'Upload file',
    desc: 'Analyze PDF, DOCX, CSV and other files',
    type: 'action'
  },
  {
    id: 'add-image',
    icon: <ImageIcon size={16} />,
    title: 'Add image',
    desc: 'Analyze an image or screenshot',
    type: 'action'
  },
  {
    id: 'workspace',
    icon: <Folder size={16} />,
    title: 'Choose from workspace',
    desc: 'Use files from active workspace',
    type: 'chip',
    chipLabel: 'Workspace Context'
  },
  {
    id: 'web-search',
    icon: <Globe size={16} />,
    title: 'Web Search',
    desc: 'Search the web for current information',
    type: 'chip',
    chipLabel: 'Web Search'
  },
  {
    id: 'deep-research',
    icon: <Search size={16} />,
    title: 'Deep Research',
    desc: 'In-depth analysis and multi-step reasoning',
    type: 'chip',
    chipLabel: 'Deep Research'
  },
  {
    id: 'code',
    icon: <Code2 size={16} />,
    title: 'Code',
    desc: 'Generate, review or debug code',
    type: 'chip',
    chipLabel: 'Code Assistant',
    mode: 'Coding'
  },
  {
    id: 'writing',
    icon: <PenLine size={16} />,
    title: 'Writing',
    desc: 'Draft, edit or improve prose',
    type: 'chip',
    chipLabel: 'Writing Assistant',
    mode: 'Writing'
  },
  {
    id: 'study',
    icon: <BookOpen size={16} />,
    title: 'Study',
    desc: 'Learn concepts step by step',
    type: 'chip',
    chipLabel: 'Study Assistant',
    mode: 'Study'
  }
];

export default function ChatInput() {
  const { sendMessage, loading, setSelectedMode } = useChat();
  const { activeWorkspace, activeFolder } = useWorkspace();
  const { uploadFile, uploadImage, uploading } = useFileUpload();
  const { voiceInputEnabled, voiceLanguage } = useVoice();

  const [input, setInput] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [activeChips, setActiveChips] = useState([]);
  const [plusMenuOpen, setPlusMenuOpen] = useState(false);
  const [localError, setLocalError] = useState('');

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const popoverRef = useRef(null);

  const {
    isListening,
    transcript,
    setTranscript,
    error: speechError,
    isSupported: isSpeechSupported,
    startListening,
    stopListening,
    cancelListening
  } = useSpeechRecognition();

  // Sync speech transcript
  useEffect(() => {
    if (isListening && transcript) {
      setInput(transcript);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 180) + 'px';
      }
    }
  }, [transcript, isListening]);

  // Click outside to close plus menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setPlusMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSend = async () => {
    if (isListening) stopListening();

    const promptText = input.trim();
    if (!promptText && !attachedFile) return;
    if (loading || uploading) return;

    setLocalError('');
    setInput('');
    setTranscript('');
    const file = attachedFile;
    setAttachedFile(null);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    // Build enhanced prompt prefix if active tool chips present
    let finalPrompt = promptText;
    if (activeChips.length > 0) {
      const chipLabels = activeChips.map(c => c.chipLabel).join(', ');
      finalPrompt = `[Tools: ${chipLabels}] ${promptText || '(Analyze attached file)'}`;
    }

    try {
      await sendMessage({
        prompt: finalPrompt || '(Analyze attached file)',
        imageUrl: file?.type === 'image' ? file.url : null,
        fileContent: file?.type === 'doc' ? file.content : null,
        fileName: file?.name || null,
      });
    } catch (err) {
      setLocalError(err.message || 'Failed to send message.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e) => {
    setInput(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 180) + 'px';
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLocalError('');
    setPlusMenuOpen(false);
    try {
      const res = await uploadFile(file, activeFolder?.id, activeWorkspace?.id);
      setAttachedFile({
        type: 'doc',
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        content: res.extractedText || res.content || ''
      });
    } catch (err) {
      setLocalError('File upload failed: ' + err.message);
    }
    e.target.value = '';
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLocalError('');
    setPlusMenuOpen(false);
    try {
      const res = await uploadImage(file);
      setAttachedFile({
        type: 'image',
        name: file.name,
        url: res.url || res.imageUrl || ''
      });
    } catch (err) {
      setLocalError('Image upload failed: ' + err.message);
    }
    e.target.value = '';
  };

  const handlePlusMenuItemClick = (item) => {
    if (item.id === 'upload-file') {
      fileInputRef.current?.click();
    } else if (item.id === 'add-image') {
      imageInputRef.current?.click();
    } else if (item.type === 'chip') {
      if (!activeChips.some(c => c.id === item.id)) {
        setActiveChips(prev => [...prev, item]);
      }
      if (item.mode) {
        setSelectedMode(item.mode);
      }
      setPlusMenuOpen(false);
    }
  };

  const removeChip = (chipId) => {
    setActiveChips(prev => prev.filter(c => c.id !== chipId));
  };

  const toggleVoiceInput = () => {
    if (!isSpeechSupported) {
      setLocalError('Voice input is not supported in this browser.');
      return;
    }
    if (isListening) {
      stopListening();
    } else {
      startListening({ lang: voiceLanguage });
    }
  };

  // Determine dynamic placeholder
  let dynamicPlaceholder = 'Ask Sparkle AI anything...';
  if (isListening) {
    dynamicPlaceholder = 'Listening... Speak now';
  } else if (activeChips.some(c => c.id === 'web-search')) {
    dynamicPlaceholder = 'Search the web with Sparkle AI...';
  } else if (attachedFile) {
    dynamicPlaceholder = 'Ask something about this attachment...';
  }

  const displayError = localError || speechError;
  const isWebSearchActive = activeChips.some(c => c.id === 'web-search');

  return (
    <div className="composer-container" id="chat-input-container">
      <input ref={fileInputRef} type="file" accept={ACCEPTED_DOCS} style={{ display: 'none' }} onChange={handleFileSelect} id="file-doc-input" />
      <input ref={imageInputRef} type="file" accept={ACCEPTED_IMAGES} style={{ display: 'none' }} onChange={handleImageSelect} id="file-image-input" />

      {displayError && (
        <div className="composer-error">
          <span>{displayError}</span>
          <button className="btn-icon-tiny" onClick={() => setLocalError('')}><X size={12}/></button>
        </div>
      )}

      {/* Voice Listening Bar */}
      {isListening && (
        <div className="voice-listening-bar">
          <NovaOrb state="listening" size="sm" />
          <span className="listening-text">Listening to voice input...</span>
          <button className="btn btn-icon cancel-listen-btn" onClick={cancelListening} title="Cancel">
            <StopCircle size={16} />
          </button>
        </div>
      )}

      {/* Main Floating Glass Surface */}
      <div className={`composer-surface ${isListening ? 'is-listening' : ''} ${loading ? 'is-loading' : ''}`}>
        
        {/* Active Tool Chips + Attachment Previews (Above Input Inside Surface) */}
        {(activeChips.length > 0 || attachedFile) && (
          <div className="composer-top-tray">
            {/* Tool Chips */}
            {activeChips.map(chip => (
              <div key={chip.id} className="active-tool-chip">
                <span className="chip-icon">{chip.icon}</span>
                <span className="chip-label">{chip.chipLabel}</span>
                <button className="chip-remove-btn" onClick={() => removeChip(chip.id)} title="Remove tool">
                  <X size={12} />
                </button>
              </div>
            ))}

            {/* File / Image Attachment Preview */}
            {attachedFile && (
              <div className="compact-attachment-preview">
                {attachedFile.type === 'image' ? (
                  <div className="attachment-thumb">
                    <img src={attachedFile.url} alt={attachedFile.name} />
                  </div>
                ) : (
                  <FileText size={15} className="attachment-icon" />
                )}
                <span className="attachment-name">{attachedFile.name}</span>
                {attachedFile.size && <span className="attachment-size">({attachedFile.size})</span>}
                <button className="attachment-remove-btn" onClick={() => setAttachedFile(null)} title="Remove file">
                  <X size={13} />
                </button>
              </div>
            )}
          </div>
        )}

        <div className="composer-main-row">
          {/* Plus (+) Menu Trigger */}
          <div className="plus-menu-wrapper" ref={popoverRef}>
            <button
              className={`plus-btn ${plusMenuOpen ? 'open' : ''}`}
              onClick={() => setPlusMenuOpen(prev => !prev)}
              disabled={loading || uploading}
              title="Add tools & attachments"
            >
              <Plus size={18} />
            </button>

            {/* Plus Popover Menu */}
            {plusMenuOpen && (
              <div className="plus-popover-menu">
                <div className="popover-header">Add to Sparkle AI</div>
                <div className="popover-grid">
                  {PLUS_MENU_ITEMS.map(item => (
                    <button
                      key={item.id}
                      className="popover-item"
                      onClick={() => handlePlusMenuItemClick(item)}
                    >
                      <span className="popover-item-icon">{item.icon}</span>
                      <div className="popover-item-text">
                        <div className="popover-item-title">{item.title}</div>
                        <div className="popover-item-desc">{item.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            id="chat-message-input"
            className="composer-textarea"
            placeholder={dynamicPlaceholder}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={loading || uploading}
          />

          {/* Right Action Controls */}
          <div className="composer-right-actions">
            {voiceInputEnabled && isSpeechSupported && (
              <button
                className={`composer-icon-btn mic-btn ${isListening ? 'active' : ''}`}
                onClick={toggleVoiceInput}
                title={isListening ? 'Stop listening' : 'Voice input'}
                disabled={loading || uploading}
              >
                {isListening ? <StopCircle size={18} className="mic-listening" /> : <Mic size={18} />}
              </button>
            )}

            {loading ? (
              <button
                className="composer-send-btn stop-btn"
                title="AI is generating..."
                disabled
              >
                <Square size={14} className="stop-icon" />
              </button>
            ) : (
              <button
                id="send-message-btn"
                className={`composer-send-btn ${(!input.trim() && !attachedFile) || uploading ? 'disabled' : 'active'}`}
                onClick={handleSend}
                disabled={(!input.trim() && !attachedFile) || uploading}
                title="Send message"
              >
                {uploading ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
              </button>
            )}
          </div>
        </div>
      </div>

      <p className="composer-disclaimer">Sparkle AI can make mistakes. Verify important information.</p>
    </div>
  );
}
