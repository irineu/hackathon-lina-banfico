import express from 'express';
import UserAccountModel from '../../model/UserAccountModel.js';
import BankAccountModel from '../../model/BankAccount.js';
import expressValidator from 'express-validator';
import httpUtils from '../../util/http.js';

const { Router } = express;
const { body, validationResult}  = expressValidator;

let route = new Router();

route.get('/', httpUtils.filter.isLoggedIn , async (req, res) => {
    let bankAccounts =  await BankAccountModel.find({_id: { $in : req.userAccount.banks}});
    res.json(bankAccounts);
});

route.post('/', httpUtils.filter.isLoggedIn , async (req, res) => {

    let cc = req.body.cc;
    let bankAccount;
    try{
        bankAccount =  await BankAccountModel.findOne({account: cc});
        if(!bankAccount){
            return res.error(new Error('ACC_NOT_FOUND'), 404);
        }
    
        let owner = await UserAccountModel.findOne({banks: bankAccount});

    

        if(!owner){
            req.userAccount.banks.push(bankAccount);
            await req.userAccount.save();
            res.json("ok");
        }else{
            res.error(new Error('ACC_IN_USE'), 403);
        }
    }catch(e){
        res.error(new Error('UNKNOW_ERROR'), 503);
    }
});

export default route;