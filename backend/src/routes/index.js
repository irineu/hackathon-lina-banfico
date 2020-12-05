import signup from './services/signupService.js';
import signin from './services/signinService.js';
import accountActivation from './services/accountActivationService.js';
import accountMissMail from './services/accountMissMailService.js';
import accountUnblock from './services/accountUnblockService.js';
import accountPassword from './services/accountPasswordService.js';
import echo from './services/echo.js';
import user from './services/userService.js';

import httpUtils from '../util/http.js';

import path from 'path';

export default {
    load : () => {
        global.httpServer.use('/services/*', httpUtils.filter.noCache);
        global.httpServer.use('/services/signin', signin);
        global.httpServer.use('/services/signup', signup);
        global.httpServer.use('/services/account-activation', accountActivation);
        global.httpServer.use('/services/account-missmail', accountMissMail);
        global.httpServer.use('/services/account-unblock', accountUnblock);
        global.httpServer.use('/services/account-password', accountPassword);
        global.httpServer.use('/services/user', user);

        global.httpServer.use('/services/echo', echo);        
    }
};