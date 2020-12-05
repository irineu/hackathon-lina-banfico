import jwt from 'jsonwebtoken';
import UserAccountModel from '../model/UserAccountModel.js';

const filter = {
    restrictAcceptJSON: (req, res, next) => {
        next();
    },

    errorHandler: (req, res, next) => {
        res.error = (err, status, hideStack) => {
            if(err && err.stack){
                global.log.error(err);
                if(hideStack) global.log.error(err.stack);

                res.status(status || 500).json({
                    message: err.message || err || 'Internal server error',
                });
            }else{
                global.log.error(err);

                res.status(status || 500).json({
                    message: err.message || 'Internal server error'
                });
            }
        };
        next();
    },

    enableCORS: (req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', '*');
        res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
        next();
    },

    noCache: (req, res, next) => {
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Expires', '-1');
        res.header('Pragma', 'no-cache');
        next();
    },

    attachUser: async (req, res, next) => {
        let token = req.get('Auth-Token');
        if (token) {
            jwt.verify(token, global.config.crypt.secret, async (err, decoded) => {
                if (!err) {
                    let userAccount = await UserAccountModel.findById(decoded.id);
                    //let user = UserAccountModel.cache[decoded.id];
                    if (userAccount) {
                        let session = userAccount.sessions.find((el) => el.token === token);
                        if (session) {
                            req.userAccount = userAccount;
                            req.authSession = session;
                        }
                    }
                }
                next();
            });
        } else {
            next();
        }
    },

    isLoggedIn: async (req, res, next) => {
        let token = req.get('Auth-Token');
        
        if (!token) {
            return res.error(new Error('NOT_AUTHORIZED'), 401);
        }

        jwt.verify(token, global.config.crypt.secret, async (err, decoded) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    return res.error(new Error('EXPIRED_SESSION'), 401);
                } else {
                    return res.error(new Error('NOT_AUTHORIZED'), 401);
                }
            }

            let userAccount = /*UserAccountModel.cache[decoded.id] ||*/ await UserAccountModel.findById(decoded.id);

            if (err || !userAccount) {
                return res.error(new Error('NOT_AUTHORIZED'), 401);
            }

            let session = userAccount.sessions.find((el) => el.token === token);
            if (!session) {
                return res.error(new Error('NOT_AUTHORIZED'), 401);
            }

            req.userAccount = userAccount;
            req.authSession = session;
            next();
        });
    }

}

export default { filter };