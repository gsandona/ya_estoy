const fs = require('fs');
let content = fs.readFileSync('c:/SISTEMAS/ya_estoy/backend/SistemaMozoQr.Infrastructure/Data/ModelBuilderExtensions.cs', 'utf8');

let counter = 1;
content = content.replace(/Guid\.Parse\("77777777-0000-0000-0000-000000000001"\)|Guid\.NewGuid\(\)/g, () => {
    let idStr = counter.toString().padStart(12, '0');
    counter++;
    return `Guid.Parse("88888888-8888-8888-8888-${idStr}")`;
});

fs.writeFileSync('c:/SISTEMAS/ya_estoy/backend/SistemaMozoQr.Infrastructure/Data/ModelBuilderExtensions.cs', content);
console.log('Fixed GUIDs');
