'use strict';
var userLogic = require('../helpers/user');
var userModel = require('../models/user').createNew();


exports.login = function(req, res, next) {
    if (!req.paramlist.username) {
        return response.err(req, res, 'MISSING_PARAMETERS', 'username');
    }
    if (!req.paramlist.password) {
        return response.err(req, res, 'MISSING_PARAMETERS', 'password');
    }
    // here may need captcha!
    userModel.getItem({
        username: req.paramlist.username,
        password: req.paramlist.password
    }, function(err, resp) {
        if (err || !resp || !resp._id)
            return response.err(req, res, 'USER_LOGIN_FAIL');

        var user = userLogic.output(resp);
        req.sessionStore.user = req.sessionStore.user || {};
        req.sessionStore.user[req.sessionID] = user.uid;
        
        return response.ok(req, res, user);
    });
};

exports.logout = function(req, res, next) {
    req.session.destroy();
    return response.ok(req, res, 'logout success');
};

exports.signup = function(req, res, next) {
    if (!req.paramlist.username) {
        return response.err(req, res, 'MISSING_PARAMETERS', 'username');
    }
    if (!req.paramlist.password) {
        return response.err(req, res, 'MISSING_PARAMETERS', 'password');
    }
    // Captcha
    req.sessionStore.captcha = req.sessionStore.captcha || {};
    var captcha = '1111' || req.sessionStore.captcha[req.sessionID];
    req.sessionStore.captcha[req.sessionID] = '';
    if (!req.paramlist.captcha || req.paramlist.captcha !== captcha) {
        return response.err(req, res, 'USER_CAPTCHA_WRONG');
    }
    
    userModel.getItem({
        username: req.paramlist.username
    }, function(err, resp) {
        if (err) {
            return response.err(req, res, 'INTERNAL_DB_OPT_FAIL');
        }
        if (resp) {
            return response.err(req, res, 'USER_ALREADY_EXIST');
        }

        var profile = {};
        profile.username = req.paramlist.username;
        profile.password = req.paramlist.password;
        
        if (req.paramlist.detail) {
            try {
                profile.detail = JSON.parse(req.paramlist.detail);
            }
            catch (e) {
                return response.err(req, res, 'INTERNAL_INVALIDE_DATAFORMAT', 'detail');
            }
        }
        
        userModel.insert(profile, function(err, resp) {
            if (err)
                return response.err(req, res, 'INTERNAL_DB_OPT_FAIL');

            var user = userLogic.output(resp[0]);
            return response.ok(req, res, user);
        });
    });
};

exports.auth = function(req, res, next) {
    console.log('============' + req.sessionID + '===============');
    req.sessionStore.user = req.sessionStore.user || {};
    if (req.sessionStore.user[req.sessionID]) {
        next();
    }
    else {
        response.err(req, res, 'USER_TOKEN_EXPIRE');
    }
};

exports.getDetail = function(req, res, next) {
    req.sessionStore.user = req.sessionStore.user || {};
    var filter = {};
    if (req.paramlist.uid) {
        filter._id = ObjectID(req.paramlist.uid);
    }
    else if (req.paramlist.username) {
        filter.username = req.paramlist.username;
    }
    else {
        filter._id = ObjectID(req.sessionStore.user[req.sessionID]);
    }
    userModel.getItem(filter, function(err, account) {
        if (err) {
            return response.err(req, res, 'INTERNAL_DB_OPT_FAIL');
        }
        if (!account) {
            return response.err(req, res, 'USER_USERNAME_NOT_EXIST');
        }
        account.password = undefined;
        delete account.password;
        return response.ok(req, res, account);
    });
};

exports.foo = function(req, res, next) {
    userLogic.getUser('52dcd3a08d91708d08febbc2', function(err, resp) {
        console.dir(resp);
    });
    userLogic.getAccount('52dcd3a08d91708d08febbc2', function(err, resp) {
        console.dir(resp);
    });
    return response.ok(req, res, 'ok');
};
