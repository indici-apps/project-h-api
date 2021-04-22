var admin = require("firebase-admin");
const db = admin.firestore();

exports.addRepairRequestSubModule = async (req, res) => {
    try {
        const repairrequestid = req.body.requestid;
        const repairref = await db.collection('requests').doc(repairrequestid).get();
        if (repairref.exists) {
            const datarepairrequest = repairref.data();
            if (datarepairrequest.repairinitiated === undefined) {
                return res.status(200).send({ status: 0, message: "Invalid Request Id" })
            }
            else if (datarepairrequest.status === 'active' && datarepairrequest.repairinitiated !== undefined && datarepairrequest.repairinitiated === false) {
                db.collection('requests').doc(repairrequestid).collection('areas').doc().create({
                    area: req.body.area.toLowerCase(),
                    partname: req.body.partname.toLowerCase(),
                    description: req.body.description.toLowerCase(),
                    subpriority: req.body.subpriority.toLowerCase(),
                })
                return res.status(200).send({ status: 0, message: "Repairing Area Added Successfully" })
            } else {
                return res.status(200).send({ status: 0, message: "Repair already initiated" })
            }
        } else {
            return res.status(200).send({ status: 0, message: "Invalid Request Id" })
        }
    } catch (error) {
        return res.status(501).send({ status: 0, message: error })
    }
}
exports.getRepairRequestSubModule = async (req, res) => {
    try {
        const repairrequestid = req.body.requestid;
        const repairref = await db.collection('requests').doc(repairrequestid).collection('areas').get();
        if (!repairref.empty) {
            let response = []
            repairref.forEach(doc => {
                const datarepairrequest = doc.data();
                response.push({
                    id: doc.id,
                    area: datarepairrequest.area,
                    partname: datarepairrequest.partname,
                    description: datarepairrequest.description,
                    subpriority: datarepairrequest.subpriority,
                  //  cost: req.body.cost,
                })
            })
            return res.status(200).send({ status: 1, total: response.length, repairareas: response })
        } else {
            return res.status(200).send({ status: 0, message: "Repair request is not processed" })
        }
    } catch (error) {
        return res.status(501).send({ status: 0, message: error })
    }

}