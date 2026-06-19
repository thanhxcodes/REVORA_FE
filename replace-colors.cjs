const fs = require('fs');
const path = require('path');

const replacements = [
  { oldStr: /#2D5A3D/gi, newStr: '#3B8256' }, // Main
  { oldStr: /#234830/gi, newStr: '#2D6341' }, // Hover
  { oldStr: /#3D7054/gi, newStr: '#4CA66B' }  // Lighter
];

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const rule of replacements) {
        if (rule.oldStr.test(content)) {
          content = content.replace(rule.oldStr, rule.newStr);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated:', fullPath);
      }
    }
  }
}

const targetDir = path.join(__dirname, 'src');
console.log('Starting replacement in', targetDir);
processDirectory(targetDir);
console.log('Done!');
