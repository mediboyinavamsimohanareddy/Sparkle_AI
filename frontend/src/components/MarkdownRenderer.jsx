import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeBlock from './CodeBlock';

const MarkdownRenderer = ({ content }) => {
  return (
    <div className="markdown-content" style={{ lineHeight: '1.6', fontSize: '0.95rem' }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\n$/, '');

            return !inline && match ? (
              <CodeBlock
                language={match[1]}
                value={codeString}
                {...props}
              />
            ) : (
              <code
                style={{
                  background: 'var(--bg-tertiary)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '0.85em',
                  fontFamily: 'monospace',
                  color: 'var(--accent-color)'
                }}
                {...props}
              >
                {children}
              </code>
            );
          },
          table({ children }) {
            return (
              <div style={{ overflowX: 'auto', margin: '12px 0' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.88rem'
                }}>
                  {children}
                </table>
              </div>
            );
          },
          th({ children }) {
            return (
              <th style={{
                border: '1px solid var(--border-color)',
                padding: '8px 12px',
                background: 'var(--bg-tertiary)',
                textAlign: 'left',
                fontWeight: '600'
              }}>
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td style={{
                border: '1px solid var(--border-color)',
                padding: '8px 12px'
              }}>
                {children}
              </td>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
