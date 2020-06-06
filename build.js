const fs = require('fs');

const main = fs.readFileSync('src/ai.js','utf8');
const ui = fs.readFileSync('src/ai-ui.js','utf8');
fs.writeFileSync('dist/game-ai.js', main + '\n\n' + ui + '\n\nAI.init();\nGameUI.init();', 'utf8');