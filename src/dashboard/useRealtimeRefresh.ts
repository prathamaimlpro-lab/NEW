import { useEffect } from 'react';
import { isSupabaseConfigured } from '../services/supabaseClient';
import { usePlayer } from '../store/PlayerContext';

/* Real-time polish WITHOUT new infrastructure.
   - Local learner mutations already update the dashboard instantly via PlayerContext stats.
   - Cross-device/remote changes are picked up by re-using the EXISTING sync (retrySync)
     when the tab regains focus and Supabase is configured.
   - Never polls; never duplicates realtime subscriptions. */
export function useRealtimeRefresh() {
  const { syncState, retrySync } = usePlayer();
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      if (!isSupabaseConfigured()) return;
      if (syncState === 'loading') return;
      retrySync();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [syncState, retrySync]);
}
