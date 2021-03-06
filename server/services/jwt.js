const jwt = require('jwt-simple');
const moment = require('moment');

const SECRET_KEY = 'ismkSAGans8989dw98A8SDFsas8';

exports.createAccessToken = function(user) {
    const payload = {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        createToken: moment().unix(),
        exp: moment().add(3, 'hours').unix()
    };

    return jwt.encode(payload, SECRET_KEY);
};

exports.createRefreshToken = function(user) {
    const payload = {
        id: user._id,
        exp: moment().add(30, 'days').unix()
    };

    return jwt.encode(payload, SECRET_KEY);
};

exports.decodedToken = function(token) {
    return jwt.decode(token, SECRET_KEY, true);
};