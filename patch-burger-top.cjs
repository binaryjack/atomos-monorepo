const fs = require('fs');
const path = require('path');

const targetPath = path.resolve(__dirname, 'packages/atomos-structura/src/preview/create-canvas-toolbar.ts');
let content = fs.readFileSync(targetPath, 'utf8');

// 1. We change createCanvasToolbar to return { topBarElements: HTMLElement[], bottomBar: HTMLElement }
// But wait, changing the signature breaks `create-canvas-page.ts`. Let's just return a unified wrapper? No, toolbar needs to be placed at the bottom, and top elements need to go to the top bar.
// Better: createCanvasToolbar returns an object: `{ bottomBar, topBurger }`

content = content.replace(
  `export const createCanvasToolbar = function(config: CanvasToolbarConfig): HTMLElement {`,
  `export const createCanvasToolbar = function(config: CanvasToolbarConfig): { bottomBar: HTMLElement, topBurger: HTMLElement } {`
);

const newAssemble = `  // Assemble

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
  style.textContent = \`
    .vbs-more-menu-divider { width: 100% !important; height: 1px !important; margin: 4px 0 !important; background: var(--vbs-border, #27272a); }
  \`;
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
    if (!topBurger.contains(e.target)) {
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
};`;

// Replace the previous assemble block:
const assembleOriginal = /  \/\/ Assemble[\s\S]*?return toolbar;\n\};/;
content = content.replace(assembleOriginal, newAssemble);

// Restore toolbar style to absolute bottom only
const styleOriginal = /  const toolbar = document\.createElement\('div'\);[\s\S]*?toolbar\.className = 'vbs-toolbar';/
content = content.replace(styleOriginal, `  const toolbar = document.createElement('div');
  toolbar.style.cssText = [
    'position:absolute;bottom:24px;left:50%;transform:translateX(-50%);',       
    'display:flex;align-items:center;gap:8px;z-index:30;',
    'background:rgba(15,23,42,0.95);backdrop-filter:blur(8px);',
    'border:1px solid var(--vbs-border, #27272a);border-radius:12px;padding:6px;box-shadow:0 10px 15px -3px rgba(0,0,0,0.3);'
  ].join('');
`);

fs.writeFileSync(targetPath, content, 'utf8');

// Now we need to update create-canvas-page.ts
const pagePath = path.resolve(__dirname, 'packages/atomos-structura/src/preview/create-canvas-page.ts');
let pageContent = fs.readFileSync(pagePath, 'utf8');

pageContent = pageContent.replace(
  /const toolbar = createCanvasToolbar\(\{([\s\S]*?)\}\);\n\s*root\.appendChild\(toolbar\);/,
  `const { bottomBar, topBurger } = createCanvasToolbar({$1});
    root.appendChild(bottomBar);
    
    // Inject topBurger before schemaTabs
    schemaTabs.element.insertBefore(topBurger, schemaTabs.element.firstChild);
    schemaTabs.element.style.paddingLeft = '8px'; // Give it some breathing room
`
);

fs.writeFileSync(pagePath, pageContent, 'utf8');

console.log('Patched! Desktop & Mobile burger menu moved to top before tabs. Bottom menu cleaned.');
