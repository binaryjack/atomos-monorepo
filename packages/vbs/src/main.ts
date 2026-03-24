console.log('VBS Schema Builder starting...');

// Initialize the schema builder when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('schema-builder-container');
  
  if (!container) {
    console.error('Container element not found');
    return;
  }
  
  console.log('Schema builder initialized');
  
  // Add event listeners for toolbar buttons
  const addEntityBtn = document.getElementById('add-entity');
  const addLinkBtn = document.getElementById('add-link');
  const saveSchemaBtn = document.getElementById('save-schema');
  const loadSchemaBtn = document.getElementById('load-schema');
  
  addEntityBtn?.addEventListener('click', () => {
    console.log('Add entity clicked');
    // TODO: Implement add entity functionality
  });
  
  addLinkBtn?.addEventListener('click', () => {
    console.log('Add link clicked');
    // TODO: Implement add link functionality
  });
  
  saveSchemaBtn?.addEventListener('click', () => {
    console.log('Save schema clicked');
    // TODO: Implement save schema functionality
  });
  
  loadSchemaBtn?.addEventListener('click', () => {
    console.log('Load schema clicked');
    // TODO: Implement load schema functionality
  });
});