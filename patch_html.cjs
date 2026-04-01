const fs = require('fs');
const path = require('path');
const dir = 'd:/Sources/vbe2/packages/atomos-prime/demos';

fs.readdirSync(dir).filter(f => f.endsWith('.html')).forEach(file => {
    const filePath = path.join(dir, file);
    let original = fs.readFileSync(filePath, 'utf8');
    let modified = original;

    // Fix imports
    modified = modified.replace(/"@binaryjack\/formular\.dev":\s*".*?"/g, '"@binaryjack/formular.dev": "/formular-dev/dist/formular-dev.es.js",\n      "@atomos/structura-core": "/atomos-structura-core/dist/index.js",\n      "@atomos/prime-style": "/atomos-prime-style/dist/index.js"');
    modified = modified.replace(/"@vbs\/vbs-mod":\s*".*?"/g, '"@atomos/structura-core": "/atomos-structura-core/dist/index.js"');
    
    // Fix module path
    modified = modified.replace(/'\.\/dist\//g, "'/atomos-prime/dist/");
    modified = modified.replace(/"\.\/dist\//g, "\"/atomos-prime/dist/");

    if (original !== modified) {
        fs.writeFileSync(filePath, modified);
        console.log(`Updated ${file}`);
    }
});