import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createWorkspaceManager } from '../create-workspace-manager.js';
import type { WorkspaceManager } from '../types/workspace-manager.types.js';

describe('Link Restoration', () => {
  let workspace: WorkspaceManager;
  let mockSvg: SVGSVGElement;
  let mockContentRoot: SVGElement;
  let onLinkCreatedSpy: ReturnType<typeof vi.fn>;
  let onLinkDeletedSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Create mock SVG elements
    document.body.innerHTML = '<div id="test-container"></div>';
    const container = document.getElementById('test-container')!;
    
    mockSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    mockContentRoot = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    mockContentRoot.id = 'content-root';
    mockSvg.appendChild(mockContentRoot);
    container.appendChild(mockSvg);

    // Create workspace manager
    workspace = createWorkspaceManager(mockSvg, mockContentRoot);

    // Set up spies for callbacks
    onLinkCreatedSpy = vi.fn();
    onLinkDeletedSpy = vi.fn();
    
    (workspace as any).onLinkCreated = onLinkCreatedSpy;
    (workspace as any).onLinkDeleted = onLinkDeletedSpy;
  });

  test('should not trigger persistence callbacks during link restoration', () => {
    // Setup: Create mock entities first
    const mockEntity1 = {
      id: 'entity-1',
      position: { value: { x: 100, y: 100 } },
      dimensions: { value: { width: 200, height: 120 } },
      notifyAnchorConnected: jest.fn(),
      cleanup: jest.fn()
    };
    
    const mockEntity2 = {
      id: 'entity-2', 
      position: { value: { x: 400, y: 200 } },
      dimensions: { value: { width: 200, height: 120 } },
      notifyAnchorConnected: jest.fn(),
      cleanup: jest.fn()
    };

    // Add entities to workspace state manually
    workspace.workspaceState.set({
      ...workspace.workspaceState.value,
      entities: new Map([
        ['entity-1', mockEntity1 as any],
        ['entity-2', mockEntity2 as any]
      ])
    });

    // Test: Restore a link
    workspace.restoreLink(
      'entity-1-anchor-right',  // srcAnchorId
      { x: 300, y: 160 },       // srcPos
      'entity-1',               // srcEntityId  
      'right',                  // srcEdge
      'entity-2-anchor-left',   // dstAnchorId
      { x: 400, y: 260 },       // dstPos
      'entity-2',               // dstEntityId
      'left'                    // dstEdge
    );

    // Verify: Persistence callbacks should NOT have been called
    expect(onLinkCreatedSpy).not.toHaveBeenCalled();
    expect(onLinkDeletedSpy).not.toHaveBeenCalled();

    // Verify: Visual link should exist in DOM
    const linkElements = mockContentRoot.querySelectorAll('[id^="link-"]');
    expect(linkElements.length).toBeGreaterThan(0);
  });

  test('should trigger persistence callbacks for user-created links', () => {
    // Setup: Create mock entities
    const mockEntity1 = {
      id: 'entity-1',
      position: { value: { x: 100, y: 100 } },
      dimensions: { value: { width: 200, height: 120 } },
      notifyAnchorConnected: jest.fn(),
      cleanup: jest.fn()
    };
    
    const mockEntity2 = {
      id: 'entity-2',
      position: { value: { x: 400, y: 200 } }, 
      dimensions: { value: { width: 200, height: 120 } },
      notifyAnchorConnected: jest.fn(),
      cleanup: jest.fn()
    };

    workspace.workspaceState.set({
      ...workspace.workspaceState.value,
      entities: new Map([
        ['entity-1', mockEntity1 as any],
        ['entity-2', mockEntity2 as any]
      ])
    });

    // Test: Create a new user link (simulate user interaction)
    workspace.finalizeLinkToAnchor(
      'entity-2-anchor-left',   // dstAnchorId
      { x: 400, y: 260 },       // dstAnchorPos
      'entity-2',               // dstEntityId
      'left',                   // dstEdge
      'entity-1-anchor-right',  // srcAnchorId  
      { x: 300, y: 160 },       // srcPos
      'entity-1',               // srcEntityId
      'right'                   // srcEdge
    );

    // Verify: Persistence callback should have been called for new links
    expect(onLinkCreatedSpy).toHaveBeenCalledTimes(1);
    expect(onLinkCreatedSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        leftEntityId: 'entity-1',
        rightEntityId: 'entity-2',
        sourceAnchorId: 'entity-1-anchor-right',
        targetAnchorId: 'entity-2-anchor-left'
      })
    );
  });

  test('should prevent infinite loops when restoring multiple links', () => {
    // Setup: Create mock entities
    const entities = new Map();
    for (let i = 1; i <= 3; i++) {
      entities.set(`entity-${i}`, {
        id: `entity-${i}`,
        position: { value: { x: i * 200, y: 100 } },
        dimensions: { value: { width: 180, height: 100 } },
        notifyAnchorConnected: jest.fn(),
        cleanup: jest.fn()
      });
    }

    workspace.workspaceState.set({
      ...workspace.workspaceState.value,
      entities
    });

    // Test: Restore multiple links rapidly
    const linkConfigs = [
      ['entity-1', 'entity-2'],
      ['entity-2', 'entity-3'], 
      ['entity-1', 'entity-3']
    ];

    // This should not cause infinite loops
    linkConfigs.forEach(([src, dst], index) => {
      workspace.restoreLink(
        `${src}-anchor-right`,    // srcAnchorId
        { x: 100 + index * 50, y: 150 }, // srcPos
        src,                      // srcEntityId
        'right',                  // srcEdge
        `${dst}-anchor-left`,     // dstAnchorId 
        { x: 200 + index * 50, y: 150 }, // dstPos
        dst,                      // dstEntityId
        'left'                    // dstEdge
      );
    });

    // Verify: No persistence callbacks triggered
    expect(onLinkCreatedSpy).not.toHaveBeenCalled();
    
    // Verify: All visual links created
    const linkElements = mockContentRoot.querySelectorAll('[id^="link-"]');
    expect(linkElements.length).toBe(linkConfigs.length * 2); // Each link creates path + label
  });

  test('should clean up properly without memory leaks', () => {
    // Setup: Create entities and links
    const mockEntity1 = {
      id: 'entity-1',
      position: { 
        value: { x: 100, y: 100 },
        subscribe: jest.fn(() => jest.fn()) // Return unsubscribe function
      },
      dimensions: { 
        value: { width: 200, height: 120 },
        subscribe: jest.fn(() => jest.fn())
      },
      notifyAnchorConnected: jest.fn(),
      cleanup: jest.fn()
    };

    workspace.workspaceState.set({
      ...workspace.workspaceState.value,
      entities: new Map([['entity-1', mockEntity1 as any]])
    });

    // Restore a link
    workspace.restoreLink(
      'entity-1-anchor-right',
      { x: 300, y: 160 },
      'entity-1', 
      'right',
      'entity-1-anchor-left',
      { x: 100, y: 160 },
      'entity-1',
      'left'
    );

    // Verify subscriptions were created
    expect(mockEntity1.position.subscribe).toHaveBeenCalled();
    expect(mockEntity1.dimensions.subscribe).toHaveBeenCalled();

    // Test cleanup
    workspace.cleanup.destroy();

    // Verify no exceptions thrown during cleanup
    expect(true).toBe(true); // Test passes if no exceptions
  });
});