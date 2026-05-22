const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk(srcDir);

files.forEach(file => {
    if (file.includes('environments')) return;
    
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('yaestoy.onrender.com')) {
        // Calculate relative path to environments/environment
        const envPath = path.join(srcDir, 'environments', 'environment');
        let relPath = path.relative(path.dirname(file), envPath).replace(/\\/g, '/');
        if (!relPath.startsWith('.')) relPath = './' + relPath;
        
        // Add import
        if (!content.includes('import { environment }')) {
            content = import { environment } from '';\n + content;
        }
        
        // Replace occurrences
        content = content.replace(/'https:\/\/yaestoy\.onrender\.com/g, 'environment.apiUrl + \'');
        content = content.replace(/https:\/\/yaestoy\.onrender\.com/g, '${environment.apiUrl}');
        
        fs.writeFileSync(file, content);
        console.log('Updated ' + file);
    }
});
