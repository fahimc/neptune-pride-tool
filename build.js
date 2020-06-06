const fs = require('fs');

const main = fs.readFileSync('src/main.js','utf8');
const ui = fs.readFileSync('src/ui.js','utf8');
fs.writeFileSync('dist/game-ai.js', main + '\n\n' + ui + '\n\nGameStats.init();', 'utf8');