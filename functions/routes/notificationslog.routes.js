module.exports = notelog => {
    const controller = require('../controllers/notificationslog.controller');
    const { authenticateToken } = require("../auth/TokenAuth")


    notelog.get("/v1/notificationslog", authenticateToken, controller.getNotificationsLog)
    notelog.post("/v1/notificationslog", authenticateToken, controller.setReadStatusTRUE)


}