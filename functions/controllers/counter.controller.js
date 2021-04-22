var admin = require("firebase-admin");
const db = admin.firestore();


exports.getCounters = async (req, res) => {
    try {
        //  console.log(req.user.usertype)
        switch (req.user.usertype.toLowerCase()) {
            case "landlord":
                getLandlordCounter(req, res)
                break;
            case "dealer":
                getDealerCounter(req, res)
                break;
            case "manager":
                getManagerCounter(req, res)
                break;
            case "tenant":
                getTenantCounter(req, res)
                break;
            default:
                return res.status(501).send({ status: 0, message: "Error In User Type" });
        }
        return null;
    } catch (error) {
        return res.status(501).send({ status: 0, message: error.message })
    }
}

async function getLandlordCounter(req, res) {

    let notification_count = 0, request_count = 0, inspection_count = 0, lease_count = 0
    try {
        // const ref = await db.collection('requests').where('tenant', '==', req.user.userid).orderBy('time', 'desc').get()
        const snapshot1 = await db.collection('requests').where('landlord', '==', req.user.userid).where('forward', '==', true).where('landlordreadstatus', '==', false).get()
        if (!snapshot1.empty) {
            notification_count = snapshot1.docs.length
        }

        const snapshot2 = await db.collection('requests').where('landlord', '==', req.user.userid).where('forward', '==', true).where('identifier', '==', 'other').where('landlordreadstatus', '==', false).where('status', '==', "active").get();
        if (!snapshot2.empty) {
            request_count = snapshot2.docs.length
        }

        const ref1 = db.collection('requests').where('tenant', '==', req.user.userid).where('landlordreadstatus', '==', false)
        const snapshot3 = await ref1.where('leaseagreementstatus', '==', "active").get();
        if (!snapshot3.empty) {
            lease_count = snapshot3.docs.length
        }

        return res.status(200).send({ status: 1, notification: notification_count, request: request_count, inspection: inspection_count, lease: lease_count });
    } catch (error) {
        return res.status(500).send({ status: 0, message: error.message });
    }

}
async function getDealerCounter(req, res) {
    let notification_count = 0, request_count = 0, inspection_count = 0, lease_count = 0
    try {
        const ref = await db.collection('requests').where('dealer', '==', req.user.userid).where('dealerreadstatus', '==', false).get()
        if (!ref.empty) {
            notification_count = ref.docs.length;
        }
        const inspec = db.collection('inspections').where('dealer', '==', req.user.userid)//orderBy('time', 'desc');
        const snapshot1 = await inspec.where('inspectionstatus', '==', "active").where('dealerreadstatus', '==', false).get();
        if (!snapshot1.empty) {
            inspection_count = snapshot1.docs.length;
        }

        const requestcount = db.collection('requests').where('dealer', '==', req.user.userid).where('identifier', '==', 'other')
        const snapshot2 = await requestcount.where('status', '==', 'active').where('dealerreadstatus', '==', false).get()
        if (!snapshot2.empty) {

            request_count = snapshot2.docs.length;
        }

        const reflease = await db.collection('requests').where('dealer', '==', req.user.userid).where('leaseagreementstatus', '==', "active").where('dealerreadstatus', '==', false).get();
        if (!reflease.empty) {
            lease_count = reflease.docs.length;
        }

        return res.status(200).send({ status: 1, notification: notification_count, request: request_count, inspection: inspection_count, lease: lease_count });
    } catch (error) {
        return res.status(500).send({ status: 0, message: error.message });
    }
}

async function getTenantCounter(req, res) {

    let notification_count = 0, request_count = 0, inspection_count = 0, lease_count = 0
    try {
        const snapshot = await db.collection('requests').where('tenant', '==', req.user.userid).where('tenantreadstatus', '==', false).get()
        if (!snapshot.empty) {
            notification_count = snapshot.docs.length
        }

        const ref = db.collection('requests').where('tenant', '==', req.user.userid).where('identifier', '==', 'other').where('tenantreadstatus', '==', false)
        const snapshot1 = await ref.where('status', '==', "active").get()
        if (!snapshot1.empty) {
            request_count = snapshot1.docs.length
        }

        const ref1 = db.collection('requests').where('tenant', '==', req.user.userid).where('tenantreadstatus', '==', false)
        const snapshot2 = await ref1.where('leaseagreementstatus', '==', "active").get();
        if (!snapshot2.empty) {
            lease_count = snapshot2.docs.length
        }
        return res.status(200).send({ status: 1, notification: notification_count, request: request_count, inspection: inspection_count, lease: lease_count });
    } catch (error) {
        return res.status(500).send({ status: 0, message: error.message });
    }
}
async function getManagerCounter(req, res) {
    let notification_count = 0, request_count = 0, inspection_count = 0, lease_count = 0
    try {
        const snapshotrequest = await db.collection('requests').where('manager', '==', req.user.userid).where('managerreadstatus', '==', false).get()
        if (!snapshotrequest.empty) {
            notification_count = snapshotrequest.docs.length
        }

        const que = await db.collection('requests').where('manager', '==', req.user.userid).where('identifier', '==', 'other').where('status', '==', "active").where('managerreadstatus', '==', false).get()
        if (!que.empty) {
            request_count = que.docs.length
        }

        const query = await db.collection('inspections').where('assignto', '==', req.user.userid).where('inspectionstatus', '==', "active").where('managerreadstatus', '==', false).get();
        if (!query.empty) {
            inspection_count = query.docs.length
        }

        return res.status(200).send({ status: 1, notification: notification_count, request: request_count, inspection: inspection_count, lease: lease_count });
    } catch (error) {
        return res.status(501).send({ status: 0, message: error.message });
    }
}
