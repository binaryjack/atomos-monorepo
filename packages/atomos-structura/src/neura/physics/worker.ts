export interface PhysicsNode {
  id: string;
  x: number;
  y: number;
  appartenanceId: string;
}

export interface PhysicsEdge {
  sourceId: string;
  targetId: string;
  weight: number;
}

let nodes: PhysicsNode[] = [];
let edges: PhysicsEdge[] = [];
let isRunning = false;
let globalAlpha = 1.0;
const alphaMin = 0.001;
const alphaDecay = 0.95; // cools down by 5% every tick

// Calculate centers of mass for "appartenance" groups
const calculateAppartenanceCenters = () => {
  const centers: Record<string, { sumX: number; sumY: number; count: number }> = {};
  for (const node of nodes) {
    if (!centers[node.appartenanceId]) {
      centers[node.appartenanceId] = { sumX: 0, sumY: 0, count: 0 };
    }
    const center = centers[node.appartenanceId]!;
    center.sumX += node.x;
    center.sumY += node.y;
    center.count += 1;
  }
  
  const result: Record<string, { x: number; y: number }> = {};
  for (const key in centers) {
    const center = centers[key]!;
    result[key] = {
      x: center.sumX / center.count,
      y: center.sumY / center.count
    };
  }
  return result;
};

const simulateTick = () => {
  const attractionForce = 0.05;
  const appartenanceGravity = 0.1; 

  const centers = calculateAppartenanceCenters();

  // For high density, O(N^2) repulsion is too slow in JS without QuadTree
  // So we limit repulsion to a naive sample or skip it for demo, focusing on attraction & grouping
  // 1. Attraction (Edges) - Pull linked nodes together
  for (const edge of edges) {
    // Note: To optimize, use array indices instead of find()
    // For this boilerplate, we'll keep it simple
    const source = nodes.find(n => n.id === edge.sourceId);
    const target = nodes.find(n => n.id === edge.targetId);
    if (!source || !target) continue;

    const dx = target.x - source.x;
    const dy = target.y - source.y;
    
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const restingDistance = 40; // nodes want to be 40px apart
    const diff = (dist - restingDistance) / dist;
    
    const force = diff * attractionForce * (edge.weight || 1) * globalAlpha;
    
    source.x += dx * force;
    source.y += dy * force;
    target.x -= dx * force;
    target.y -= dy * force;
  }

  // 2. Appartenance Grouping - Pull nodes towards their cluster center
  for (const node of nodes) {
    const center = centers[node.appartenanceId];
    if (center) {
      const dx = center.x - node.x;
      const dy = center.y - node.y;
      
      // Make them form a shell around the center rather than all converging to the exact center point
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const idealRadius = 600; // Large radius for high node count to spread them out
      const diff = (dist - idealRadius) / dist;
      
      node.x += dx * diff * appartenanceGravity * globalAlpha;
      node.y += dy * diff * appartenanceGravity * globalAlpha;
    }
  }

  // Optional: Global gravity to keep everything centered
  for (const node of nodes) {
    node.x -= node.x * 0.001 * globalAlpha;
    node.y -= node.y * 0.001 * globalAlpha;
  }
};

const tickLoop = () => {
  if (!isRunning) return;
  
  simulateTick();
  
  // Pack position data to send back efficiently
  const positions = nodes.map(n => ({ id: n.id, x: n.x, y: n.y }));
  self.postMessage({ type: 'TICK_RESULT', payload: positions });
  
  globalAlpha *= alphaDecay;

  if (globalAlpha < alphaMin) {
    isRunning = false; // System has cooled down and is now static
    return;
  }
  
  // Throttle physics to ~30Hz
  setTimeout(tickLoop, 33);
};

self.onmessage = (event: MessageEvent) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'INIT_DATA':
      nodes = payload.nodes.map((n: any) => ({ id: n.id, x: n.x, y: n.y, appartenanceId: n.appartenanceId }));
      edges = payload.edges.map((e: any) => ({ sourceId: e.sourceId, targetId: e.targetId, weight: e.weight }));
      globalAlpha = 1.0; // Reset heat when new data arrives
      break;
    case 'START':
      if (!isRunning) {
        isRunning = true;
        globalAlpha = 1.0; // Re-heat the system
        tickLoop();
      }
      break;
    case 'STOP':
      isRunning = false;
      break;
  }
};
