import React from 'react';

// A very lightweight formatter for the chat.
// In a full production app, use 'react-markdown' or 'rehype'.
// This handles basic bolding and line breaks which are most important for poetry/chat.

interface Props {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<Props> = ({ content, className }) => {
  if (!content) return null;

  // Split by double newline for paragraphs
  const paragraphs = content.split(/\n\n+/);

  return (
    <div className={`leading-relaxed ${className}`}>
      {paragraphs.map((p, pIndex) => {
        // Handle bolding: **text**
        const parts = p.split(/(\*\*.*?\*\*)/g);
        
        return (
          <p key={pIndex} className="mb-4 last:mb-0 whitespace-pre-wrap">
            {parts.map((part, i) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="font-bold text-sage-900">{part.slice(2, -2)}</strong>;
              }
              return <span key={i}>{part}</span>;
            })}
          </p>
        );
      })}
    </div>
  );
};

export default MarkdownRenderer;