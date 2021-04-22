var admin = require("firebase-admin");
const db = admin.firestore();

// create city, create city area
// crud
exports.addPackages = async (req, res) => {
    try {
        const packagefor = req.body.packagefor.toLowerCase()
        if(packagefor === 'landlord'){
            //
        }
        return null;
    } catch (error) {
        return res.status(501).send({ status: 0, message: error })
    }
}
exports.getPackages = async (req, res) => {
    try {
        const packagefor = req.body.packagefor
        return null;
    } catch (error) {
        return res.status(501).send({ status: 0, message: error })
    }
}
exports.deletePackages = async (req, res) => {
    try {
        const packageid = req.body.packageid
        return null;
    } catch (error) {
        return res.status(501).send({ status: 0, message: error })
    }
}
exports.buyLandlordPackages = async (req, res) => {

    try {
        const packagefor = req.body.packagefor
        if(packagefor === 'landlord'){
            //
        }
        return null;
    } catch (error) {
        return res.status(501).send({ status: 0, message: error })
    }

}
exports.buyDealerPackages = async (req, res) => {

    try {
        const packagefor = req.body.packagefor
        return null;
    } catch (error) {
        return res.status(501).send({ status: 0, message: error })
    }

}
exports.buyTenantPackages = async (req, res) => {

    try {
        const packagefor = req.body.packagefor
        return null;
    } catch (error) {
        return res.status(501).send({ status: 0, message: error })
    }

}
