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

    // 1. Adjust Tailwind desktop vw classes
    const tailwindRegex = /(sm:|md:|lg:|xl:|2xl:)?([a-zA-Z0-9_-]+)-\[([^\]]+)\]/g;
    content = content.replace(tailwindRegex, (match, breakpoint, utility, innerValue) => {
      let newInner = innerValue.replace(/(-?\d+(\.\d+)?)vw/g, (vwMatch, val) => {
        let vw = parseFloat(val);
        
        // Only adjust desktop breakpoints.
        if (breakpoint && (breakpoint.startsWith('md') || breakpoint.startsWith('lg') || breakpoint.startsWith('xl'))) {
           // We used 14.4 divisor. User is likely on 1920 screen. 
           // We need to multiply by 14.4/19.2 = 0.75
           vw = round(vw * 0.75);
           return `${vw}vw`;
        }
        return vwMatch; // mobile unchanged
      });
      return `${breakpoint || ''}${utility}-[${newInner}]`;
    });

    // 2. Adjust pure CSS strings (e.g., SliderStyles.js)
    // CSS strings were all divided by 14.4. So multiply all by 0.75
    content = content.replace(/:\s*(-?\d+(\.\d+)?)vw/g, (match, val) => {
      const vw = parseFloat(val);
      let adjusted = round(vw * 0.75);
      return `: ${adjusted}vw`;
    }).replace(/\s(-?\d+(\.\d+)?)vw/g, (match, val) => {
      const vw = parseFloat(val);
      let adjusted = round(vw * 0.75);
      return ` ${adjusted}vw`;
    });

    if (originalContent !== content) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Adjusted ${filePath}`);
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
console.log('Adjustment complete! VW sizes scaled down by 25% for 1920px screens.');
