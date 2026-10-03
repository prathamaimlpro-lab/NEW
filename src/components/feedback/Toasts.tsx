import { useEffect, useState } from 'react';

export interface ToastMsg { id: number; text: string }
let nextId = 1;

/* Tiny event-based toast bus: any component can call toast("…") without prop drilling. */
export function toast(text: string) {
  window.dispatchEvent(new CustomEvent('pixel-toast', { detail: text }));
}

export function Toasts() {
  const [items, setItems] = useState<ToastMsg[]>([]);

  useEffect(() => {
    const on = (e: Event) => {
      const text = (e as CustomEvent<string>).detail;
      const id = nextId++;
      setItems(prev => [...prev.slice(-2), { id, text }]);
      window.setTimeout(() => setItems(prev => prev.filter(t => t.id !== id)), 4000);
    };
    window.addEventListener('pixel-toast', on);
    return () => window.removeEventListener('pixel-toast', on);
  }, []);

  if (items.length === 0) return null;
  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {items.map(t => <div key={t.id} className="toast">{t.text}</div>)}
    </div>
  );
}
