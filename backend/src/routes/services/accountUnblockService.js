import express from 'express';
import UserAccountModel from '../../model/UserAccountModel.js';
import UserAccountContactModel from '../../model/UserAccountContactModel.js';
import UserSecretModel from '../../model/UserAccountSecretModel.js';
import * as uuid from 'uuid';

import expressValidator from 'express-validator';

const { Router } = express;
const { body, validationResult}  = expressValidator;

let route = new Router();

route.post('',[
    body('code').isLength({min: 32})
], async (req, res) => {
    
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    let userSecret = await UserSecretModel.findOne({recoveryKey: req.body.code});

    if(!userSecret){
        return res.error({message: 'Invalid code: '+ req.body.code}, 400);
    }

    let userAccount = await UserAccountModel.findOne({secret: userSecret});
    
    if(!userSecret){
        return res.error({message: 'Invalid code, internal server error.'});
    }

    if(!userAccount.blocked){
        global.log.warn(['SERVICE', 'ACCOUNT-UNBLOCK', 'Account already unblocked.']);
        return res.error({message: 'Invalid code'}, 400);
    }

    userAccount.blocked = false;
    userAccount.invalidLoginCount = 0;

    await userAccount.save();

    return res.json("OK");
});

export default route;