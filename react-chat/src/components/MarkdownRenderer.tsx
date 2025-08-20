import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './CodeBlock';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className }) => {
  return (
    <ReactMarkdown
      className={className}
      remarkPlugins={[remarkGfm]}
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          const lang = match ? match[1] : '';
          
          if (!inline && (match || children.toString().includes('\n'))) {
            return (
              <CodeBlock
                code={String(children).replace(/\n$/, '')}
                lang={lang}
                collapsible={children.toString().split('\n').length > 20}
                {...props}
              />
            );
          }
          
          return (
            <code className="px-2 py-1 glass-card rounded-lg text-sm font-mono glass-text" {...props}>
              {children}
            </code>
          );
        },
        
        table({ children }) {
          // Parse table data for DataTable component
          // For now, render as regular table - we can enhance this later
          return (
            <div className="overflow-x-auto my-6">
              <table className="min-w-full glass-card rounded-2xl overflow-hidden">
                {children}
              </table>
            </div>
          );
        },
        
        thead({ children }) {
          return (
            <thead className="glass-panel">
              {children}
            </thead>
          );
        },
        
        tbody({ children }) {
          return (
            <tbody className="divide-y divide-white/5">
              {children}
            </tbody>
          );
        },
        
        th({ children }) {
          return (
            <th className="px-6 py-4 text-left text-sm font-semibold glass-text border-b border-white/10">
              {children}
            </th>
          );
        },
        
        td({ children }) {
          return (
            <td className="px-6 py-4 text-sm glass-text">
              {children}
            </td>
          );
        },
        
        h1({ children }) {
          return (
            <h1 className="text-2xl font-bold mb-6 glass-text">
              {children}
            </h1>
          );
        },
        
        h2({ children }) {
          return (
            <h2 className="text-xl font-semibold mb-4 glass-text">
              {children}
            </h2>
          );
        },
        
        h3({ children }) {
          return (
            <h3 className="text-lg font-medium mb-3 glass-text">
              {children}
            </h3>
          );
        },
        
        p({ children }) {
          return (
            <p className="mb-4 glass-text leading-relaxed">
              {children}
            </p>
          );
        },
        
        ul({ children }) {
          return (
            <ul className="mb-4 pl-6 space-y-2 glass-text">
              {children}
            </ul>
          );
        },
        
        ol({ children }) {
          return (
            <ol className="mb-4 pl-6 space-y-2 glass-text">
              {children}
            </ol>
          );
        },
        
        li({ children }) {
          return (
            <li className="glass-text">
              {children}
            </li>
          );
        },
        
        blockquote({ children }) {
          return (
            <blockquote className="border-l-4 border-white/30 pl-6 py-2 mb-4 glass-card rounded-r-xl">
              <div className="glass-text opacity-90 italic">
                {children}
              </div>
            </blockquote>
          );
        },
        
        a({ children, href }) {
          return (
            <a 
              href={href} 
              className="glass-text underline hover:opacity-80 transition-opacity duration-200"
              target="_blank" 
              rel="noopener noreferrer"
            >
              {children}
            </a>
          );
        },
        
        strong({ children }) {
          return (
            <strong className="font-semibold glass-text">
              {children}
            </strong>
          );
        },
        
        em({ children }) {
          return (
            <em className="italic glass-text">
              {children}
            </em>
          );
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );
};
