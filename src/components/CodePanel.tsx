import React from 'react';

interface CodePanelProps {
  code: string;
  language?: string;
}

export const CodePanel: React.FC<CodePanelProps> = ({ code, language = 'text' }) => {
  const lines = code.trim().split('\n');

  // Lightweight local token highlighting
  const highlightLine = (line: string): React.ReactNode[] => {
    // Basic regex-based tokenization for C++, Python, JS, Java
    const tokenRegex = /(\/\/.*|#.*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|\b(int|void|float|double|char|bool|def|class|function|let|const|var|return|if|else|for|while|in|import|from|swap|cout|cin|print|new|public|static)\b|\b(\d+)\b|([{}()[\];,+\-*/=<>!&|])/g;

    const nodes: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = tokenRegex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        nodes.push(line.substring(lastIndex, match.index));
      }

      const [full, comment, stringLit, keyword, numberLit, symbol] = match;

      if (comment) {
        nodes.push(
          <span key={match.index} className="text-[#6C7086] italic">
            {comment}
          </span>
        );
      } else if (stringLit) {
        nodes.push(
          <span key={match.index} className="text-[#A6E3A1]">
            {stringLit}
          </span>
        );
      } else if (keyword) {
        nodes.push(
          <span key={match.index} className="text-[#CBA6F7] font-semibold">
            {keyword}
          </span>
        );
      } else if (numberLit) {
        nodes.push(
          <span key={match.index} className="text-[#FAB387]">
            {numberLit}
          </span>
        );
      } else if (symbol) {
        nodes.push(
          <span key={match.index} className="text-[#89DCEB]">
            {symbol}
          </span>
        );
      } else {
        nodes.push(full);
      }

      lastIndex = tokenRegex.lastIndex;
    }

    if (lastIndex < line.length) {
      nodes.push(line.substring(lastIndex));
    }

    return nodes.length > 0 ? nodes : [line];
  };

  return (
    <div className="w-full my-4 rounded-2xl bg-[#0F0F1A] border border-white/10 overflow-hidden shadow-2xl">
      {/* Window Title Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#171726] border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#FF5F56] shadow-sm opacity-90" />
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E] shadow-sm opacity-90" />
          <div className="w-3 h-3 rounded-full bg-[#27C93F] shadow-sm opacity-90" />
        </div>
        <span className="text-xs font-mono font-medium tracking-wide uppercase px-2 py-0.5 rounded bg-white/5 text-muted">
          {language}
        </span>
      </div>

      {/* Code Area with Line Numbers */}
      <div className="p-4 overflow-x-auto text-sm font-mono leading-relaxed select-text">
        <table className="border-collapse w-full">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                <td className="w-8 pr-4 text-right text-muted/40 select-none text-xs align-top">
                  {idx + 1}
                </td>
                <td className="text-[#CDD6F4] whitespace-pre font-mono">
                  {highlightLine(line)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
