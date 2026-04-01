const fs = require('fs');
const path = require('path');

const mapObjectNames = {
    '@vbs/web-ui': '@vbs/atomos-prime',
    '@vbs/core': '@vbs/atomos-structura',
    '@vbs/vbs': '@vbs/atomos-structura',
    '@vbs/vbs-mod': '@vbs/atomos-structura-core',
    '@vbs/vbs-style': '@vbs/atomos-prime-style',
    '@vbs/vbs-mcp': '@vbs/atomos-structura-mcp'
};

const mapImports = {
    '@vbs/web-ui': '@vbs/atomos-prime',
    '@vbs/vbs': '@vbs/atomos-structura',
    '@vbs/vbs-mod': '@vbs/atomos-structura-core',
    '@vbs/vbs-style': '@vbs/atomos-prime-style',
    '@vbs/vbs-mcp': '@vbs/atomos-structura-mcp',
    'web-ui': 'atomos-prime',
    'vbs': 'atomos-structura',
    'vbs-mod': 'atomos-structura-core',
    'vbs-style': 'atomos-prime-style',
    'vbs-mcp': 'atomos-structura-mcp'
};

function walkSync(dir, callback) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filepath = path.join(dir, file);
        if (fs.statSync(filepath).isDirectory()) {
            if (!filepath.includes('node_modules') && !filepath.includes('dist') && !filepath.includes('.git') && !filepath.includes('.tsbuildinfo')) {
                walkSync(filepath, callback);
            }
        } else {
            callback(filepath);
        }
    }
}

let packagesUpdated = 0;
let filesUpdated = 0;

walkSync(path.join(__dirname, 'packages'), (filepath) => {
    if (filepath.endsWith('package.json')) {
        let content = fs.readFileSync(filepath, 'utf-8');
        let json = JSON.parse(content);
        let updated = false;

        let potentialOldName = path.basename(path.dirname(filepath));
        
        let currentName = json.name;
        
        if (currentName && mapObjectNames[currentName]) {
            json.name = mapObjectNames[currentName];
            updated = true;
        }

        ['dependencies', 'devDependencies', 'peerDependencies'].forEach(depType => {
            if (json[depType]) {
                for (let dep in mapObjectNames) {
                    if (json[depType][dep]) {
                        json[depType][mapObjectNames[dep]] = json[depType][dep];
                        delete json[depType][dep];
                        updated = true;
                    }
                }
            }
        });

        if (json.name && mapObjectNames[json.name]) {
            json.name = mapObjectNames[json.name];
            updated = true;
        }

        if (updated) {
            fs.writeFileSync(filepath, JSON.stringify(json, null, 2) + '\n');
            console.log(`✅ Updated package.json: ${filepath}`);
            packagesUpdated++;
        }
    } else if (/\.(ts|tsx|js|mjs|html)$/.test(filepath)) {
        let content = fs.readFileSync(filepath, 'utf-8');
        let originalContent = content;
        for (let [oldName, newName] of Object.entries(mapImports)) {
            // Static imports/exports
            let staticRegex = new RegExp(`from ['"]${oldName}['"]`, 'g');
            content = content.replace(staticRegex, `from '${newName}'`);
            
            // Dynamic imports
            let dynRegex = new RegExp(`import\\(['"]${oldName}['"]\\)`, 'g');
            content = content.replace(dynRegex, `import('${newName}')`);

            // HTML script src / map imports
            let mapRegex3 = new RegExp(`["']${oldName}/`, 'g');
            content = content.replace(mapRegex3, `"${newName}/`);
        }
        if (content !== originalContent) {
            fs.writeFileSync(filepath, content);
            console.log(`🔄 Updated imports in: ${filepath}`);
            filesUpdated++;
        }
    }
});

console.log(`\n🎉 Process completed! Updated ${packagesUpdated} package.json files and updated imports in ${filesUpdated} source files.`);
