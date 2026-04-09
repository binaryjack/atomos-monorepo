const fs = require('fs');
let c = fs.readFileSync('packages/showcase/src/components/StructuraCanvas.tsx', 'utf8');
c = c.replace(
  'import { createKernelAdapter } from "@atomos/structura/dist/adapters/create-kernel-adapter.js";',
  'import { createKernelAdapter } from "@atomos/structura/dist/adapters/create-kernel-adapter.js";\nimport { loadPreset } from "../schema/presets";'
);
fs.writeFileSync('packages/showcase/src/components/StructuraCanvas.tsx', c);
