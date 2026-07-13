const fs = require('fs');
const path = require('path');

const directoryPath = 'Frontend_Customer/src';

function round(num) {
  return Math.round(num * 1000) / 1000;
}

function processFile(filePath) {
  if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // 1. Adjust Tailwind classes
    const tailwindRegex = /(sm:|md:|lg:|xl:|2xl:)?([a-zA-Z0-9_-]+)-\[([^\]]+)\]/g;
    content = content.replace(tailwindRegex, (match, breakpoint, utility, innerValue) => {
      let newInner = innerValue.replace(/(-?\d+(\.\d+)?)vw/g, (vwMatch, val) => {
        let vw = parseFloat(val);
        let px;
        
        if (breakpoint && (breakpoint.startsWith('md') || breakpoint.startsWith('lg') || breakpoint.startsWith('xl') || breakpoint.startsWith('2xl'))) {
           px = vw * 19.2; // Desktop divisor
        } else if (breakpoint && breakpoint.startsWith('sm')) {
           px = vw * 6.4; // Tablet divisor
        } else {
           px = vw * 4.3; // Mobile divisor
        }

        let rem = round(px / 16);
        return `${rem}rem`;
      });
      return `${breakpoint || ''}${utility}-[${newInner}]`;
    });

    // 2. Adjust pure CSS strings (e.g., SliderStyles.js)
    content = content.replace(/:\s*(-?\d+(\.\d+)?)vw/g, (match, val) => {
      const vw = parseFloat(val);
      const px = vw * 19.2;
      const rem = round(px / 16);
      return `: ${rem}rem`;
    }).replace(/\s(-?\d+(\.\d+)?)vw/g, (match, val) => {
      const vw = parseFloat(val);
      const px = vw * 19.2;
      const rem = round(px / 16);
      return ` ${rem}rem`;
    });

    if (originalContent !== content) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Converted to REM: ${filePath}`);
    }
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else {
      processFile(fullPath);
    }
  }
}

walkDir(directoryPath);
console.log('Conversion to REM complete! Sizing restored to standard scale.');
