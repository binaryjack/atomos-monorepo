const fs = require('fs');
const path = require('path');

const targetPath = path.resolve(__dirname, 'packages/atomos-structura/src/preview/create-canvas-toolbar.ts');
let content = fs.readFileSync(targetPath, 'utf8');

// The file is currently a mess because it wasn't replaced properly. It still has the old migrateMenu with desktopExtras inline.
// Let's completely wipe the old assemble section.
const matchStart = content.lastIndexOf('  const dDivider = () => {');
if (matchStart !== -1) {
   content = content.substring(0, matchStart);
}

// Ensure the return signature is correct at the top.
content = content.replace(
  /export const createCanvasToolbar = function\(config: CanvasToolbarConfig\): HTMLElement {/,
  `export const createCanvasToolbar = function(config: CanvasToolbarConfig): { bottomBar: HTMLElement, topBurger: HTMLElement } {`
);

// We append the clean assemble block from that point
content += `  const dDivider = () => {
    return divider();
  };

  const topBurger = document.createElement('div');
  topBurger.style.cssText = 'position:relative; display:flex; align-items:center; z-index:50;';

  const moreMenu = document.createElement('div');
  moreMenu.style.cssText = [
    'position:absolute; top:calc(100% + 8px); left:0;',
    'display:flex; flex-direction:column; gap:4px;',
    'background:rgba(15,23,42,0.95); backdrop-filter:blur(8px);',
    'border:1px solid var(--vbs-border, #27272a); border-radius:12px; padding:6px;',
    'box-shadow:0 10px 15px -3px rgba(0,0,0,0.3);',
    'opacity:0; pointer-events:none; transform:translateY(-10px) scale(0.95);',
    'transition:all 0.2s cubic-bezier(0.16, 1, 0.3, 1);',
    'transform-origin:top left;'
  ].join('');
  
  const openMenu = () => {
    moreMenu.style.opacity = '1';
    moreMenu.style.pointerEvents = 'all';
    moreMenu.style.transform = 'translateY(0) scale(1)';
  };
  const closeMenu = () => {
    moreMenu.style.opacity = '0';
    moreMenu.style.pointerEvents = 'none';
    moreMenu.style.transform = 'translateY(-10px) scale(0.95)';
  };

  let menuOpen = false;
  const burgerBtn = createIconButton(
    \`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>\`,
    'Menu',
    () => { 
      menuOpen = !menuOpen;
      if (menuOpen) openMenu(); else closeMenu();
    }
  );

  const style = document.createElement('style');
  style.textContent = '.vbs-more-menu-divider { width: 100% !important; height: 1px !important; margin: 4px 0 !important; background: var(--vbs-border, #27272a); }';
  document.head.appendChild(style);

  const hDivider = () => {
    const d = document.createElement('div');
    d.className = 'vbs-more-menu-divider';
    return d;
  };

  // Add the extras into More Menu
  moreMenu.appendChild(importBtn);
  moreMenu.appendChild(exportBtn);
  moreMenu.appendChild(autoLayoutBtn);
  moreMenu.appendChild(hDivider());
  moreMenu.appendChild(saveWorkspaceBtn);
  moreMenu.appendChild(loadWorkspaceBtn);
  moreMenu.appendChild(hDivider());
  moreMenu.appendChild(schemaExportWrap);
  moreMenu.appendChild(exportSvgBtn);
  moreMenu.appendChild(exportPngBtn);
  moreMenu.appendChild(hDivider());
  moreMenu.appendChild(settingsBtn);

  topBurger.appendChild(burgerBtn);
  topBurger.appendChild(moreMenu);

  // Hidden inputs
  importInput.style.display = 'none';
  workspaceLoadInput.style.display = 'none';
  topBurger.appendChild(importInput);
  topBurger.appendChild(workspaceLoadInput);

  document.addEventListener('click', (e) => {
    if (!topBurger.contains(e.target as Node)) {
      menuOpen = false;
      closeMenu();
    }
  });

  // Core stable buttons go to bottom bar
  toolbar.appendChild(undoBtn);
  toolbar.appendChild(redoBtn);
  toolbar.appendChild(divider());
  toolbar.appendChild(centerBtn);
  toolbar.appendChild(fitBtn);
  toolbar.appendChild(divider());
  toolbar.appendChild(zoomOutBtn);
  toolbar.appendChild(zoomLabel);
  toolbar.appendChild(zoomInBtn);

  return { bottomBar: toolbar, topBurger };
};
`;

// Remove the inline style injection from the beginning of the file since we don't need mobile mixins anymore, it's ALWAYS a burger menu.
content = content.replace(/  const style = document\.createElement\('style'\);\n  style\.textContent = `[\s\S]*?`;\n  document\.head\.appendChild\(style\);\n\n  toolbar\.className = 'vbs-toolbar';/g, '');

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Fixed file.');
