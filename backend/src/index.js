import * as tasks from './tasks.js'

(async () => {
    await tasks.loadCFG();
    await tasks.connectDB();
    await tasks.setupHTTPServer();
    await tasks.mapRoutes();
})();