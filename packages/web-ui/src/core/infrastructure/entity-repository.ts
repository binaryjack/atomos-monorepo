/**
 * Infrastructure Layer - Repository Implementation
 * Handles persistence with proper error handling and caching
 */
import type { DomainEntity, DomainLink, EntityRepository, LinkRepository } from '../domain/entity-aggregate.js';

const STORAGE_KEY = 'vbe2:entities';
const LINKS_STORAGE_KEY = 'vbe2:links';

export const createInMemoryEntityRepository = function(): EntityRepository {
  const entities = new Map<string, DomainEntity>();
  
  const getById = function(id: string): DomainEntity | undefined {
    const entity = entities.get(id);
    console.log('[ENTITY-REPOSITORY] 🔍 Get entity by ID:', id, '→', entity ? 'FOUND' : 'NOT FOUND');
    if (!entity) {
      console.log('[ENTITY-REPOSITORY] 🗂️ Available entity IDs:', Array.from(entities.keys()));
    }
    return entity;
  };
  
  const save = function(entity: DomainEntity): void {
    entities.set(entity.id, entity);
  };
  
  const remove = function(id: string): void {
    entities.delete(id);
  };
  
  const getAll = function(): readonly DomainEntity[] {
    return Array.from(entities.values());
  };
  
  return { getById, save, remove, getAll };
};

export const createPersistedEntityRepository = function(): EntityRepository {
  const memoryRepo = createInMemoryEntityRepository();
  
  // Load from localStorage on initialization
  const loadFromStorage = function(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const entities = JSON.parse(stored) as DomainEntity[];
        entities.forEach(entity => memoryRepo.save(entity));
        console.log(`[EntityRepository] ✓ Loaded ${entities.length} entities from storage`);
      }
    } catch (error) {
      console.error('[EntityRepository] ✗ Failed to load from storage:', error);
    }
  };
  
  // Save to localStorage (debounced)
  let saveTimer: number | undefined;
  const SAVE_DELAY = 300; // ms
  
  const saveToStorage = function(): void {
    if (saveTimer) clearTimeout(saveTimer);
    
    saveTimer = window.setTimeout(() => {
      try {
        const entities = memoryRepo.getAll();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entities));
        console.log(`[EntityRepository] ✓ Saved ${entities.length} entities to storage`);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          console.error('[EntityRepository] ✗ Storage quota exceeded');
          // Could implement cleanup strategy here
        } else {
          console.error('[EntityRepository] ✗ Failed to save to storage:', error);  
        }
      }
      saveTimer = undefined;
    }, SAVE_DELAY);
  };
  
  // Initialize
  loadFromStorage();
  
  const getById = memoryRepo.getById;
  
  const save = function(entity: DomainEntity): void {
    memoryRepo.save(entity);
    saveToStorage();
  };
  
  const remove = function(id: string): void {
    memoryRepo.remove(id);
    saveToStorage();
  };
  
  const getAll = memoryRepo.getAll;
  
  return { getById, save, remove, getAll };
};

export const createInMemoryLinkRepository = function(): LinkRepository {
  const links = new Map<string, DomainLink>();
  
  const getById = function(id: string): DomainLink | undefined {
    return links.get(id);
  };
  
  const save = function(link: DomainLink): void {
    links.set(link.id, link);
  };
  
  const remove = function(id: string): void {
    links.delete(id);
  };
  
  const getAll = function(): readonly DomainLink[] {
    return Array.from(links.values());
  };
  
  return { getById, save, remove, getAll };
};

export const createPersistedLinkRepository = function(): LinkRepository {
  const memoryRepo = createInMemoryLinkRepository();
  
  // Load from localStorage on initialization
  const loadFromStorage = function(): void {
    try {
      const stored = localStorage.getItem(LINKS_STORAGE_KEY);
      if (stored) {
        const links = JSON.parse(stored) as DomainLink[];
        links.forEach(link => memoryRepo.save(link));
        console.log(`[LinkRepository] ✓ Loaded ${links.length} links from storage`);
      }
    } catch (error) {
      console.error('[LinkRepository] ✗ Failed to load from storage:', error);
    }
  };
  
  // Save to localStorage (debounced)
  let saveTimer: number | undefined;
  const SAVE_DELAY = 300; // ms
  
  const saveToStorage = function(): void {
    if (saveTimer) clearTimeout(saveTimer);
    
    saveTimer = window.setTimeout(() => {
      try {
        const links = memoryRepo.getAll();
        localStorage.setItem(LINKS_STORAGE_KEY, JSON.stringify(links));
        console.log(`[LinkRepository] ✓ Saved ${links.length} links to storage`);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          console.error('[LinkRepository] ✗ Storage quota exceeded');
          // Could implement cleanup strategy here
        } else {
          console.error('[LinkRepository] ✗ Failed to save to storage:', error);  
        }
      }
      saveTimer = undefined;
    }, SAVE_DELAY);
  };
  
  // Initialize
  loadFromStorage();
  console.log('[LINK-REPOSITORY] 🔧 Persisted link repository initialized');
  
  const getById = function(id: string): DomainLink | undefined {
    const link = memoryRepo.getById(id);
    console.log('[LINK-REPOSITORY] 🔍 Get link by ID:', id, '→', link ? 'found' : 'not found');
    return link;
  };
  
  const save = function(link: DomainLink): void {
    console.log('[LINK-REPOSITORY] 💾 Saving link:', link.id);
    memoryRepo.save(link);
    saveToStorage();
  };
  
  const remove = function(id: string): void {
    console.log('[LINK-REPOSITORY] 🗑️ Removing link:', id);
    memoryRepo.remove(id);
    saveToStorage();
  };
  
  const getAll = function(): readonly DomainLink[] {
    const links = memoryRepo.getAll();
    console.log('[LINK-REPOSITORY] 📋 Get all links:', links.length, 'total');
    return links;
  };
  
  return { getById, save, remove, getAll };
};

/**
 * Simple Event Bus Implementation
 * Decouples components with pub/sub pattern
 */
import type { ApplicationEvent, EventBus } from '../application/entity-service.js';

export const createEventBus = function(): EventBus {
  const handlers = new Set<(event: ApplicationEvent) => void>();
  
  const publish = function(event: ApplicationEvent): void {
    console.log(`[EventBus] Publishing ${event.type}:`, event);
    
    // Handle events asynchronously to prevent cascading updates
    setTimeout(() => {
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error(`[EventBus] Handler failed for ${event.type}:`, error);
        }
      });
    }, 0);
  };
  
  const subscribe = function(handler: (event: ApplicationEvent) => void): () => void {
    handlers.add(handler);
    console.log(`[EventBus] Subscribed handler (total: ${handlers.size})`);
    
    return function unsubscribe() {
      handlers.delete(handler);
      console.log(`[EventBus] Unsubscribed handler (total: ${handlers.size})`);
    };
  };
  
  return { publish, subscribe };
};