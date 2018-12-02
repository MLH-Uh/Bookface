const app = {};
console.log('[Main] Initializing...');
require('./server.js').init(app,3000);
require('./facebook.js').init(app);