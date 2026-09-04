import { Icon } from '../components/common/Icon';
import { Chip } from '../components/common/ui';
import { achievementsData } from '../data/achievements';
import { usePlayer } from '../store/PlayerContext';

export default function Achievements() {
  const { stats } = usePlayer();
  return (
    <>
      <section>
        <div className="label-mono" style={{ marginBottom: 8 }}>MILESTONES</div>
        <h1 className="t-hlg" style={{ marginBottom: 8 }}>Verified Achievements</h1>
        <p className="t-body-lg">{stats.unlockedAchievements.length} of {achievementsData.length} unlocked. Achievements are earned exclusively through verified activity.</p>
      </section>
      <section className="grid-3">
        {achievementsData.map(a => {
          const unlocked = stats.unlockedAchievements.includes(a.id);
          return (
            <div key={a.id} className="card" style={{ display: 'flex', gap: 14, alignItems: 'flex-start', opacity: unlocked ? 1 : .5 }}>
              <span style={{ color: unlocked ? 'var(--success)' : 'var(--fg-subtle)', flex: 'none', marginTop: 2 }}><Icon name={unlocked ? a.icon : 'lock'} size={20} /></span>
              <div style={{ flex: 1 }}>
                <div className="t-body" style={{ color: 'var(--fg-primary)', fontWeight: 600 }}>{a.title}</div>
                <p className="t-body-sm" style={{ marginTop: 4 }}>{a.description}</p>
              </div>
              {a.xp > 0 && <Chip tone={unlocked ? 'success' : 'default'}>+{a.xp} XP</Chip>}
            </div>
          );
        })}
      </section>
    </>
  );
}
