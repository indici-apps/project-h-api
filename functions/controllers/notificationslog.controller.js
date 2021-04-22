var admin = require("firebase-admin");
const db = admin.firestore();
const notificationslogmessage = require("../messages/notificationslogmessages")

// exports.createNotificationLogForRequest = async (userid, requestdata) => {
//     db.collection("notificationslog").doc(userid).collection("notifications").doc().create({
//         status:false,
//         time: admin.firestore.FieldValue.serverTimestamp(),
//     })
// }


// req.user.userid
// req.user.type
exports.setReadStatusTRUE = async (req, res) => {
    try {
        if (req.body.catagory === undefined || !req.body.catagory)
            return res.status(400).send({ status: 0, message: "catagory is undefined or empty" });
        if (req.body.id === undefined || !req.body.id)
            return res.status(400).send({ status: 0, message: "id is undefined or empty" });
        if (req.body.catagory.toLowerCase() === "request" && req.body.catagory.toLowerCase() === "inspection")
            return res.status(400).send({ status: 0, message: "Invalid catagory" });
        switch (req.body.catagory.toLowerCase()) {
            case "request":
                setRequestModuleStatusTRUE(req, res)
                break;
            case "inspection":
                setInspectionModuleStatusTRUE(req, res)
                break;

            default:
                return res.status(501).send({ status: 0, message: "Request type is invalid" })
        }
        return null;
    } catch (error) {
        return res.status(200).send({ status: 0, message: error.message })
    }

}
async function setRequestModuleStatusTRUE(req, res) {
    switch (req.user.usertype.toLowerCase()) {
        case "landlord":
            db.collection('requests').doc(req.body.id).update({
                landlordreadstatus: true
            })
            break;
        case "dealer":
            db.collection('requests').doc(req.body.id).update({
                dealerreadstatus: true
            })
            break;
        case "manager":
            db.collection('requests').doc(req.body.id).update({
                managerreadstatus: true
            })
            break;
        case "tenant":
            db.collection('requests').doc(req.body.id).update({
                tenantreadstatus: true
            })
            break;
        default:
            return res.status(501).send({ status: 0, message: "Error In User Type" })
    }
    return res.status(200).send({ status: 0, message: "Notification status has been changed successfully" })
}
async function setInspectionModuleStatusTRUE(req, res) {
    switch (req.user.usertype.toLowerCase()) {
        case "landlord":
            db.collection('inspections').doc(req.body.id).update({
                landlordreadstatus: true
            })
            break;
        case "dealer":
            db.collection('inspections').doc(req.body.id).update({
                dealerreadstatus: true
            })
            break;
        case "manager":
            db.collection('inspections').doc(req.body.id).update({
                managerreadstatus: true
            })
            break;
        case "tenant":
            db.collection('inspections').doc(req.body.id).update({
                tenantreadstatus: true
            })
            break;
        default:
            return res.status(501).send({ status: 0, message: "Error In User Type" })
    }
    return res.status(200).send({ status: 0, message: "Notification status has been changed successfully" })
}
exports.getNotificationsLog = async (req, res) => {
    try {
        //  console.log(req.user.usertype)
        switch (req.user.usertype.toLowerCase()) {
            case "landlord":
                getLandlordNotifications(req, res)
                break;
            case "dealer":
                getDealerNotifications(req, res)
                break;
            case "manager":
                getManagerNotifications(req, res)
                break;
            case "tenant":
                getTenantNotifications(req, res)
                break;
            default:
                return res.status(501).send({ status: 0, message: "Error In User Type" });
        }
        return null;
    } catch (error) {
        return res.status(501).send({ status: 0, message: error.message })
    }

}
async function getLandlordNotifications(req, res) {
    let response = []
    let counter = 0
    try {
        // const ref = await db.collection('requests').where('tenant', '==', req.user.userid).orderBy('time', 'desc').get()
        const reference = db.collection('requests').where('landlord', '==', req.user.userid).where('forward', '==', true)
        const snapshot = await reference.orderBy('time', 'desc').get()
        if (!snapshot.empty) {
            snapshot.forEach(doc => {
                var requestdatatmp = doc.data();
                if (requestdatatmp.landlordreadstatus === false) {
                    counter++
                }
                if (requestdatatmp.requesttype.toLowerCase() === 'visit') {
                    // var retstatus;
                    // if (requestdatatmp.status.toLowerCase() !== "active")
                    //     retstatus = "Completed";
                    // else if (requestdatatmp.managerstatus === false && requestdatatmp.manager === "not available")
                    //     retstatus = "Pending" // pending, scheduled, In Progress, complete
                    // else if (requestdatatmp.managerstatus === false && requestdatatmp.manager !== "not available")
                    //     retstatus = "Scheduled"
                    // else if (requestdatatmp.managerstatus === true)
                    //     retstatus = "InProgress"
                    var req = {
                        id: doc.id,
                        status: requestdatatmp.landlordreadstatus,
                        // path: "requests/landlord/" + doc.id,
                        message: requestdatatmp.tenantname + notificationslogmessage.LANDLORD_VISIT_REQUEST,
                        requesttype: requestdatatmp.requesttype,
                        catagory: "request",
                        time: requestdatatmp.time,
                        property: {
                            id: requestdatatmp.propertyid,
                            title: requestdatatmp.propertytitle,
                            //    photos: requestdatatmp.photos
                        },
                        // landlord: {
                        //     //    id: requestdatatmp.landlord,
                        //     name: requestdatatmp.landlordname,
                        //     //     photo: requestdatatmp.landlordprofilephoto,
                        //     //     phone: requestdatatmp.landlordphone
                        // },
                        // dealer: {
                        //     //    id: requestdatatmp.dealer,
                        //     name: requestdatatmp.dealername,
                        //     //    photo: requestdatatmp.dealerprofilephoto,
                        //     //    phone: requestdatatmp.dealerphone
                        // },
                        // tenant: {
                        //     //    id: requestdatatmp.tenant,
                        //     name: requestdatatmp.tenantname,
                        //     //    photo: requestdatatmp.tenantprofilephoto,
                        //     //    phone: requestdatatmp.tenantphone
                        // },
                        // manager: {
                        //     //    id: requestdatatmp.manager,
                        //     name: requestdatatmp.managername,
                        //     //    photo: requestdatatmp.managerprofilephoto,
                        //     //    phone: requestdatatmp.managerphone
                        // },
                        // ipaddress: requestdatatmp.ipaddress,
                        //   forward: requestdatatmp.forward,
                        //   description: requestdatatmp.description,
                    }
                    response.push(req);
                } else if (requestdatatmp.requesttype.toLowerCase() === 'add dealer') {
                    const req = {
                        id: doc.id,
                        status: requestdatatmp.landlordreadstatus,
                        //path: "requests/landlord/" + doc.id,
                        message: requestdatatmp.dealername + "~" + notificationslogmessage.LANDLORD_ADDDEALER_REQUEST + "~" + requestdatatmp.propertytitle,
                        requesttype: requestdatatmp.requesttype,
                        photo: requestdatatmp.dealerprofilephoto,
                        catagory: "request",
                        time: requestdatatmp.time,
                        property: {
                            id: requestdatatmp.propertyid,
                            title: requestdatatmp.propertytitle,
                            //    photos: requestdatatmp.photos
                        },
                        // landlord: {
                        //     //    id: requestdatatmp.landlord,
                        //     name: requestdatatmp.landlordname,
                        //     //     photo: requestdatatmp.landlordprofilephoto,
                        //     //     phone: requestdatatmp.landlordphone
                        // },
                        // dealer: {
                        //     //    id: requestdatatmp.dealer,
                        //     name: requestdatatmp.dealername,
                        //     //    photo: requestdatatmp.dealerprofilephoto,
                        //     //    phone: requestdatatmp.dealerphone
                        // },
                        // ipaddress: doc.data().ipaddress,
                        // description: requestdatatmp.description,
                        // requesttype: requestdatatmp.requesttype,
                        // status: requestdatatmp.status,
                        // time: requestdatatmp.time
                    }
                    response.push(req);
                }
                else {
                    const req = {
                        id: doc.id,
                        status: requestdatatmp.landlordreadstatus,
                        //path: "requests/landlord/" + doc.id,
                        message: requestdatatmp.tenantname + "~" + notificationslogmessage.LANDLORD_LEASED_REQUEST + "~" + requestdatatmp.propertytitle,
                        requesttype: requestdatatmp.requesttype,
                        catagory: "request",
                        photo: requestdatatmp.tenantprofilephoto,
                        time: requestdatatmp.time,
                        property: {
                            id: requestdatatmp.propertyid,
                            title: requestdatatmp.propertytitle,
                            //  photos: requestdatatmp.photos
                        },
                        // landlord: {
                        //     name: requestdatatmp.landlordname,
                        //     // id: requestdatatmp.landlord,
                        //     // photo: requestdatatmp.landlordprofilephoto,
                        //     // phone: requestdatatmp.landlordphone
                        // },
                        // tenant: {
                        //     id: requestdatatmp.tenant,
                        //     // name: requestdatatmp.tenantname,
                        //     // photo: requestdatatmp.tenantprofilephoto,
                        //     // phone: requestdatatmp.tenantphone
                        // },
                        // dealer: {
                        //     dealer: requestdatatmp.dealer,
                        //     // name: requestdatatmp.dealername,
                        //     // photo: requestdatatmp.dealerprofilephoto,
                        //     // phone: requestdatatmp.dealerphone
                        // },
                        // ipaddress: doc.data().ipaddress,
                        // description: requestdatatmp.description,
                        // requesttype: requestdatatmp.requesttype,
                        // status: requestdatatmp.status,
                        // time: requestdatatmp.time
                    }
                    response.push(req);
                }

            });

        }
        return res.status(200).send({ status: 1, notifications: response, count: counter });
    } catch (error) {
        return res.status(500).send({ status: 0, message: error.message });
    }

}
async function getDealerNotifications(req, res) {
    let response = []
    let counter = 0
    try {
        const ref = db.collection('requests').where('dealer', '==', req.user.userid).orderBy('time', 'desc')
        var snapshot = await ref.get();
        if (!snapshot.empty) {
            snapshot.forEach(doc => {
                var requestdatatmp = doc.data();
                if (requestdatatmp.dealerreadstatus === false) {
                    counter++
                }
                //    console.log(requestdatatmp.requesttype);
                if (requestdatatmp.requesttype.toLowerCase() === 'visit') {
                    var req = {
                        id: doc.id,
                        status: requestdatatmp.dealerreadstatus,
                        // path: "requests/landlord/" + doc.id,
                        message: requestdatatmp.tenantname + "~" + notificationslogmessage.DEALER_VISIT_REQUEST + "~" + requestdatatmp.propertytitle,
                        requesttype: requestdatatmp.requesttype,
                        catagory: "request",
                        photo: requestdatatmp.tenantprofilephoto,
                        time: requestdatatmp.time,
                        property: {
                            id: requestdatatmp.propertyid,
                            //title: requestdatatmp.propertytitle,
                            //    photos: requestdatatmp.photos
                        },
                        // landlord: {
                        //     //    id: requestdatatmp.landlord,
                        //     name: requestdatatmp.landlordname,
                        //     //     photo: requestdatatmp.landlordprofilephoto,
                        //     //     phone: requestdatatmp.landlordphone
                        // },
                        // dealer: {
                        //     //    id: requestdatatmp.dealer,
                        //     name: requestdatatmp.dealername,
                        //     //    photo: requestdatatmp.dealerprofilephoto,
                        //     //    phone: requestdatatmp.dealerphone
                        // },
                        // tenant: {
                        //     //    id: requestdatatmp.tenant,
                        //     name: requestdatatmp.tenantname,
                        //     //    photo: requestdatatmp.tenantprofilephoto,
                        //     //    phone: requestdatatmp.tenantphone
                        // },
                        // manager: {
                        //     //    id: requestdatatmp.manager,
                        //     name: requestdatatmp.managername,
                        //     //    photo: requestdatatmp.managerprofilephoto,
                        //     //    phone: requestdatatmp.managerphone
                        // },
                        // ipaddress: requestdatatmp.ipaddress,
                        //   forward: requestdatatmp.forward,
                        //   description: requestdatatmp.description,
                    }
                    response.push(req);
                } else if (requestdatatmp.requesttype.toLowerCase() !== 'add dealer') {
                    if (requestdatatmp.forwardtime !== undefined) {
                        const forwardreq = {
                            id: doc.id,
                            status: requestdatatmp.dealerreadstatus,
                            //path: "requests/landlord/" + doc.id,
                            message: notificationslogmessage.DEALER_LEASED_REQUEST_FORWARD + "~" + requestdatatmp.landlordname,
                            requesttype: requestdatatmp.requesttype,
                            photo: requestdatatmp.photos[0],
                            catagory: "request",
                            time: requestdatatmp.forwardtime,
                            property: {
                                id: requestdatatmp.propertyid,
                                title: requestdatatmp.propertytitle,
                                //  photos: requestdatatmp.photos
                            },
                            // landlord: {
                            //     name: requestdatatmp.landlordname,
                            //     // id: requestdatatmp.landlord,
                            //     // photo: requestdatatmp.landlordprofilephoto,
                            //     // phone: requestdatatmp.landlordphone
                            // },
                            // tenant: {
                            //     id: requestdatatmp.tenant,
                            //     // name: requestdatatmp.tenantname,
                            //     // photo: requestdatatmp.tenantprofilephoto,
                            //     // phone: requestdatatmp.tenantphone
                            // },
                            // dealer: {
                            //     dealer: requestdatatmp.dealer,
                            //     // name: requestdatatmp.dealername,
                            //     // photo: requestdatatmp.dealerprofilephoto,
                            //     // phone: requestdatatmp.dealerphone
                            // },
                            // ipaddress: doc.data().ipaddress,
                            // description: requestdatatmp.description,
                            // requesttype: requestdatatmp.requesttype,
                            // status: requestdatatmp.status,
                            // time: requestdatatmp.time
                        }
                        response.push(forwardreq);
                    }
                    const req = {
                        id: doc.id,
                        status: requestdatatmp.dealerreadstatus,
                        //path: "requests/landlord/" + doc.id,
                        message: requestdatatmp.tenantname + "~" + notificationslogmessage.DEALER_LEASED_REQUEST + "~" + requestdatatmp.propertytitle,
                        requesttype: requestdatatmp.requesttype,
                        photo: requestdatatmp.tenantprofilephoto,
                        catagory: "request",
                        time: requestdatatmp.time,
                        property: {
                            id: requestdatatmp.propertyid,
                            title: requestdatatmp.propertytitle,
                            //  photos: requestdatatmp.photos
                        },
                        // landlord: {
                        //     name: requestdatatmp.landlordname,
                        //     // id: requestdatatmp.landlord,
                        //     // photo: requestdatatmp.landlordprofilephoto,
                        //     // phone: requestdatatmp.landlordphone
                        // },
                        // tenant: {
                        //     id: requestdatatmp.tenant,
                        //     // name: requestdatatmp.tenantname,
                        //     // photo: requestdatatmp.tenantprofilephoto,
                        //     // phone: requestdatatmp.tenantphone
                        // },
                        // dealer: {
                        //     dealer: requestdatatmp.dealer,
                        //     // name: requestdatatmp.dealername,
                        //     // photo: requestdatatmp.dealerprofilephoto,
                        //     // phone: requestdatatmp.dealerphone
                        // },
                        // ipaddress: doc.data().ipaddress,
                        // description: requestdatatmp.description,
                        // requesttype: requestdatatmp.requesttype,
                        // status: requestdatatmp.status,
                        // time: requestdatatmp.time
                    }
                    response.push(req);
                } else {
                    if (requestdatatmp.status.toLowerCase() === 'accepted' || requestdatatmp.status.toLowerCase() === 'rejected') {
                        var tmpmessage = "";
                        if (requestdatatmp.status.toLowerCase() === 'accepted') {
                            tmpmessage = requestdatatmp.landlordname + "~" + notificationslogmessage.DEALER_ADD_PROPERTY_ACCEPTED + "~" + requestdatatmp.propertytitle
                        } else if (requestdatatmp.status.toLowerCase() === 'rejected') {
                            tmpmessage = requestdatatmp.landlordname + "~" + notificationslogmessage.DEALER_ADD_PROPERTY_REJECTED + "~" + requestdatatmp.propertytitle
                        } else {
                            tmpmessage = "Muhammad Umer you have missed a scenario"
                        }
                        const reqact = {
                            id: doc.id,
                            status: requestdatatmp.dealerreadstatus,
                            //path: "requests/landlord/" + doc.id,
                            message: tmpmessage,
                            requesttype: requestdatatmp.requesttype,
                            catagory: "request",
                            photo: requestdatatmp.landlordprofilephoto,
                            time: requestdatatmp.requestacceptiontime,
                            property: {
                                id: requestdatatmp.propertyid,
                                title: requestdatatmp.propertytitle,
                                //    photos: requestdatatmp.photos
                            },
                            // landlord: {
                            //     //    id: requestdatatmp.landlord,
                            //     name: requestdatatmp.landlordname,
                            //     //     photo: requestdatatmp.landlordprofilephoto,
                            //     //     phone: requestdatatmp.landlordphone
                            // },
                            // dealer: {
                            //     //    id: requestdatatmp.dealer,
                            //     name: requestdatatmp.dealername,
                            //     //    photo: requestdatatmp.dealerprofilephoto,
                            //     //    phone: requestdatatmp.dealerphone
                            // },
                            // ipaddress: doc.data().ipaddress,
                            // description: requestdatatmp.description,
                            // requesttype: requestdatatmp.requesttype,
                            // status: requestdatatmp.status,
                            // time: requestdatatmp.time
                        }
                        response.push(reqact);
                    }
                    const req = {
                        id: doc.id,
                        status: requestdatatmp.dealerreadstatus,
                        //path: "requests/landlord/" + doc.id,
                        message: notificationslogmessage.DEALER_ADD_PROPERTY_REQUEST + "~" + requestdatatmp.propertytitle,
                        requesttype: requestdatatmp.requesttype,
                        photo: requestdatatmp.photos[0],
                        catagory: "request",
                        time: requestdatatmp.time,
                        property: {
                            id: requestdatatmp.propertyid,
                            //title: requestdatatmp.propertytitle,
                            //    photos: requestdatatmp.photos
                        },
                        // landlord: {
                        //     //    id: requestdatatmp.landlord,
                        //     name: requestdatatmp.landlordname,
                        //     //     photo: requestdatatmp.landlordprofilephoto,
                        //     //     phone: requestdatatmp.landlordphone
                        // },
                        // dealer: {
                        //     //    id: requestdatatmp.dealer,
                        //     name: requestdatatmp.dealername,
                        //     //    photo: requestdatatmp.dealerprofilephoto,
                        //     //    phone: requestdatatmp.dealerphone
                        // },
                        // ipaddress: doc.data().ipaddress,
                        // description: requestdatatmp.description,
                        // requesttype: requestdatatmp.requesttype,
                        // status: requestdatatmp.status,
                        // time: requestdatatmp.time
                    }
                    response.push(req);

                }
            });
        }
        return res.status(200).send({ status: 1, notifications: response, count: counter });
    } catch (error) {
        return res.status(500).send({ status: 0, message: error.message });
    }
}

async function getTenantNotifications(req, res) {
    let response = []
    let counter = 0
    try {
        const snapshot = await db.collection('requests').where('tenant', '==', req.user.userid).orderBy('time', 'desc').get()
        if (!snapshot.empty) {
            snapshot.forEach(doc => {
                var requestdatatmp = doc.data();
                if (requestdatatmp.tenantreadstatus === false) {
                    counter++
                }
                if (requestdatatmp.requesttype.toLowerCase() === 'visit') {
                    // var retstatus;
                    // if (requestdatatmp.status.toLowerCase() !== "active")
                    //     retstatus = "Completed";
                    // else if (requestdatatmp.managerstatus === false && requestdatatmp.manager === "not available")
                    //     retstatus = "Pending" // pending, scheduled, In Progress, complete
                    // else if (requestdatatmp.managerstatus === false && requestdatatmp.manager !== "not available")
                    //     retstatus = "Scheduled"
                    // else if (requestdatatmp.managerstatus === true)
                    //     retstatus = "InProgress"
                    var req = {
                        id: doc.id,
                        status: requestdatatmp.tenantreadstatus,
                        // path: "requests/tenant/" + doc.id,
                        message: notificationslogmessage.TENANT_VISIT_REQUEST + "~" + requestdatatmp.propertytitle,
                        photo: requestdatatmp.photos[0],
                        requesttype: requestdatatmp.requesttype,
                        catagory: "request",
                        time: requestdatatmp.time,
                        property: {
                            id: requestdatatmp.propertyid,
                            // title: requestdatatmp.propertytitle,
                            photos: requestdatatmp.photos
                        },


                        // landlord: {
                        //     //    id: requestdatatmp.landlord,
                        //     name: requestdatatmp.landlordname,
                        //     //     photo: requestdatatmp.landlordprofilephoto,
                        //     //     phone: requestdatatmp.landlordphone
                        // },
                        // dealer: {
                        //     //    id: requestdatatmp.dealer,
                        //     name: requestdatatmp.dealername,
                        //     //    photo: requestdatatmp.dealerprofilephoto,
                        //     //    phone: requestdatatmp.dealerphone
                        // },
                        // tenant: {
                        //     //    id: requestdatatmp.tenant,
                        //     name: requestdatatmp.tenantname,
                        //     //    photo: requestdatatmp.tenantprofilephoto,
                        //     //    phone: requestdatatmp.tenantphone
                        // },
                        // manager: {
                        //     //    id: requestdatatmp.manager,
                        //     name: requestdatatmp.managername,
                        //     //    photo: requestdatatmp.managerprofilephoto,
                        //     //    phone: requestdatatmp.managerphone
                        // },
                        // ipaddress: requestdatatmp.ipaddress,
                        //   forward: requestdatatmp.forward,
                        //   description: requestdatatmp.description,
                    }
                    response.push(req);
                } else {
                    if (requestdatatmp.leaseagreementstatus !== 'active') {
                        var tmpmessage = "";
                        var check = false;
                        if (requestdatatmp.status.toLowerCase() === 'accepted') {
                            tmpmessage = requestdatatmp.landlordname + "~" + notificationslogmessage.TENANT_LEASED_REQUEST_ACCEPTED + "~" + requestdatatmp.propertytitle
                            check = true;
                        } else if (requestdatatmp.status.toLowerCase() === 'rejected') {
                            tmpmessage = requestdatatmp.landlordname + "~" + notificationslogmessage.TENANT_LEASED_REQUEST_REJECTED + "~" + requestdatatmp.propertytitle
                            check = true;
                        }
                        const forwardreq = {
                            id: doc.id,
                            status: requestdatatmp.dealerreadstatus,
                            //path: "requests/landlord/" + doc.id,
                            message: tmpmessage,
                            requesttype: requestdatatmp.requesttype,
                            catagory: "request",
                            photo: requestdatatmp.landlordprofilephoto,
                            time: requestdatatmp.requestacceptiontime,
                            property: {
                                id: requestdatatmp.propertyid,
                                title: requestdatatmp.propertytitle,
                                //  photos: requestdatatmp.photos
                            },
                            // landlord: {
                            //     name: requestdatatmp.landlordname,
                            //     // id: requestdatatmp.landlord,
                            //     // photo: requestdatatmp.landlordprofilephoto,
                            //     // phone: requestdatatmp.landlordphone
                            // },
                            // tenant: {
                            //     id: requestdatatmp.tenant,
                            //     // name: requestdatatmp.tenantname,
                            //     // photo: requestdatatmp.tenantprofilephoto,
                            //     // phone: requestdatatmp.tenantphone
                            // },
                            // dealer: {
                            //     dealer: requestdatatmp.dealer,
                            //     // name: requestdatatmp.dealername,
                            //     // photo: requestdatatmp.dealerprofilephoto,
                            //     // phone: requestdatatmp.dealerphone
                            // },
                            // ipaddress: doc.data().ipaddress,
                            // description: requestdatatmp.description,
                            // requesttype: requestdatatmp.requesttype,
                            // status: requestdatatmp.status,
                            // time: requestdatatmp.time
                        }
                        if (check)
                            response.push(forwardreq);
                    }
                    if (requestdatatmp.forwardtime !== undefined) {
                        const forwardreq = {
                            id: doc.id,
                            status: requestdatatmp.dealerreadstatus,
                            //path: "requests/landlord/" + doc.id,
                            message: requestdatatmp.dealername + "~" + notificationslogmessage.TENANT_LEASED_REQUEST_FORWARD + "~" + requestdatatmp.landlordname,
                            requesttype: requestdatatmp.requesttype,
                            catagory: "request",
                            photo: requestdatatmp.dealerprofilephoto,
                            time: requestdatatmp.forwardtime,
                            property: {
                                id: requestdatatmp.propertyid,
                                title: requestdatatmp.propertytitle,
                                //  photos: requestdatatmp.photos
                            },
                            // landlord: {
                            //     name: requestdatatmp.landlordname,
                            //     // id: requestdatatmp.landlord,
                            //     // photo: requestdatatmp.landlordprofilephoto,
                            //     // phone: requestdatatmp.landlordphone
                            // },
                            // tenant: {
                            //     id: requestdatatmp.tenant,
                            //     // name: requestdatatmp.tenantname,
                            //     // photo: requestdatatmp.tenantprofilephoto,
                            //     // phone: requestdatatmp.tenantphone
                            // },
                            // dealer: {
                            //     dealer: requestdatatmp.dealer,
                            //     // name: requestdatatmp.dealername,
                            //     // photo: requestdatatmp.dealerprofilephoto,
                            //     // phone: requestdatatmp.dealerphone
                            // },
                            // ipaddress: doc.data().ipaddress,
                            // description: requestdatatmp.description,
                            // requesttype: requestdatatmp.requesttype,
                            // status: requestdatatmp.status,
                            // time: requestdatatmp.time
                        }
                        response.push(forwardreq);
                    }
                    const req = {
                        id: doc.id,
                        status: requestdatatmp.tenantreadstatus,
                        //path: "requests/tenant/" + doc.id,
                        message: notificationslogmessage.TENANT_LEASED_REQUEST + "~" + requestdatatmp.propertytitle,
                        requesttype: requestdatatmp.requesttype,
                        photo: requestdatatmp.photos[0],
                        catagory: "request",
                        time: requestdatatmp.time,
                        property: {
                            id: requestdatatmp.propertyid,
                            title: requestdatatmp.propertytitle,
                            photos: requestdatatmp.photos
                        },
                        // landlord: {
                        //     name: requestdatatmp.landlordname,
                        //     // id: requestdatatmp.landlord,
                        //     // photo: requestdatatmp.landlordprofilephoto,
                        //     // phone: requestdatatmp.landlordphone
                        // },
                        // tenant: {
                        //     //id: requestdatatmp.tenant,
                        //      name: requestdatatmp.tenantname,
                        //     // photo: requestdatatmp.tenantprofilephoto,
                        //     // phone: requestdatatmp.tenantphone
                        // },
                        // dealer: {
                        //     dealer: requestdatatmp.dealer,
                        //     // name: requestdatatmp.dealername,
                        //     // photo: requestdatatmp.dealerprofilephoto,
                        //     // phone: requestdatatmp.dealerphone
                        // },
                        // ipaddress: doc.data().ipaddress,
                        // description: requestdatatmp.description,
                        // requesttype: requestdatatmp.requesttype,
                        // status: requestdatatmp.status,
                        // time: requestdatatmp.time
                    }
                    response.push(req);
                }
            });

        }
        return res.status(200).send({ status: 1, notifications: response, count: counter });
    } catch (error) {
        return res.status(500).send({ status: 0, message: error.message });
    }
}
async function getManagerNotifications(req, res) {
    let response = []
    let counter = 0
    try {
        const ref = db.collection('requests').where('manager', '==', req.user.userid)
        const snapshotrequest = await ref.orderBy('time', 'desc').get()
        if (!snapshotrequest.empty) {
            snapshotrequest.forEach(doc => {
                var requestdatatmp = doc.data();
                if (requestdatatmp.managerreadstatus === false) {
                    counter++
                }
                if (requestdatatmp.requesttype.toLowerCase() === 'visit') {
                    var req = {
                        id: doc.id,
                        status: requestdatatmp.managerreadstatus,
                        // path: "requests/tenant/" + doc.id,
                        message: notificationslogmessage.MANAGER_VISIT_REQUEST + "~" + requestdatatmp.dealername,
                        requesttype: requestdatatmp.requesttype,
                        catagory: "request",
                        photo: requestdatatmp.dealerprofilephoto,
                        time: requestdatatmp.time,
                        property: {
                            id: requestdatatmp.propertyid,
                            title: requestdatatmp.propertytitle,
                            // photos: requestdatatmp.photos
                        },


                        // landlord: {
                        //     //    id: requestdatatmp.landlord,
                        //     name: requestdatatmp.landlordname,
                        //     //     photo: requestdatatmp.landlordprofilephoto,
                        //     //     phone: requestdatatmp.landlordphone
                        // },
                        // dealer: {
                        //     //    id: requestdatatmp.dealer,
                        //     name: requestdatatmp.dealername,
                        //     //    photo: requestdatatmp.dealerprofilephoto,
                        //     //    phone: requestdatatmp.dealerphone
                        // },
                        // tenant: {
                        //     //    id: requestdatatmp.tenant,
                        //     name: requestdatatmp.tenantname,
                        //     //    photo: requestdatatmp.tenantprofilephoto,
                        //     //    phone: requestdatatmp.tenantphone
                        // },
                        // manager: {
                        //     //    id: requestdatatmp.manager,
                        //     name: requestdatatmp.managername,
                        //     //    photo: requestdatatmp.managerprofilephoto,
                        //     //    phone: requestdatatmp.managerphone
                        // },
                        // ipaddress: requestdatatmp.ipaddress,
                        //   forward: requestdatatmp.forward,
                        //   description: requestdatatmp.description,
                    }
                    response.push(req);
                }
            });
        }
        return res.status(200).send({ status: 1, notifications: response, count: counter });
    } catch (error) {
        return res.status(501).send({ status: 0, message: error.message });
    }
}
