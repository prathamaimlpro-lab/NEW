const KEY = 'pixel_motion';
export type MotionPref = 'auto' | 'reduced';

export function getMotionPref(): MotionPref {
  try { return localStorage.getItem(KEY) === 'reduced' ? 'reduced' : 'auto'; } catch { return 'auto'; }
}
export function setMotionPref(p: MotionPref) {
  try { localStorage.setItem(KEY, p); } catch { /* ignore */ }
  applyMotionPref(p);
}
export function applyMotionPref(p: MotionPref = getMotionPref()) {
  const id = 'pixel-motion-override';
  let tag = document.getElementById(id) as HTMLStyleElement | null;
  if (p === 'reduced') {
    if (!tag) { tag = document.createElement('style'); tag.id = id; document.head.appendChild(tag); }
    tag.textContent = '*,*::before,*::after{transition-duration:.01ms!important;animation-duration:.01ms!important;scroll-behavior:auto!important;}';
    document.documentElement.dataset.motion = 'reduced';
  } else {
    tag?.remove();
    delete document.documentElement.dataset.motion;
  }
}
