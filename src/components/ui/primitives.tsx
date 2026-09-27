import './primitives.css';

export type Provenance = 'observed' | 'derived' | 'estimate';
export type Tone = 'ok' | 'warn' | 'danger' | 'info' | 'neutral';

const TONE_COLOR: Record<Tone, string> = {
  ok: 'var(--success)', warn: 'var(--warning)', danger: 'var(--danger)',
  info: 'var(--action)', neutral: 'var(--text-subtle)',
};

export function ProvenanceChip({ kind }: { kind: Provenance }) {
  return <span className={`ui-prov ui-prov-${kind}`}>{kind}</span>;
}

export function StatusDot({ tone, label }: { tone: Tone; label: string }) {
  return (
    <span className="ui-statusdot">
      <span className="ui-dot" style={{ background: TONE_COLOR[tone] }} aria-hidden="true" />
      {label}
    </span>
  );
}

export function SectionIndex({ index, label }: { index: string; label: string }) {
  return (
    <div className="ui-sectionindex">
      <span className="ui-mono">{index}</span>
      <span className="ui-index">{label}</span>
      <span className="ui-rule" aria-hidden="true" />
    </div>
  );
}

export function StatementHeader({ lead, emphasis, chips }: { lead: string; emphasis?: string; chips?: React.ReactNode }) {
  return (
    <header className="ui-statement">
      <p className="ui-statement-lead">
        {lead}{emphasis ? <> <strong className="ui-statement-em">{emphasis}</strong></> : null}
      </p>
      {chips && <div className="ui-statement-chips">{chips}</div>}
    </header>
  );
}

export function Panel(props: {
  index?: string; title: string; question?: string; provenance?: Provenance;
  actions?: React.ReactNode; children: React.ReactNode; className?: string;
}) {
  const { index, title, question, provenance, actions, children, className = '' } = props;
  return (
    <section className={`ui-panel ${className}`} aria-label={title}>
      <header className="ui-panel-head">
        <div>
          <div className="ui-index">{index ? `${index} · ${title}` : title}</div>
          {question && <p className="ui-question">{question}</p>}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {provenance && <ProvenanceChip kind={provenance} />}
          {actions}
        </div>
      </header>
      {children}
    </section>
  );
}

export function KpiValue(props: {
  label: string; value: string | number; unit?: string;
  delta?: number; deltaSuffix?: string; provenance?: Provenance; children?: React.ReactNode;
}) {
  const { label, value, unit, delta, deltaSuffix = '', provenance, children } = props;
  return (
    <div className="ui-kpi">
      <div className="ui-index">{label}</div>
      <div className="ui-kpi-row">
        <span className="ui-kpi-value">{value}</span>
        {unit && <span className="ui-kpi-unit">{unit}</span>}
        {delta !== undefined && (
          <span className={`ui-delta ${delta > 0 ? 'up' : delta < 0 ? 'down' : ''}`}>
            {delta > 0 ? '▲ +' : delta < 0 ? '▼ ' : '■ '}
            {Math.abs(delta)}{deltaSuffix}
          </span>
        )}
      </div>
      {children}
      {provenance && <ProvenanceChip kind={provenance} />}
    </div>
  );
}

export function StatPod(props: {
  tone: Tone; statusLabel: string; id: string; title?: string; timestamp?: string;
  children?: React.ReactNode; action?: React.ReactNode;
}) {
  const { tone, statusLabel, id, title, timestamp, children, action } = props;
  return (
    <article className="ui-pod">
      <div className="ui-pod-top">
        <StatusDot tone={tone} label={statusLabel} />
        <span className="ui-mono">{id}</span>
      </div>
      {title && <div className="ui-pod-title">{title}</div>}
      {timestamp && <div className="ui-mono ui-muted">{timestamp}</div>}
      {children}
      {action}
    </article>
  );
}

export function EmptyState({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return <div className="dempty">{children}{action}</div>;
}

export function SkeletonBlock({ height = 120 }: { height?: number }) {
  return <div className="skel" style={{ height }} aria-busy="true" />;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="state-error" role="alert">
      <span>{message}</span>
      {onRetry && <button type="button" className="btn btn-secondary btn-sm" onClick={onRetry}>Retry</button>}
    </div>
  );
}
