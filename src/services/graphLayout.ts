export interface LayoutNode { id: string; x: number; y: number; w: number; h: number; layer: number; order: number }
export interface LayoutEdge { from: string; to: string; x1: number; y1: number; x2: number; y2: number }
export interface GraphLayout { nodes: LayoutNode[]; edges: LayoutEdge[]; width: number; height: number }

export interface LayoutInputNode { id: string; prerequisiteIds: string[]; dependentIds: string[]; worldNumber: number; centrality: number }
export interface LayoutInputEdge { from: string; to: string }

const COL_W = 210;
const SLOT_H = 76;
const NODE_H = 60;
const PAD = 16;

export function layeredLayout(nodes: LayoutInputNode[], edges: LayoutInputEdge[]): GraphLayout {
  const ids = new Set(nodes.map(n => n.id));
  const prereqs = new Map(nodes.map(n => [n.id, n.prerequisiteIds.filter(p => ids.has(p))]));
  const deps = new Map(nodes.map(n => [n.id, n.dependentIds.filter(d => ids.has(d))]));

  const layer = new Map<string, number>();
  const visiting = new Set<string>();
  function depth(id: string): number {
    const cached = layer.get(id);
    if (cached !== undefined) return cached;
    if (visiting.has(id)) return 0;
    visiting.add(id);
    const ps = prereqs.get(id) ?? [];
    const l = ps.length === 0 ? 0 : 1 + Math.max(...ps.map(depth));
    visiting.delete(id);
    layer.set(id, l);
    return l;
  }
  nodes.forEach(n => depth(n.id));

  const rawLayers: string[][] = [];
  for (const n of nodes) {
    const l = layer.get(n.id) ?? 0;
    (rawLayers[l] ??= []).push(n.id);
  }
  const layers = rawLayers.filter(ls => ls && ls.length > 0);

  const worldOf = new Map(nodes.map(n => [n.id, n.worldNumber]));
  layers.forEach(ls => ls.sort((a, b) => (worldOf.get(a) ?? 0) - (worldOf.get(b) ?? 0) || a.localeCompare(b)));

  const indexOf = new Map<string, number>();
  const rebuildIndex = () => { indexOf.clear(); layers.forEach(ls => ls.forEach((id, i) => indexOf.set(id, i))); };
  rebuildIndex();
  function bary(id: string, rel: Map<string, string[]>): number {
    const rs = rel.get(id) ?? [];
    if (rs.length === 0) return indexOf.get(id) ?? 0;
    return rs.reduce((s, r) => s + (indexOf.get(r) ?? 0), 0) / rs.length;
  }
  for (let pass = 0; pass < 2; pass++) {
    for (let l = 1; l < layers.length; l++) { layers[l].sort((a, b) => bary(a, prereqs) - bary(b, prereqs)); rebuildIndex(); }
    for (let l = layers.length - 2; l >= 0; l--) { layers[l].sort((a, b) => bary(a, deps) - bary(b, deps)); rebuildIndex(); }
  }

  const byId = new Map(nodes.map(n => [n.id, n]));
  const widthOf = (c: number) => (c >= 3 ? 180 : c >= 1 ? 150 : 120);
  const layoutNodes: LayoutNode[] = [];
  layers.forEach((ls, l) => {
    ls.forEach((id, i) => {
      const n = byId.get(id)!;
      const w = widthOf(n.centrality);
      layoutNodes.push({ id, layer: l, order: i, w, h: NODE_H, x: PAD + l * COL_W + (COL_W - w) / 2, y: PAD + i * SLOT_H });
    });
  });
  const posOf = new Map(layoutNodes.map(n => [n.id, n]));
  const layoutEdges: LayoutEdge[] = [];
  for (const e of edges) {
    const a = posOf.get(e.from); const b = posOf.get(e.to);
    if (!a || !b) continue;
    layoutEdges.push({ from: e.from, to: e.to, x1: a.x + a.w, y1: a.y + a.h / 2, x2: b.x, y2: b.y + b.h / 2 });
  }
  const maxLayerLen = layers.reduce((m, ls) => Math.max(m, ls.length), 0);
  return { nodes: layoutNodes, edges: layoutEdges, width: PAD * 2 + layers.length * COL_W, height: PAD * 2 + maxLayerLen * SLOT_H };
}
