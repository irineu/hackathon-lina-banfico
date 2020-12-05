import express from 'express';
import UserAccountModel from '../../model/UserAccountModel.js';
import UserSecretModel from '../../model/UserAccountSecretModel.js';

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

    if(userAccount.active){
        global.log.warn(['SERVICE', 'ACCOUNT-ACTIVATION', 'Account already active.']);
        return res.error({message: 'Invalid code'}, 400);
    }

    userAccount.active = true;

    await userAccount.save();

    return res.json("OK");
});

export default route;