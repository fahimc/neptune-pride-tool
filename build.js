const fs = require('fs');
const minify = require('minify');

const api = fs.readFileSync('src/api.js','utf8');
const main = fs.readFileSync('src/ai.js','utf8');
const ui = fs.readFileSync('src/ai-ui.js','utf8');
const helper = fs.readFileSync('src/helper.js','utf8');
fs.writeFileSync('dist/game-ai.js', api + '\n\n' + main + '\n\n' + ui + '\n\n' + helper + '\n\nAI.init();\nGameUI.init();\nHelper.init();', 'utf8');

  minify('dist/game-ai.js', {})
    .then((content)=> fs.writeFileSync('dist/game-ai.min.js',content, 'utf8' ))
    .catch(console.error);