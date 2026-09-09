import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '../context/ThemeContext';

const CodeBlock = ({ language, value }) => {
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme();

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      position: 'relative',
      margin: '12px 0',
      borderRadius: '8px',
      overflow: 'hidden',
      border: '1px solid var(--border-color)',
      backgroundColor: theme === 'dark' ? '#1e1e1e' : '#f8f9fa'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '6px 12px',
        background: 'var(--bg-tertiary)',
        fontSize: '0.8rem',
        color: 'var(--text-secondary)'
      }}>
        <span style={{ textTransform: 'lowercase', fontWeight: 'bold' }}>{language || 'text'}</span>
        <button
          onClick={handleCopy}
          className="btn btn-icon"
          style={{ padding: '4px 8px', fontSize: '0.75rem', gap: '4px', cursor: 'pointer' }}
          title="Copy Code"
        >
          {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy code'}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || 'text'}
        style={theme === 'dark' ? vscDarkPlus : vs}
        customStyle={{
          margin: 0,
          padding: '12px',
          fontSize: '0.85rem',
          background: 'transparent'
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;
