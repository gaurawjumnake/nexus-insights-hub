/**
 * renderMarkdown.tsx
 *
 * Minimal markdown -> JSX renderer for LLM report text (headers, bold,
 * italic, inline code, bullet lists). Not a full CommonMark parser — just
 * enough for the shapes /kpis/insights and /chat/ask actually return.
 */
import type { ReactNode } from "react";

function parseInline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`/g;
  let last = 0, key = 0, m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[1]) parts.push(<strong key={key++}>{m[1]}</strong>);
    else if (m[2]) parts.push(<em key={key++}>{m[2]}</em>);
    else if (m[3]) parts.push(<code key={key++} className="rounded bg-slate-200 px-1 font-mono text-[11px]">{m[3]}</code>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export function renderMarkdown(text: string): ReactNode {
  return text.split("\n").map((line, i) => {
    const h3 = /^### (.*)/.exec(line);
    if (h3) return <h3 key={i} className="mt-3 mb-1 text-[13px] font-semibold text-slate-900">{parseInline(h3[1])}</h3>;
    const h2 = /^## (.*)/.exec(line);
    if (h2) return <h2 key={i} className="mt-4 mb-1.5 text-[14px] font-bold text-slate-900">{parseInline(h2[1])}</h2>;
    const h1 = /^# (.*)/.exec(line);
    if (h1) return <h1 key={i} className="mt-4 mb-2 text-[15px] font-bold text-slate-900">{parseInline(h1[1])}</h1>;

    const numbered = /^(\d+)\.\s+(.*)/.exec(line);
    if (numbered) {
      return (
        <span key={i} className="block pl-1">
          <span className="mr-1.5 text-slate-400">{numbered[1]}.</span>
          {parseInline(numbered[2])}
        </span>
      );
    }

    const bullet = /^[-*] /.test(line);
    const raw = bullet ? line.slice(2) : line;
    if (line.trim() === "") return <span key={i} className="block h-2" />;
    return (
      <span key={i} className="block">
        {bullet && <span className="mr-1.5">•</span>}
        {parseInline(raw)}
      </span>
    );
  });
}
