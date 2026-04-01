const fs = require('fs');

const canvasPath = 'packages/atomos-prime/demos/canvas.html';
const testSchemaPath = 'packages/atomos-prime/demos/test-schema-canvas.html';
const testStepperPath = 'packages/atomos-prime/demos/test-stepper.html';

const canvasHtml = fs.readFileSync(canvasPath, 'utf8');
const navMatch = canvasHtml.match(/<nav[\s\S]*?<\/nav>/);

if (navMatch) {
  const baseNav = navMatch[0];
  
  // Create Schema Canvas Nav
  let schemaNav = baseNav.replace(
    'style="color:#38bdf8;text-decoration:none;font-weight:500;padding:4px 10px;border-radius:6px;background:#0f2744;"',
    'style="color:#94a3b8;text-decoration:none;padding:4px 10px;border-radius:6px;" onmouseover="this.style.background=\'#1e293b\'" onmouseout="this.style.background=\'\'"'
  );
  
  schemaNav = schemaNav.replace(
    />Schema Canvas<\/a>/,
    ' style="color:#38bdf8;text-decoration:none;font-weight:500;padding:4px 10px;border-radius:6px;background:#0f2744;">Schema Canvas</a>'
  );
  // remove the old attributes on Schema Canvas to avoid duplicates
  schemaNav = schemaNav.replace(/<a href="test-schema-canvas\.html"[^>]+style="color:#38bdf8/, '<a href="test-schema-canvas.html" style="color:#38bdf8');

  // Insert into Test Schema Canvas
  let testSchemaHtml = fs.readFileSync(testSchemaPath, 'utf8');
  if (!testSchemaHtml.includes('<nav')) {
      testSchemaHtml = testSchemaHtml.replace('<body>', '<body>\n  ' + schemaNav);
      // add padding-top to body
      testSchemaHtml = testSchemaHtml.replace('.demo-container {', '.demo-container {\n      padding-top: 40px;');
      fs.writeFileSync(testSchemaPath, testSchemaHtml);
  }

  // Create Stepper Canvas Nav
  let stepperNav = baseNav.replace(
    'style="color:#38bdf8;text-decoration:none;font-weight:500;padding:4px 10px;border-radius:6px;background:#0f2744;"',
    'style="color:#94a3b8;text-decoration:none;padding:4px 10px;border-radius:6px;" onmouseover="this.style.background=\'#1e293b\'" onmouseout="this.style.background=\'\'"'
  );
  stepperNav = stepperNav.replace(
    />Stepper<\/a>/,
    ' style="color:#38bdf8;text-decoration:none;font-weight:500;padding:4px 10px;border-radius:6px;background:#0f2744;">Stepper</a>'
  );
  stepperNav = stepperNav.replace(/<a href="test-stepper\.html"[^>]+style="color:#38bdf8/, '<a href="test-stepper.html" style="color:#38bdf8');

  let stepperHtml = fs.readFileSync(testStepperPath, 'utf8');
  if (!stepperHtml.includes('<nav')) {
      stepperHtml = stepperHtml.replace('<body>', '<body>\n  ' + stepperNav);
      stepperHtml = stepperHtml.replace('.demo-container {', '.demo-container {\n      margin-top: 40px;'); // body is flex column center in stepper
      fs.writeFileSync(testStepperPath, stepperHtml);
  }
}
