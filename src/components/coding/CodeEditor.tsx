import { useMemo, useRef } from 'react';
import { highlightJS } from '../../services/highlight';
import '../../styles/coding2.css';

export function CodeEditor({ value, onChange, ariaLabel }: { value: string; onChange: (v: string) => void; ariaLabel: string }) {
  const preRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const html = useMemo(() => highlightJS(value), [value]);
  const lineCount = useMemo(() => value.split('\n').length, [value]);

  const sync = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const t = e.currentTarget;
    if (preRef.current) { preRef.current.scrollTop = t.scrollTop; preRef.current.scrollLeft = t.scrollLeft; }
    if (gutterRef.current) gutterRef.current.style.transform = `translateY(${-t.scrollTop}px)`;
  };

  return (
    <div className="ce-wrap">
      <div className="ce-gutter-clip" aria-hidden="true">
        <div className="ce-gutter" ref={gutterRef}>
          {Array.from({ length: lineCount }, (_, i) => <span key={i}>{i + 1}</span>)}
        </div>
      </div>
      <div className="ce-stack">
        <pre ref={preRef} className="ce-pre" aria-hidden="true">
          <code dangerouslySetInnerHTML={{ __html: html + '\n' }} />
        </pre>
        <textarea
          className="ce-input"
          value={value}
          onChange={e => onChange(e.target.value)}
          onScroll={sync}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          aria-label={ariaLabel}
          onKeyDown={e => {
            if (e.key === 'Tab') {
              e.preventDefault();
              const el = e.currentTarget;
              const s = el.selectionStart;
              onChange(value.slice(0, s) + '  ' + value.slice(el.selectionEnd));
              requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = s + 2; });
            }
          }}
        />
      </div>
    </div>
  );
}
