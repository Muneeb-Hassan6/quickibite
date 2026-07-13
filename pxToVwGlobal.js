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

    // 1. Replace arbitrary px values in tailwind classes
    const tailwindRegex = /(sm:|md:|lg:|xl:|2xl:)?([a-zA-Z0-9_-]+)-\[([^\]]+)\]/g;
    content = content.replace(tailwindRegex, (match, breakpoint, utility, innerValue) => {
      if (utility === 'border' || innerValue.includes('var(') || innerValue.includes('url(') || utility.includes('shadow') || innerValue.includes('rgba')) {
        return match;
      }

      let newInner = innerValue.replace(/(-?\d+(\.\d+)?)px/g, (pxMatch, val) => {
        const px = parseFloat(val);
        if (Math.abs(px) <= 2) return pxMatch;

        let divisor = 4.3; // Mobile: 430px viewport -> 1vw = 4.3px
        if (breakpoint) {
          if (breakpoint.startsWith('md') || breakpoint.startsWith('lg') || breakpoint.startsWith('xl')) {
            divisor = 14.4; // Desktop: 1440px -> 1vw = 14.4px
          } else if (breakpoint.startsWith('sm')) {
            divisor = 6.4; // Tablet
          }
        }
        
        let vw = round(px / divisor);
        return `${vw}vw`;
      });

      return `${breakpoint || ''}${utility}-[${newInner}]`;
    });

    // 2. Replace raw CSS px values (like in styled-components or injected style strings)
    // Match `property: 10px` or `margin: 10px 20px`
    // We only want to touch CSS strings, but doing it blindly might affect JS logic.
    // However, the regex `:\s*(-?\d+(\.\d+)?)px` is fairly safe for CSS inside template literals.
    content = content.replace(/:\s*(-?\d+(\.\d+)?)px/g, (match, val) => {
      const px = parseFloat(val);
      if (Math.abs(px) <= 2) return match;
      if (px > 1000) return match;
      let vw = round(px / 14.4);
      return `: ${vw}vw`;
    }).replace(/\s(-?\d+(\.\d+)?)px/g, (match, val) => {
      const px = parseFloat(val);
      if (Math.abs(px) <= 2) return match;
      if (px > 1000) return match;
      let vw = round(px / 14.4);
      return ` ${vw}vw`;
    });

    if (originalContent !== content) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Converted ${filePath}`);
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
console.log('Global conversion complete!');
