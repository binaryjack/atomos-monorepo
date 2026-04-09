const fs = require('fs');
const file = 'packages/showcase/src/components/StructuraCanvas.tsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace('id: entity--1,', 'id: `entity-${preset}-1`,');
c = c.replace('code: code--1,', 'code: `code-${preset}-1`,');
c = c.replace('name: ${preset.toUpperCase()} Schema Demo,', 'name: `${preset.toUpperCase()} Schema Demo`,');
c = c.replace('nodeType:ox,', "nodeType: 'box',");

fs.writeFileSync(file, c);
console.log('done');
