const col = (a: string, b: string) => ({ display: 'grid', gridTemplateColumns: `${a} ${b}`, gap: 20 } as const);

export function PageSkeleton({ route }: { route: string }) {
  const variant = route === '/' ? 'dashboard'
    : route.startsWith('/learn/lesson') ? 'lesson'
    : route.startsWith('/learn/level') ? 'level'
    : route.startsWith('/learn') ? 'curriculum'
    : route.startsWith('/practice') ? 'practice'
    : route.startsWith('/progress') ? 'progress'
    : route.startsWith('/profile') ? 'profile'
    : 'generic';

  return (
    <div
      className={variant === 'dashboard' ? 'page-inner-full' : 'page-inner'}
      style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
      aria-busy="true"
      role="status"
      aria-label="Loading page"
    >
      {variant === 'dashboard' && (
        <>
          <div className="skel" style={{ height: 40, width: '42%' }} />
          <div className="skel" style={{ height: 16, width: '58%' }} />
          <div style={col('minmax(0,7fr)', 'minmax(0,3fr)') as React.CSSProperties}>
            <div className="skel" style={{ height: 180 }} />
            <div className="skel" style={{ height: 180 }} />
          </div>
          <div className="skel" style={{ height: 56 }} />
          <div className="skel" style={{ height: 240 }} />
          <div style={col('minmax(0,3fr)', 'minmax(0,2fr)') as React.CSSProperties}>
            <div className="skel" style={{ height: 200 }} />
            <div className="skel" style={{ height: 200 }} />
          </div>
        </>
      )}

      {variant === 'curriculum' && (
        <>
          <div className="skel" style={{ height: 36, width: '46%' }} />
          <div className="skel" style={{ height: 56 }} />
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="skel" style={{ height: 24, width: '38%' }} />
              <div className="skel" style={{ height: 56 }} />
            </div>
          ))}
        </>
      )}

      {variant === 'lesson' && (
        <>
          <div className="skel" style={{ height: 32, width: '52%' }} />
          <div className="skel" style={{ height: 16, width: '30%' }} />
          <div className="skel" style={{ height: 140 }} />
          <div className="skel" style={{ height: 140 }} />
          <div className="skel" style={{ height: 96 }} />
        </>
      )}

      {variant === 'level' && (
        <>
          <div className="skel" style={{ height: 32, width: '44%' }} />
          <div className="skel" style={{ height: 96 }} />
          {[0, 1, 2].map(i => <div key={i} className="skel" style={{ height: 64 }} />)}
        </>
      )}

      {variant === 'practice' && (
        <>
          <div className="skel" style={{ height: 36, width: '40%' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            <div className="skel" style={{ height: 96 }} />
            <div className="skel" style={{ height: 96 }} />
            <div className="skel" style={{ height: 96 }} />
          </div>
          <div className="skel" style={{ height: 220 }} />
        </>
      )}

      {variant === 'progress' && (
        <>
          <div className="skel" style={{ height: 56 }} />
          <div className="skel" style={{ height: 200 }} />
          <div className="skel" style={{ height: 200 }} />
        </>
      )}

      {variant === 'profile' && (
        <>
          <div className="skel" style={{ height: 36, width: '34%' }} />
          <div className="skel" style={{ height: 56 }} />
          <div className="skel" style={{ height: 120 }} />
          <div className="skel" style={{ height: 120 }} />
        </>
      )}

      {variant === 'generic' && (
        <>
          <div className="skel" style={{ height: 32, width: '40%' }} />
          <div className="skel" style={{ height: 160 }} />
          <div className="skel" style={{ height: 160 }} />
        </>
      )}
    </div>
  );
}
