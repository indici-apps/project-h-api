module.exports = count => {
    const counter = require('../controllers/counter.controller.js');
    const { authenticateToken } = require("../auth/TokenAuth")

    count.get("/v1/counter/all", authenticateToken, counter.getCounters)
    // anony.post("/v1/user/registeranonymoususer", anonymous.AnonymousUserConversion)
}