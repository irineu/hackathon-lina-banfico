import express from 'express';
import expressValidator from 'express-validator';
import httpUtils from '../../util/http.js';

const { Router } = express;
const { body, validationResult}  = expressValidator;

let route = new Router();

route.get('', httpUtils.filter.isLoggedIn , async (req, res) => {

    let user = req.userAccount

    res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        lastLogin: user.lastLogin,
        activePlace: user.activePlace,
    });
});

export default route;