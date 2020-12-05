import express from 'express';
import UserAccountModel from '../../model/UserAccountModel.js';
import UserAccountContactModel from '../../model/UserAccountContactModel.js';
import UserSecretModel from '../../model/UserAccountSecretModel.js';
import * as uuid from 'uuid';
import sendMail from '../../util/email.js';
import fs from 'fs';

import crypto from 'crypto';
import jwt from 'jsonwebtoken';

import expressValidator from 'express-validator';

const { Router } = express;
const { body, validationResult}  = expressValidator;

let route = new Router();

route.post('/check-username', [body('username').isEmail()], async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    let userAccount = await UserAccountModel.findOne({username: req.body.username});

    if(userAccount){
        return res.status(400).json({
            errors: [{ msg: 'ALREADY_EXISTS', param: 'username', location: 'body' }]
        });
    }

    res.json('OK');
});

route.post('/check-personal', [
    body('firstName').isLength({min: 3}),
    body('lastName').isLength({min:3}),
    body('birthDate').isLength({min: 1})
], async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    res.json('OK');
});

route.post('/check-phone', [
    body('contact_phone').isLength({ min: 10 }),
    body('contact_mobilePhone').isLength({ min: 10 }),
], async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    res.json('OK');
});

route.post('/check-address', [
    body('address_state').isLength({ min:  2}),
    body('address_city').isLength({ min:  2}),
    body('address_addressLine1').isLength({ min:  2}),
    body('address_zip').isLength({ min:  5}),
], async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    res.json('OK');
});

route.post('/check-password', [
    body('password').isLength({ min: 5 }),
    body('secretQuestion').isLength({ min: 5 }),
    body('secretAnswer').isLength({ min: 5 }),
], async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    res.json('OK');
});

route.post('',[
    body('username').isEmail(),
    body('firstName').isLength({min: 3}),
    body('lastName').isLength({min:3}),
    body('birthDate').isLength({min: 1}),

    body('password').isLength({ min: 5 }),
    body('secretQuestion').isLength({ min: 5 }),
    body('secretAnswer').isLength({ min: 5 }),

    body('contact_phone').isLength({ min: 10 }),
    body('contact_mobilePhone').isLength({ min: 10 }),

    body('address_state').isLength({ min:  2}),
    body('address_city').isLength({ min:  2}),
    body('address_addressLine1').isLength({ min:  2}),
    body('address_zip').isLength({ min:  5}),
], async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    let userAccount = await UserAccountModel.findOne({username: req.body.username});
    let userSecret;
    let userContact;

    if(userAccount){
        return res.status(400).json({
            errors: [{ msg: 'ALREADY_EXISTS', param: 'username', location: 'body' }]
        });
    }

    userAccount = new UserAccountModel({
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        birthDate: new Date(req.body.birthDate),
        genere: req.body.genre,
        creationDate: new Date(),
        lastLogin: null,
        invalidLoginCount: 0,
        active: false,
        blocked: false,
        forgotPassword: false,
    });

    await userAccount.save();
    
    try{
        userSecret = new UserSecretModel({
            secretQuestion: req.body.secretQuestion,
            secretAnswer: req.body.secretAnswer,
            password: crypto.createHash('md5')
			.update(req.body.password)
			.digest('hex'),
            recoveryKey: uuid.v5("ResolveHoje", uuid.v4()),
        });
    
        await userSecret.save();
    
        userContact = new UserAccountContactModel({
            contact : [
                {
                    phone: req.body.contact_phone,
                    mobilePhone: req.body.contact_mobilePhone,
                    email: req.body.username,
                }
            ],
            address: [
                {
                    country: "Brasil",
                    state: req.body.address_state,
                    city: req.body.address_city,
                    addressLine1: req.body.address_addressLine1,
                    addressLine2: req.body.address_addressLine2,
                    zip: req.body.address_zip,
                }
            ]
        });
    
        await userContact.save();
    
        userAccount.contactInformation = userContact;
        userAccount.secret = userSecret;
    
        await userAccount.save();

        try{
            let htmlMessage = fs.readFileSync('./public/email-signup.html').toString();

            htmlMessage = htmlMessage.replace(/{{url}}/g, `${global.config.link}/activate-account?code=${userSecret.recoveryKey}`);
            htmlMessage = htmlMessage.replace(/{{fullname}}/g, `${userAccount.firstName} ${userAccount.lastName}`);
            htmlMessage = htmlMessage.replace(/{{firstname}}/g, `${userAccount.firstName}`);
            
            await sendMail(userAccount.username, htmlMessage, `${global.config.link}/activate-account?code=${userSecret.recoveryKey}`, "ResolveHoje: Ative sua conta");
        }catch(e){
            global.log.error(['SERVICE', 'SIGNUP', 'SEND-EMAIL', e.stack]);
        }
        
        res.json("OK");
    }catch(e){
        global.log.error(['SERVICE', 'SIGNUP', e.stack]);

        let entities = [userAccount, userContact, userSecret];

        for (let i = 0; i < entities.length; i++) {
            const entity = entities[i];
            
            try{
                if(entity && entity._id) await entity.remove();
            }catch(eN){
                global.log.error(['SERVICE', 'SIGNUP', eN.stack]);
            }
        }

        return res.status(400).json({
            errors: [{ msg: 'Failed to create the user'}]
        });
    }
});

export default route;