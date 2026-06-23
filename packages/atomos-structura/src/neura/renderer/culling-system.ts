import type { NeuraNode, NeuraEdge, NeuraViewport } from '../core/neura-store.js';

/**
 * Spatial Index and Culling System
 * Handles "Render-In-Range" and Semantic Zooming ("In-Depth Swapping")
 */
export class CullingSystem {
  private overflowPadding: number; // Extra pixels to render outside viewport to avoid clipping during pan

  constructor(padding: number = 200) {
    this.overflowPadding = padding;
  }

  /**
   * Filters out nodes and edges that are not visible within the padded viewport.
   */
  public cull(
    nodes: Record<string, NeuraNode>,
    edges: Record<string, NeuraEdge>,
    viewport: NeuraViewport
  ): { visibleNodes: NeuraNode[], visibleEdges: NeuraEdge[] } {
    
    // Calculate padding dynamically based on zoom (more padding when zoomed out)
    const padding = this.overflowPadding / Math.min(1.0, viewport.zoom);
    const minX = viewport.x - padding;
    const maxX = viewport.x + viewport.width / viewport.zoom + padding;
    const minY = viewport.y - padding;
    const maxY = viewport.y + viewport.height / viewport.zoom + padding;

    // For a highly dynamic force graph, sometimes nodes fly out fast. 
    // To prevent the "square slice" look entirely on high density mock data,
    // we can use a massive padding.
    const massivePadding = 5000;

    const visibleNodes: NeuraNode[] = [];
    const visibleNodeIds = new Set<string>();

    // 1. Cull Nodes (and determine semantic zoom level)
    for (const key in nodes) {
      const node = nodes[key]!;
      // Very lenient bounding box to prevent square cut-offs
      if (node.x >= minX - massivePadding && node.x <= maxX + massivePadding && 
          node.y >= minY - massivePadding && node.y <= maxY + massivePadding) {
        visibleNodes.push(node);
        visibleNodeIds.add(node.id);
      }
    }

    // 2. Cull Edges (only render if both source and target are visible, or at least one is)
    const visibleEdges: NeuraEdge[] = [];
    for (const key in edges) {
      const edge = edges[key]!;
      if (visibleNodeIds.has(edge.sourceId) && visibleNodeIds.has(edge.targetId)) {
        visibleEdges.push(edge);
      }
    }

    return { visibleNodes, visibleEdges };
  }
}
