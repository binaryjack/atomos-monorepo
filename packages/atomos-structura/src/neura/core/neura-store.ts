import { createSignal } from '@atomos-web/prime';

export interface NeuraNode {
  id: string;
  x: number;
  y: number;
  weight: number;
  appartenanceId: string;
  metadata: Record<string, any>;
  visible: boolean; // Managed by culling system
}

export interface NeuraEdge {
  id: string;
  sourceId: string;
  targetId: string;
  weight: number;
  visible: boolean; // Managed by culling system
}

export interface NeuraViewport {
  x: number;
  y: number;
  zoom: number;
  width: number;
  height: number;
}

export interface NeuraState {
  nodes: Record<string, NeuraNode>;
  edges: Record<string, NeuraEdge>;
  viewport: NeuraViewport;
}

export function createNeuraStore() {
  const store = createSignal<NeuraState>({
    nodes: {},
    edges: {},
    viewport: { x: 0, y: 0, zoom: 1, width: 800, height: 600 }
  });

  const setViewport = (viewport: Partial<NeuraViewport>) => {
    const state = store.value;
    store.set({
      ...state,
      viewport: { ...state.viewport, ...viewport }
    });
  };

  const addNodes = (nodes: NeuraNode[]) => {
    const state = store.value;
    const newNodes = { ...state.nodes };
    for (const node of nodes) {
      newNodes[node.id] = node;
    }
    store.set({ ...state, nodes: newNodes });
  };

  const addEdges = (edges: NeuraEdge[]) => {
    const state = store.value;
    const newEdges = { ...state.edges };
    for (const edge of edges) {
      newEdges[edge.id] = edge;
    }
    store.set({ ...state, edges: newEdges });
  };

  return {
    store,
    setViewport,
    addNodes,
    addEdges
  };
}
