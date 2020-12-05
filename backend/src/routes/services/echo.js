import express from 'express';
import UserAccountModel from '../../model/UserAccountModel.js';
import UserSecretModel from '../../model/UserAccountSecretModel.js';
import expressValidator from 'express-validator';
import httpUtils from '../../util/http.js';

const { Router } = express;
const { body, validationResult}  = expressValidator;

let route = new Router();

route.get('/signed', httpUtils.filter.isLoggedIn , async (req, res) => {
    res.json('ok');
});

export default route;