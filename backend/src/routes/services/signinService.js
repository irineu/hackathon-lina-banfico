import express from 'express';
import UserAccountModel from '../../model/UserAccountModel.js';
import * as uuid from 'uuid';

import crypto from 'crypto';
import jwt from 'jsonwebtoken';

import sendMail from '../../util/email.js';
import expressValidator from 'express-validator';
import fs from 'fs';

const { Router } = express;
const { body, validationResult}  = expressValidator;

let route = new Router();

route.post('',[
    body('username').isEmail(),
    body('password').isLength({ min: 5 }),
], async (req, res) => {
    
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    let credentials = {
		username: req.body.username,
		password: crypto.createHash('md5')
			.update(req.body.password)
			.digest('hex'),
    };
    
    try{
        let userAccount = await UserAccountModel.findOne({username: credentials.username}).populate('secret');
        if(!userAccount){
            return res.error(new Error('INVALID_USERNAME_OR_PASSWORD'), 400);
        }

        if(userAccount.blocked){
            return res.error(new Error('ACCOUNT_BLOCKED'), 400);
            //TODO add last retry
            //TODO add resend after 5min
        }

        if(!userAccount.active){

            //TODO create a new endpoint for this
            try{
                let htmlMessage = fs.readFileSync('./public/email-signup.html').toString();
    
                htmlMessage = htmlMessage.replace(/{{url}}/g, `${global.config.link}/activate-account?code=${userAccount.secret.recoveryKey}`);
                htmlMessage = htmlMessage.replace(/{{fullname}}/g, `${userAccount.firstName} ${userAccount.lastName}`);
                htmlMessage = htmlMessage.replace(/{{firstname}}/g, `${userAccount.firstName}`);
                
                await sendMail(userAccount.username, htmlMessage, `${global.config.link}/activate-account?code=${userAccount.secret.recoveryKey}`, "ResolveHoje: Ative sua conta");
            }catch(e){
                global.log.error(['SERVICE', 'SIGNUP', 'SEND-EMAIL', e.stack]);
            }

            return res.error(new Error('ACCOUNT_NOT_ACTIVE'), 400);
        }

        if(userAccount.forgotPassword){
            return res.error(new Error('RESET_PASSWORD_IN_PROCESS'), 400);
        }

        if(userAccount.secret.password != credentials.password){
            userAccount.invalidLoginCount++;

            if(userAccount.invalidLoginCount >= 5){
                userAccount.blocked = true;
                userAccount.secret.recoveryKey = uuid.v5("ResolveHoje", uuid.v4());
                await userAccount.secret.save();
                await userAccount.save();
                
                //TODO try again later

                try{

                    let htmlMessage = fs.readFileSync('./public/email-unblock.html').toString();
            
                    htmlMessage = htmlMessage.replace(/{{url}}/g, `${global.config.link}/unblock-account?code=${userAccount.secret.recoveryKey}`);
                    htmlMessage = htmlMessage.replace(/{{fullname}}/g, `${userAccount.firstName} ${userAccount.lastName}`);
                    htmlMessage = htmlMessage.replace(/{{firstname}}/g, `${userAccount.firstName}`);
            
                    await sendMail(userAccount.username, htmlMessage, `${global.config.link}/unblock-account?code=${userAccount.secret.recoveryKey}`, "ResolveHoje: Bloqueio de seguranca");
                }catch(e){
                    global.log.error(['SERVICE', 'ACCOUNT-PWD', 'FORGOT', 'SEND-EMAIL', e.stack]);
                }

                return res.error(new Error('ACCOUNT_BLOCKED'), 400);
            }else{
                await userAccount.save();
                return res.error(new Error('INVALID_USERNAME_OR_PASSWORD'), 400);
            }
        }

        userAccount.lastLogin = new Date();
        userAccount.invalidLoginCount = 0;

        let opts = {};
        opts.expiresIn = '7d';

        let session = {
			origin: req.get('user-agent'),
			ip: req.ip,
			creationDate: new Date(),
			lastUpdate: new Date(),
			token: jwt.sign({id: userAccount._id}, global.config.crypt.secret, opts),
        };
        
        if (userAccount.sessions.length > 5){
			userAccount.sessions = userAccount.sessions.slice(0, 4);
        }
        
        userAccount.sessions.unshift(session);

        await userAccount.save();
        //TODO add to cache

        return res.json(session.token);

    }catch(e){
        global.log.error(['SERVICE', 'SIGNIN', e.stack]);
        return res.error(e);
    }

});

export default route;