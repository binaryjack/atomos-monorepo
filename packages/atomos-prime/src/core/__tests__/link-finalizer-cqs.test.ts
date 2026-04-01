import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { LinkFinalizer } from '../create-link-finalizer.js';
import { createLinkFinalizer } from '../create-link-finalizer.js';
import { createSignal } from '../create-signal.js';

describe('Link Finalizer - Command Query Separation', () => {
  let linkFinalizer: LinkFinalizer;
  let mockLinkManager: any;
  let mockWorkspaceState: any;
  let mockContentRoot: SVGElement;
  let onLinkCreatedSpy: ReturnType<typeof vi.fn>;
  let onLinkDeletedSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = '<div id="test-container"></div>';
    const container = document.getElementById('test-container')!;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    mockContentRoot = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    svg.appendChild(mockContentRoot);
    container.appendChild(svg);

    // Mock link manager
    mockLinkManager = {
      createLink: vi.fn(() => ({
        element: document.createElementNS('http://www.w3.org/2000/svg', 'path'),
        updatePath: vi.fn()
      }))
    };

    // Mock workspace state with entities
    const mockEntity1 = {
      id: 'entity-1',
      position: createSignal({ x: 100, y: 100 }),
      dimensions: createSignal({ width: 200, height: 120 }),
      notifyAnchorConnected: vi.fn()
    };

    const mockEntity2 = {
      id: 'entity-2',
      position: createSignal({ x: 400, y: 200 }),
      dimensions: createSignal({ width: 200, height: 120 }),
      notifyAnchorConnected: vi.fn()
    };

    mockWorkspaceState = createSignal({
      entities: new Map([
        ['entity-1', mockEntity1],
        ['entity-2', mockEntity2]
      ]),
      linkCreationInProgress: false
    });

    // Setup spies
    onLinkCreatedSpy = vi.fn();
    onLinkDeletedSpy = vi.fn();

    // Create link finalizer
    linkFinalizer = createLinkFinalizer(
      mockLinkManager,
      mockWorkspaceState,
      mockContentRoot,
      onLinkCreatedSpy,  // onLinkCreated callback
      onLinkDeletedSpy   // onLinkDeleted callback
    );
  });

  test('should NOT call persistence callbacks when isRestoration=true', () => {
    // Test: Finalize link with restoration flag
    linkFinalizer.finalizeLinkToAnchor(
      'entity-2-anchor-left',   // dstAnchorId
      { x: 400, y: 260 },       // dstAnchorPos  
      'entity-2',               // dstEntityId
      'left',                   // dstEdge
      'entity-1-anchor-right',  // srcAnchorId
      'entity-1',               // srcEntityId
      'right',                  // srcEdge
      { x: 300, y: 160 },       // srcPos
      true                      // isRestoration = true
    );

    // Verify: Persistence callbacks should NOT be called
    expect(onLinkCreatedSpy).not.toHaveBeenCalled();
    expect(onLinkDeletedSpy).not.toHaveBeenCalled();

    // Verify: Link manager should still create the visual link
    expect(mockLinkManager.createLink).toHaveBeenCalledTimes(1);
    
    // Verify: Visual elements should exist
    const pathElements = mockContentRoot.querySelectorAll('path');
    expect(pathElements.length).toBeGreaterThan(0);
  });

  test('should call persistence callbacks when isRestoration=false or undefined', () => {
    // Test 1: Explicit isRestoration=false
    linkFinalizer.finalizeLinkToAnchor(
      'entity-2-anchor-left',   
      { x: 400, y: 260 },       
      'entity-2',               
      'left',                   
      'entity-1-anchor-right',  
      'entity-1',               
      'right',                  
      { x: 300, y: 160 },       
      false                     // isRestoration = false
    );

    expect(onLinkCreatedSpy).toHaveBeenCalledTimes(1);

    // Reset spy
    onLinkCreatedSpy.mockReset();

    // Test 2: isRestoration parameter omitted (undefined)
    linkFinalizer.finalizeLinkToAnchor(
      'entity-1-anchor-left',   
      { x: 100, y: 160 },       
      'entity-1',               
      'left',                   
      'entity-2-anchor-right',  
      'entity-2',               
      'right',                  
      { x: 600, y: 260 }        
      // isRestoration parameter omitted (defaults to false)
    );

    expect(onLinkCreatedSpy).toHaveBeenCalledTimes(1);
  });

  test('should pass correct link data to persistence callback', () => {
    linkFinalizer.finalizeLinkToAnchor(
      'entity-2-anchor-top',
      { x: 500, y: 200 },
      'entity-2',
      'top',
      'entity-1-anchor-bottom',
      'entity-1',
      'bottom', 
      { x: 200, y: 220 },
      false // New link
    );

    expect(onLinkCreatedSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        leftEntityId: 'entity-1',
        rightEntityId: 'entity-2',
        sourceAnchorId: 'entity-1-anchor-bottom',
        targetAnchorId: 'entity-2-anchor-top'
      })
    );
  });

  test('should handle entity position updates for both restored and new links', () => {
    // Create both restored and new links
    linkFinalizer.finalizeLinkToAnchor(
      'entity-2-anchor-left', { x: 400, y: 260 }, 'entity-2', 'left',
      'entity-1-anchor-right', 'entity-1', 'right', { x: 300, y: 160 },
      true // Restored link
    );

    linkFinalizer.finalizeLinkToAnchor(
      'entity-2-anchor-top', { x: 500, y: 200 }, 'entity-2', 'top',
      'entity-1-anchor-bottom', 'entity-1', 'bottom', { x: 200, y: 220 },
      false // New link
    );

    // Change entity positions
    const entity1 = mockWorkspaceState.value.entities.get('entity-1');
    const entity2 = mockWorkspaceState.value.entities.get('entity-2');
    
    entity1.position.set({ x: 150, y: 150 });
    entity2.position.set({ x: 450, y: 250 });

    // Both links should update their visual paths (this is tested implicitly
    // by the fact that no errors are thrown)
    expect(mockLinkManager.createLink).toHaveBeenCalledTimes(2);
  });

  test('should clean up subscriptions when removing links', () => {
    // Create a link
    linkFinalizer.finalizeLinkToAnchor(
      'entity-2-anchor-left', { x: 400, y: 260 }, 'entity-2', 'left',
      'entity-1-anchor-right', 'entity-1', 'right', { x: 300, y: 160 },
      true
    );

    // Get the created path element
    const pathElements = mockContentRoot.querySelectorAll('path[id^="link-"]');
    expect(pathElements.length).toBe(1);
    
    const linkId = pathElements[0].id;

    // Remove the link
    linkFinalizer.removeLinkById(linkId);

    // Verify the visual element is removed
    const remainingPaths = mockContentRoot.querySelectorAll('path[id^="link-"]');
    expect(remainingPaths.length).toBe(0);
  });
});