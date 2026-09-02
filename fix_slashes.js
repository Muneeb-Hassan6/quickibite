const fs = require('fs');
const path = require('path');
function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        if (fs.statSync(file).isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            results.push(file);
        }
    });
    return results;
}
const files = walk('C:/xampp/htdocs/quickibite/Frontend_Staff/src');
let count = 0;
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('API_BASE')) {
        let newContent = content.replace(/import\s*\{\s*API_BASE\s*\}\s*from\s*['"]([^'"]+)['"]/g, (match, p1) => {
            let forwardp1 = p1.split(String.fromCharCode(92)).join('/');
            return match.replace(p1, forwardp1);
        });
        if (content !== newContent) {
            fs.writeFileSync(file, newContent);
            count++;
        }
    }
});
console.log('Fixed ' + count + ' files.');
