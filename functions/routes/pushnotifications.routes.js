module.exports = notify => {
    const notific = require('../controllers/pushnotifications.controller.js');
    const { authenticateToken } = require("../auth/TokenAuth")

    notify.post("/v1/notifications/:expotoken", authenticateToken, notific.addOrUpdateExpoToken);
    notify.delete("/v1/notifications/delete", authenticateToken, notific.removeExpoToken);
    notify.post("/v1/sendnotifications/", authenticateToken, notific.addOrUpdateExpoToken);
}