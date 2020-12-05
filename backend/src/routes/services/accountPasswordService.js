import express from 'express';
import UserAccountModel from '../../model/UserAccountModel.js';
import UserAccountContactModel from '../../model/UserAccountContactModel.js';
import UserAccountSecretModel from '../../model/UserAccountSecretModel.js';
import * as uuid from 'uuid';

import crypto from 'crypto';
import expressValidator from 'express-validator';

import sendMail from '../../util/email.js';
import httpUtil from '../../util/http.js';

import fs from 'fs';

const { Router } = express;
const { body, validationResult}  = expressValidator;

let route = new Router();

route.post('/forgot',[
    body('username').isEmail(),
], async (req, res) => {
    
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    let userAccount = await UserAccountModel.findOne({username: req.body.username}).populate('secret');
    
    if(!userAccount){
        return res.error({message: 'USER_NOT_FOUND'}, 400); 
    }
    
    userAccount.secret.recoveryKey = uuid.v5("ResolveHoje", uuid.v4());
    userAccount.forgotPassword = true;
    userAccount.blocked = false;
    userAccount.invalidLoginCount = 0;

    await userAccount.save();
    await userAccount.secret.save();

    try{

        let htmlMessage = fs.readFileSync('./public/email-forgot.html').toString();

        htmlMessage = htmlMessage.replace(/{{url}}/g, `${global.config.link}/reset-password?code=${userAccount.secret.recoveryKey}`);
        htmlMessage = htmlMessage.replace(/{{fullname}}/g, `${userAccount.firstName} ${userAccount.lastName}`);
        htmlMessage = htmlMessage.replace(/{{firstname}}/g, `${userAccount.firstName}`);

        await sendMail(userAccount.username, htmlMessage, `${global.config.link}/reset-password?code=${userAccount.secret.recoveryKey}`, "ResolveJa: Altere sua senha");
    }catch(e){
        global.log.error(['SERVICE', 'ACCOUNT-PWD', 'FORGOT', 'SEND-EMAIL', e.stack]);
    }

    return res.json("OK");
});

route.post('/reset',[
    body('code').isLength({min: 32}),
    body('password').isLength({min: 5}),
], async (req, res) => {
    
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    let userSecret = await UserAccountSecretModel.findOne({recoveryKey: req.body.code});

    if(!userSecret){
        return res.error({message: 'INVALID_CODE'}, 400);
    }

    let userAccount = await UserAccountModel.findOne({secret: userSecret, forgotPassword: true});
    
    if(!userAccount){
        global.log.warn(['SERVICE', 'ACCOUNT-UNBLOCK', 'Account no requested password recovery.']);
        return res.error({message: 'INVALID_CODE'}, 400);
    }

    userAccount.forgotPassword = false;
    userSecret.password = crypto.createHash('md5')
    .update(req.body.password)
    .digest('hex');

    await userSecret.save();
    await userAccount.save();

    return res.json("OK");
});

route.post('/isvalid',[
    body('code').isLength({min: 32})
], async (req, res) => {
    
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    let userSecret = await UserAccountSecretModel.findOne({recoveryKey: req.body.code});

    if(!userSecret){
        return res.error({message: 'INVALID_CODE'}, 400);
    }

    let userAccount = await UserAccountModel.findOne({secret: userSecret, forgotPassword: true});
    
    if(!userAccount){
        global.log.warn(['SERVICE', 'ACCOUNT-UNBLOCK', 'Account no requested password recovery.']);
        return res.error({message: 'INVALID_CODE'}, 400);
    }

    return res.json("OK");
});

route.post('/change', httpUtil.filter.isLoggedIn,[
    body('passwordOld').isLength({ min: 5 }),
    body('passwordNew').isLength({ min: 5 }),
], async (req, res) => {
    
    //TODO get user from auth

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    let passwordOld = crypto.createHash('md5')
    .update(req.body.passwordOld)
    .digest('hex');

    let secret = await UserAccountSecretModel.findById(req.userAccount.secret);

    if(passwordOld != secret.password){
        global.log.error(['SERVICE', 'ACCOUNT-PWD', 'CHANGE', 'Passwd does not match']);
        return res.error(new Error('PASSWORD_MISMATCH'), 400);
    }

    secret.password = crypto.createHash('md5')
    .update(req.body.passwordNew)
    .digest('hex');

    try{
        await secret.save();
    }catch(e){
        global.log.error(['SERVICE', 'ACCOUNT-PWD', 'CHANGE', e.stack]);
    }
    

    return res.json("OK");
});

export default route;