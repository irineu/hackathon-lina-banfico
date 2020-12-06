import signup from './services/signupService.js';
import signin from './services/signinService.js';
import accountActivation from './services/accountActivationService.js';
import accountMissMail from './services/accountMissMailService.js';
import accountUnblock from './services/accountUnblockService.js';
import accountPassword from './services/accountPasswordService.js';
import echo from './services/echo.js';
import user from './services/userService.js';
import bank from './services/bankService.js';
import deal from './services/dealService.js';
import fs from 'fs';

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
        global.httpServer.use('/services/bank', bank);
        global.httpServer.use('/services/deal', deal);

        global.httpServer.use('/services/echo', echo);  
        
        global.httpServer.use('/members-area/*', (req, res) => {

            let d = path.resolve('../frontend/dist/hackathon-lina-banfico');
            let directory = req.originalUrl.substr(req.originalUrl.indexOf("members-area") + 12);
            console.log(d + directory, fs.existsSync(d +directory));
            try {
                if (fs.existsSync(d + directory)) {
                    console.log(d + directory, fs.existsSync(d +directory));
                    res.sendFile(`${d}${directory}`);
                }else{
                    res.sendFile(`${d}/index.html`);
                }
            } catch(err) {
                res.sendFile(`${d}/index.html`);
            }
             
        });
        
        global.httpServer.use('/*', (req, res) => {

            let d = path.resolve('../landing/dist/landing');
            try {
                if (fs.existsSync(d + req.originalUrl)) {
                    
                    res.sendFile(`${d}${req.originalUrl}`);
                }else{
                    res.sendFile(`${d}/index.html`);
                }
            } catch(err) {
                res.sendFile(`${d}/index.html`);
            }
             
        });
    }
};