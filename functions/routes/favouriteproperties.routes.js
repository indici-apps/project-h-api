module.exports = favprop => {
    const favfun = require('../controllers/favouriteproperties.controller');
    const { authenticateToken } = require("../auth/TokenAuth")

    favprop.post("/v1/favouriteproperty",authenticateToken ,favfun.addPropertyToFavorite)
    favprop.get("/v1/favouriteproperty", authenticateToken, favfun.getFavoriteProperties)
    favprop.delete("/v1/favouriteproperty/:recordid", authenticateToken,favfun.removeFavProperty)
   // favprop.post("/v1/user/registeranonymoususer", anonymous.AnonymousUserConversion)
}