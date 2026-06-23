import { createNeuraStore } from './core/neura-store.js';
import type { NeuraState } from './core/neura-store.js';
import { WebGLEngine } from './renderer/webgl-engine.js';
import { CullingSystem } from './renderer/culling-system.js';

export function createNeuraInstance(canvas: HTMLCanvasElement, workerUrl: string | URL) {
  const { store, setViewport, addNodes, addEdges } = createNeuraStore();
  const webgl = new WebGLEngine(canvas);
  const culling = new CullingSystem(200);
  
  // Initialize Physics Worker
  const worker = new Worker(workerUrl, { type: 'module' });
  
  worker.onmessage = (e) => {
    if (e.data.type === 'TICK_RESULT') {
      const positions = e.data.payload as { id: string, x: number, y: number }[];
      // Update store positions
      const state = store.value;
      const nextNodes = { ...state.nodes };
      for (const pos of positions) {
        if (nextNodes[pos.id]) {
          nextNodes[pos.id] = { ...nextNodes[pos.id]!, x: pos.x, y: pos.y };
        }
      }
      store.set({ ...state, nodes: nextNodes });
    }
  };

  // Resize handler
  const resizeObserver = new ResizeObserver(entries => {
    for (const entry of entries) {
      webgl.resize(entry.contentRect.width, entry.contentRect.height);
      setViewport({ width: entry.contentRect.width, height: entry.contentRect.height });
    }
  });
  resizeObserver.observe(canvas.parentElement || canvas);

  // Input handling (Basic Pan & Zoom)
  let isDragging = false;
  let lastX = 0;
  let lastY = 0;

  canvas.addEventListener('mousedown', e => {
    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
  });

  window.addEventListener('mouseup', () => { isDragging = false; });
  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    
    const state = store.value;
    setViewport({ 
      x: state.viewport.x + dx / state.viewport.zoom, 
      y: state.viewport.y + dy / state.viewport.zoom 
    });
  });

  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    const state = store.value;
    const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1;
    setViewport({ zoom: state.viewport.zoom * zoomDelta });
  });

  // Render loop
  webgl.startLoop(() => {
    const state = store.value;
    
    // 1. Cull off-screen items
    const { visibleNodes, visibleEdges } = culling.cull(state.nodes, state.edges, state.viewport);
    
    // 2. Render visible items
    webgl.render(visibleNodes, visibleEdges, state.viewport);
  });

  // Generate Mock Data for Testing
  const generateMockData = (numNodes: number) => {
    const nodes = [];
    for (let i = 0; i < numNodes; i++) {
      // Use polar coordinates for circular initial distribution
      const r = Math.sqrt(Math.random()) * 2000;
      const theta = Math.random() * 2 * Math.PI;
      nodes.push({
        id: `n${i}`,
        x: r * Math.cos(theta),
        y: r * Math.sin(theta),
        weight: Math.random() * 5,
        appartenanceId: `cluster_${Math.floor(Math.random() * 10)}`, // More clusters
        metadata: {},
        visible: true
      });
    }
    
    const edges = [];
    for (let i = 0; i < numNodes * 1.5; i++) {
      // Bias edges to connect nodes within the same cluster occasionally
      const sourceIdx = Math.floor(Math.random() * numNodes);
      let targetIdx = Math.floor(Math.random() * numNodes);
      
      // 30% chance to force a connection in the same cluster to make physics look better
      if (Math.random() > 0.7) {
        const cluster = nodes[sourceIdx]!.appartenanceId;
        const siblings = nodes.filter(n => n.appartenanceId === cluster);
        if (siblings.length > 0) {
          targetIdx = parseInt(siblings[Math.floor(Math.random() * siblings.length)]!.id.replace('n', ''));
        }
      }

      edges.push({
        id: `e${i}`,
        sourceId: `n${sourceIdx}`,
        targetId: `n${targetIdx}`,
        weight: Math.random() * 2,
        visible: true
      });
    }

    addNodes(nodes);
    addEdges(edges);
    
    // Send data to physics engine
    worker.postMessage({ type: 'INIT_DATA', payload: { nodes, edges } });
    worker.postMessage({ type: 'START' });
  };

  return {
    store,
    webgl,
    worker,
    generateMockData,
    destroy: () => {
      resizeObserver.disconnect();
      webgl.destroy();
      worker.terminate();
    }
  };
}
