import React, { useEffect, useRef } from 'react';
import { Copy, Download, ToggleLeft, ToggleRight, WrapText, Check } from 'lucide-react';
import { clsx } from 'clsx';

interface CodeBlockProps {
  code: string;
  lang?: string;
  filename?: string;
  wrap?: boolean;
  collapsible?: boolean;
  className?: string;
}

// Simple syntax highlighting using React elements instead of dangerouslySetInnerHTML
const HighlightedCode: React.FC<{ code: string; language: string }> = ({ code, language }) => {
  const renderHighlightedCode = () => {
    const lines = code.split('\n');
    
    return lines.map((line, lineIndex) => {
      // Define patterns based on language
      let patterns: Array<{ regex: RegExp; className: string }> = [];
      
      switch (language.toLowerCase()) {
        case 'python':
        case 'py':
          patterns = [
            // Comments first (highest priority)
            { regex: /#.*$/g, className: 'text-gray-500 italic' },
            // Triple quoted strings
            { regex: /"""[\s\S]*?"""/g, className: 'text-green-400' },
            { regex: /'''[\s\S]*?'''/g, className: 'text-green-400' },
            // Regular strings
            { regex: /"(?:[^"\\]|\\.)*"/g, className: 'text-green-400' },
            { regex: /'(?:[^'\\]|\\.)*'/g, className: 'text-green-400' },
            // Keywords
            { regex: /\b(def|class|if|elif|else|for|while|try|except|finally|with|as|import|from|return|yield|lambda|and|or|not|in|is|True|False|None|pass|break|continue|global|nonlocal)\b/g, className: 'text-purple-400' },
            // Numbers
            { regex: /\b\d+\.?\d*\b/g, className: 'text-orange-400' },
          ];
          break;
          
        case 'javascript':
        case 'js':
        case 'jsx':
          patterns = [
            // Comments
            { regex: /\/\/.*$/g, className: 'text-gray-500 italic' },
            { regex: /\/\*[\s\S]*?\*\//g, className: 'text-gray-500 italic' },
            // Strings
            { regex: /"(?:[^"\\]|\\.)*"/g, className: 'text-green-400' },
            { regex: /'(?:[^'\\]|\\.)*'/g, className: 'text-green-400' },
            { regex: /`(?:[^`\\]|\\.)*`/g, className: 'text-green-400' },
            // Keywords
            { regex: /\b(function|const|let|var|if|else|for|while|return|import|export|default|class|extends|constructor|this|super|async|await|try|catch|finally|throw|typeof|instanceof|new|delete|in|of)\b/g, className: 'text-purple-400' },
            // Numbers
            { regex: /\b\d+\.?\d*\b/g, className: 'text-orange-400' },
          ];
          break;
          
        case 'typescript':
        case 'ts':
        case 'tsx':
          patterns = [
            // Comments
            { regex: /\/\/.*$/g, className: 'text-gray-500 italic' },
            { regex: /\/\*[\s\S]*?\*\//g, className: 'text-gray-500 italic' },
            // Strings
            { regex: /"(?:[^"\\]|\\.)*"/g, className: 'text-green-400' },
            { regex: /'(?:[^'\\]|\\.)*'/g, className: 'text-green-400' },
            { regex: /`(?:[^`\\]|\\.)*`/g, className: 'text-green-400' },
            // Keywords
            { regex: /\b(function|const|let|var|if|else|for|while|return|import|export|default|class|extends|constructor|this|super|async|await|try|catch|finally|throw|typeof|instanceof|new|delete|in|of|interface|type|enum|namespace|declare|public|private|protected|readonly|static)\b/g, className: 'text-purple-400' },
            // Numbers
            { regex: /\b\d+\.?\d*\b/g, className: 'text-orange-400' },
          ];
          break;
          
        default:
          patterns = [
            // Basic highlighting for unknown languages
            { regex: /"(?:[^"\\]|\\.)*"/g, className: 'text-green-400' },
            { regex: /'(?:[^'\\]|\\.)*'/g, className: 'text-green-400' },
            { regex: /\b\d+\.?\d*\b/g, className: 'text-orange-400' },
          ];
          break;
      }
      
      // Process line with patterns
      let matches: Array<{ start: number; end: number; className: string; text: string }> = [];
      
      // Find all matches
      patterns.forEach(pattern => {
        const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
        let match: RegExpExecArray | null;
        while ((match = regex.exec(line)) !== null) {
          // Check if this match overlaps with existing matches
          const overlaps = matches.some(existing => 
            (match!.index < existing.end && match!.index + match![0].length > existing.start)
          );
          
          if (!overlaps) {
            matches.push({
              start: match.index,
              end: match.index + match[0].length,
              className: pattern.className,
              text: match[0]
            });
          }
        }
      });
      
      // Sort matches by start position
      matches.sort((a, b) => a.start - b.start);
      
      // Build the highlighted line
      let lastIndex = 0;
      const lineParts: React.ReactNode[] = [];
      
      matches.forEach((match, matchIndex) => {
        // Add text before the match
        if (match.start > lastIndex) {
          lineParts.push(line.slice(lastIndex, match.start));
        }
        
        // Add the highlighted match
        lineParts.push(
          <span key={matchIndex} className={match.className}>
            {match.text}
          </span>
        );
        
        lastIndex = match.end;
      });
      
      // Add remaining text
      if (lastIndex < line.length) {
        lineParts.push(line.slice(lastIndex));
      }
      
      return (
        <div key={lineIndex}>
          {lineParts.length > 0 ? lineParts : line}
        </div>
      );
    });
  };
  
  return <>{renderHighlightedCode()}</>;
};

interface CodeBlockProps {
  code: string;
  lang?: string;
  filename?: string;
  wrap?: boolean;
  collapsible?: boolean;
  className?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  lang = 'text',
  filename,
  wrap = false,
  collapsible = false,
  className
}) => {
  const [copied, setCopied] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [wordWrap, setWordWrap] = React.useState(wrap);
  const textRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const copyToClipboard = async () => {
    try {
      // Modern Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        return;
      }
      
      // Fallback for older browsers or non-secure contexts
      const textArea = document.createElement('textarea');
      textArea.value = code;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        if (successful) {
          setCopied(true);
        } else {
          throw new Error('Copy command failed');
        }
      } finally {
        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.error('Failed to copy code:', err);
      
      // Show user-friendly error message
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      alert(`Failed to copy code. Please manually select and copy the text.\n\nError: ${errorMessage}`);
    }
  };

  const downloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `code.${lang}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={clsx(
      'relative rounded-2xl glass-card glass-glow',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between glass-panel px-6 py-4 rounded-t-2xl border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono glass-text font-semibold">
            {lang.toUpperCase()}
          </span>
          {filename && (
            <span className="text-sm glass-text opacity-70">{filename}</span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Word wrap toggle */}
          <button
            onClick={() => setWordWrap(!wordWrap)}
            className="p-2 glass-button rounded-xl transition-all duration-300 glass-text"
            title={wordWrap ? 'Disable word wrap' : 'Enable word wrap'}
          >
            <WrapText className="w-4 h-4" />
          </button>
          
          {/* Collapse toggle */}
          {collapsible && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 glass-button rounded-xl transition-all duration-300 glass-text"
              title={isCollapsed ? 'Expand' : 'Collapse'}
            >
              {isCollapsed ? (
                <ToggleRight className="w-4 h-4" />
              ) : (
                <ToggleLeft className="w-4 h-4" />
              )}
            </button>
          )}
          
          {/* Copy button */}
          <button
            onClick={copyToClipboard}
            className={clsx(
              "p-2 glass-button rounded-xl transition-all duration-300 glass-text hover:scale-105 active:scale-95 relative",
              copied ? "bg-green-500/20 border-green-400/30" : "hover:bg-white/10"
            )}
            title={copied ? "" : "Copy to clipboard"}
            disabled={copied}
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
          
          {/* Download button */}
          <button
            onClick={downloadCode}
            className="p-2 glass-button rounded-xl transition-all duration-300 glass-text"
            title="Download file"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Code content */}
      {!isCollapsed && (
        <div className="relative">
          <pre className={clsx(
            'p-6 overflow-x-auto text-sm font-mono bg-black/10 backdrop-blur-sm rounded-b-2xl',
            wordWrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre'
          )}>
            <code 
              ref={textRef}
              className="glass-text"
            >
              <HighlightedCode code={code} language={lang} />
            </code>
          </pre>
        </div>
      )}
    </div>
  );
};
