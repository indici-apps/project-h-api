module.exports = anony => {
    const anonymous = require('../controllers/anonymous.controller.js');
    const { authenticateToken } = require("../auth/TokenAuth")

    anony.post("/v1/user/anonymousLogin", anonymous.anonymousRegistrationOrLogin)
    anony.post("/v1/user/registeranonymoususer", anonymous.AnonymousUserConversion)
}