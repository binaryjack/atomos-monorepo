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

  // Generate Mock Data for Testing (Scale-Free Network using Barabási-Albert model)
  const generateMockData = (numNodes: number) => {
    const nodes: any[] = [];
    const edges: any[] = [];
    const degrees: Record<string, number> = {};
    let totalDegree = 0;
    const m = 2; // edges to add per new node
    const m0 = 5; // initial connected core

    for (let i = 0; i < numNodes; i++) {
      const id = `n${i}`;
      degrees[id] = 0;
      let appartenanceId = `cluster_${i}`;

      // 1. Preferential Attachment
      if (i < m0) {
        // Fully connect initial core
        for (let j = 0; j < i; j++) {
          const targetId = `n${j}`;
          edges.push({ id: `e${edges.length}`, sourceId: id, targetId, weight: 1, visible: true });
          degrees[id]!++;
          degrees[targetId]!++;
          totalDegree += 2;
        }
      } else {
        // Connect to m existing nodes, prob proportional to degree
        const targets = new Set<string>();
        let attempts = 0;
        while (targets.size < m && targets.size < i && attempts < 50) {
          attempts++;
          let r = Math.random() * totalDegree;
          let selectedTarget = `n0`;
          for (let j = 0; j < i; j++) {
            const tj = `n${j}`;
            r -= degrees[tj]!;
            if (r <= 0) {
              selectedTarget = tj;
              break;
            }
          }
          targets.add(selectedTarget);
        }

        let first = true;
        for (const targetId of targets) {
          edges.push({ id: `e${edges.length}`, sourceId: id, targetId, weight: 1, visible: true });
          degrees[id]!++;
          degrees[targetId]!++;
          totalDegree += 2;

          if (first) {
            // Inherit cluster from primary attachment
            const targetNode = nodes.find(n => n.id === targetId);
            if (targetNode) appartenanceId = targetNode.appartenanceId;
            first = false;
          }
        }
      }

      // 2. Initial Layout (Physics will pull them into place)
      const r_pos = Math.sqrt(Math.random()) * 2000;
      const theta = Math.random() * 2 * Math.PI;

      nodes.push({
        id,
        x: r_pos * Math.cos(theta),
        y: r_pos * Math.sin(theta),
        weight: 0, 
        appartenanceId,
        metadata: {},
        visible: true
      });
    }

    // 3. Normalize Weights based on Final Degrees
    let maxDegree = 1;
    for (const key in degrees) {
      if (degrees[key]! > maxDegree) maxDegree = degrees[key]!;
    }
    for (const n of nodes) {
      const degree = degrees[n.id] || 0;
      n.weight = Math.max(0.1, degree / maxDegree);
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
