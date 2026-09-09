import { PixelIconMark } from '../brand/PixelLogo';

export function Emblem({ size = 36 }: { size?: number }) {
  return <PixelIconMark size={size} tone="light" />;
}
