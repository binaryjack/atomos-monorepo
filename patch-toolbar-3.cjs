const fs = require('fs');
const path = require('path');

const targetPath = path.resolve(__dirname, 'packages/atomos-structura/src/preview/create-canvas-toolbar.ts');
let content = fs.readFileSync(targetPath, 'utf8');

// 1. Fix innerWidth / innerHeight
content = content.replace(
  /const screenW = window\.innerWidth;/g,
  `const screenW = toolbar.parentElement?.clientWidth || window.innerWidth;`
).replace(
  /const screenH = window\.innerHeight - 40;/g,
  `const screenH = (toolbar.parentElement?.clientHeight || window.innerHeight) - 40;`
);

// 2. Add Mobile styles
const startTarget = "const toolbar = document.createElement('div');";
const styleInjector = `const toolbar = document.createElement('div');
  const style = document.createElement('style');
  style.textContent = \`
    .vbs-toolbar {
      position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%);
      display: flex; align-items: center; gap: 8px; z-index: 30;
      background: rgba(15,23,42,0.95); backdrop-filter: blur(8px);
      border: 1px solid var(--vbs-border, #27272a); border-radius: 12px; padding: 6px;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3);
      transition: all 0.3s ease;
    }
    .vbs-more-menu {
      position: absolute; bottom: calc(100% + 12px); left: 0;
      display: flex; flex-direction: column; gap: 4px;
      background: rgba(15,23,42,0.95); backdrop-filter: blur(8px);
      border: 1px solid var(--vbs-border, #27272a); border-radius: 12px; padding: 6px;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3);
      opacity: 0; pointer-events: none; transform: translateY(10px) scale(0.95);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      transform-origin: bottom left;
    }
    .vbs-more-menu.open {
      opacity: 1; pointer-events: all; transform: translateY(0) scale(1);
    }
    .vbs-more-menu .vbs-divider {
      width: 24px !important; height: 1px !important; margin: 4px 0 !important;
    }
    .vbs-mobile-hidden {
      display: flex;
    }
    .vbs-burger-btn {
      display: none !important;
    }
    @media (max-width: 900px) {
      .vbs-mobile-hidden {
        display: none !important;
      }
      .vbs-burger-btn {
        display: flex !important;
      }
    }
  \`;
  document.head.appendChild(style);

  toolbar.className = 'vbs-toolbar';
`;

const endTargetRegex = /\n\s*\]\.join\(''\);/;
const startIdx = content.indexOf(startTarget);
const blockContent = content.substring(startIdx);
const endMatch = blockContent.match(endTargetRegex);
if (!endMatch) {
  console.log("Could not find style join block to replace.");
} else {
  const replaceLen = endMatch.index + endMatch[0].length;
  content = content.substring(0, startIdx) + styleInjector + blockContent.substring(replaceLen);
}

const assembleOriginal = /  \/\/ Assemble\s*\n\s*toolbar\.appendChild\(importInput\);[\s\S]*?return toolbar;/;

const newAssemble = `  // Assemble

  const moreMenu = document.createElement('div');
  moreMenu.className = 'vbs-more-menu';
  
  const burgerBtn = createIconButton(
    \`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>\`,
    'More Options',
    () => { moreMenu.classList.toggle('open'); }
  );
  burgerBtn.className += ' vbs-burger-btn';

  // Desktop extra buttons wrapper
  const desktopExtras = document.createElement('div');
  desktopExtras.className = 'vbs-mobile-hidden';
  desktopExtras.style.display = 'flex';
  desktopExtras.style.alignItems = 'center';
  desktopExtras.style.gap = '8px';

  // Wrap a divider function to apply desktop-only class
  const dDivider = () => {
    const d = divider();
    return d;
  };

  const migrateMenu = (e) => {
    if (e.matches) {
       // Mobile: move extras to moreMenu
       moreMenu.appendChild(importBtn);
       moreMenu.appendChild(exportBtn);
       moreMenu.appendChild(autoLayoutBtn);
       moreMenu.appendChild(divider());
       moreMenu.appendChild(saveWorkspaceBtn);
       moreMenu.appendChild(loadWorkspaceBtn);
       moreMenu.appendChild(divider());
       moreMenu.appendChild(schemaExportWrap);
       moreMenu.appendChild(exportSvgBtn);
       moreMenu.appendChild(exportPngBtn);
       moreMenu.appendChild(divider());
       moreMenu.appendChild(settingsBtn);
       desktopExtras.style.display = 'none';
    } else {
       // Desktop: move extras to desktopExtras
       moreMenu.innerHTML = '';
       desktopExtras.style.display = 'flex';
       
       desktopExtras.appendChild(importBtn);
       desktopExtras.appendChild(exportBtn);
       desktopExtras.appendChild(autoLayoutBtn);
       desktopExtras.appendChild(dDivider());
       desktopExtras.appendChild(saveWorkspaceBtn);
       desktopExtras.appendChild(loadWorkspaceBtn);
       desktopExtras.appendChild(dDivider());
       desktopExtras.appendChild(schemaExportWrap);
       desktopExtras.appendChild(exportSvgBtn);
       desktopExtras.appendChild(exportPngBtn);
       desktopExtras.appendChild(dDivider());
       desktopExtras.appendChild(settingsBtn);
       desktopExtras.appendChild(dDivider());
    }
  };

  const mq = window.matchMedia('(max-width: 900px)');
  if (mq.addEventListener) {
    mq.addEventListener('change', migrateMenu);
  } else {
    mq.addListener(migrateMenu);
  }

  // Core stable buttons
  const coreToolbar = document.createElement('div');
  coreToolbar.style.display = 'flex';
  coreToolbar.style.alignItems = 'center';
  coreToolbar.style.gap = '8px';

  coreToolbar.appendChild(undoBtn);
  coreToolbar.appendChild(redoBtn);
  coreToolbar.appendChild(divider());
  coreToolbar.appendChild(centerBtn);
  coreToolbar.appendChild(fitBtn);
  coreToolbar.appendChild(divider());
  coreToolbar.appendChild(zoomOutBtn);
  coreToolbar.appendChild(zoomLabel);
  coreToolbar.appendChild(zoomInBtn);

  // Initialize state
  migrateMenu(mq);

  toolbar.appendChild(moreMenu);
  toolbar.appendChild(burgerBtn);
  toolbar.appendChild(desktopExtras);
  
  importInput.style.display = 'none';
  workspaceLoadInput.style.display = 'none';
  toolbar.appendChild(importInput);
  toolbar.appendChild(workspaceLoadInput);

  toolbar.appendChild(coreToolbar);

  // Auto-close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!toolbar.contains(e.target)) {
      moreMenu.classList.remove('open');
    }
  });

  return toolbar;`;

// Ensure we don't accidentally do it multiple times
if (!content.includes('const moreMenu = document.createElement')) {
  let finalPass = content.replace(assembleOriginal, newAssemble);
  if (finalPass === content) {
    console.error("Assemble regex didn't replace!");
  } else {
    fs.writeFileSync(targetPath, finalPass, 'utf8');
    console.log("Successfully patched styles and assemble logic.");
  }
} else {
  console.log("Already patched.");
}
