import express from 'express';
import UserAccountModel from '../../model/UserAccountModel.js';
import UserAccountContactModel from '../../model/UserAccountContactModel.js';
import BankAccountModel from '../../model/BankAccount.js';
import DealModel from '../../model/DealModel.js';
import expressValidator from 'express-validator';
import httpUtils from '../../util/http.js';
import sendMail from '../../util/email.js';
import smsUtil from '../../util/sms.js';
import fs from 'fs';

const { Router } = express;
const { body, validationResult}  = expressValidator;

let route = new Router();

let pendingDeals = [];

function getTax(bankAccount, parcels){
    let tax = 0;

    if(bankAccount.lastBalance < 0){
      tax = .30;
    }else{
      tax = .05;
    }

    if(parcels > 3){
      tax -= .005;
    }

    if(parcels > 6){
      tax -= .005;
    }

    if(parcels > 10){
      tax -= .005;
    }

    if(parcels > 15){
      tax -= .0025;
    }

    if(parcels > 30){
      tax -= .0025;
    }
    return tax;
  }

route.post('/confirm', httpUtils.filter.isLoggedIn , async (req, res) => {
    let code = req.body.code;

    let dealIndex = pendingDeals.findIndex((d) => d.code == code);

    if(dealIndex > -1){

        let deal = new DealModel(pendingDeals[dealIndex]);
        await deal.save();
        pendingDeals = pendingDeals.splice(dealIndex, 1);

        let htmlMessage = fs.readFileSync('./public/deal.html').toString();
    
        htmlMessage = htmlMessage.replace(/{{fullname}}/g, `${req.userAccount.firstName} ${req.userAccount.lastName}`);
        htmlMessage = htmlMessage.replace(/{{firstname}}/g, `${req.userAccount.firstName}`);
        
        await sendMail(req.userAccount.username, htmlMessage, `Solicitacao de credito aprovada! Em algumas horas o credito estara em sua conta!`, "ResolveHoje: Confirmacao de sua solicitacao");

        res.json("ok");
    }else{
        return res.error(new Error('INVALID_CODE'), 404);
    }
});

route.post('/', httpUtils.filter.isLoggedIn , async (req, res) => {

    let bankAccount =  await BankAccountModel.findOne({_id: req.userAccount.banks[0]});
    let parcels = req.body.parcels;
    let tax = getTax(bankAccount, parcels);
    let amount = req.body.amount;
    let code = `${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}`;

    pendingDeals.push({
        userAccount: req.userAccount,
        parcels: parcels,
        tax: tax,
        amount: amount,
        code: code
    });

    let contactInfo = await UserAccountContactModel.findById(req.userAccount.contactInformation);

    smsUtil.sendCode(contactInfo.contact[0].mobilePhone, code).then(()=>{
        global.log.info("SMS Sent!");
    }).catch((e)=>{
        global.log.error(e);
    })

    res.json("ok");
});

export default route;