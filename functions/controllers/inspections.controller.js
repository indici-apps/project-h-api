const { firestore } = require("firebase-admin");
var admin = require("firebase-admin");
// const bcrypt = require("bcrypt")
const db = admin.firestore();
var sgMial = require('@sendgrid/mail');
const notificationmessage = require("../messages/pushnotificationmessages");
const { sendNotificationbyUserId } = require("./pushnotifications.controller");
sgMial.setApiKey(process.env.SENDGRID_ONLY_MAIL_API_KEY)
// const { DataSnapshot } = require("firebase-functions/lib/providers/database");
// const { generateAccessToken } = require("../auth/TokenAuth")
// const jwt = require("jsonwebtoken");



//create inspection
exports.createInspection = async (req, res) => {
    try {
        const ref = db.collection('inspections').doc()
        const propertyref = await db.collection('properties').doc(req.body.propertyid).get();
        if (!propertyref.exists) {
            // console.log("1st")
            return res.status(200).send({ status: 0, message: "Property does not exist" })
        } else {
            const propertydata = propertyref.data();
            const assigntocheck = await db.collection('users').doc(req.body.assignto).get();
            if (!assigntocheck.exists) {
                //  console.log("manager do not exist")
                return res.status(200).send({ status: 0, message: "Manager does not exist" })
            } else {
                var assigntodata = assigntocheck.data()
                const usercheckprofile = await db.collection('users').doc(req.user.userid).get();
                const ini_by_data = usercheckprofile.data()
                ref.create({
                    initiatedby: req.user.userid,
                    initiatedbyname: ini_by_data.username,
                    initiatedbyphoto: ini_by_data.photos,
                    initiatedbyphone: ini_by_data.phone,
                    assignto: req.body.assignto,
                    assigntoname: assigntodata.username,
                    assigntoprofilephoto: assigntodata.photos,
                    assigntophone: assigntodata.phone,
                    propertyid: req.body.propertyid,
                    description: req.body.description,
                    ipaddress: req.body.ipaddress,
                    inspectiontype: req.body.inspectiontype.toLowerCase(),
                    inspectionstatus: req.body.inspectionstatus,
                    photos: propertydata.photos,
                    managerreadstatus: false,
                    dealerreadstatus: false,
                    landlordreadstatus: false,
                    tenantreadstatus: false,
                    landlord: propertydata.landlord,
                    landlordname: propertydata.landlordname,
                    landlordprofilephoto: propertydata.landlordprofilephoto,
                    landlordphone: propertydata.landlordphone,
                    dealer: propertydata.dealer,
                    dealername: propertydata.dealername,
                    dealerprofilephoto: propertydata.dealerprofilephoto,
                    dealerphone: propertydata.dealerphone,
                    time: admin.firestore.FieldValue.serverTimestamp()
                })
                // console.log("3rd")
                res.status(201).send({ status: 1, message: "New Inspection has been created", id: ref.id });
                if (req.body.assignto !== req.user.userid) {
                    //      console.log("abc")
                    try {
                        sendNotificationbyUserId(req.body.assignto, propertydata.dealername + notificationmessage.DEALER_ASSIGN_JOB_GENERAL)
                    } catch (error) {
                        console.log('error inside create inspection for push notification? ' + error)
                    }
                }
                return null;
            }
        }
    } catch (error) {
        //  console.log("error")
        return res.status(500).send({ status: 0, message: error.message });
    }
}


//store inspection against areas
exports.addSubInspection = async (req, res) => {
    try {
        const ref = db.collection('subinspections').doc()
        const inspec_check = await db.collection('inspections').doc(req.body.inspectionid).get();
        if (inspec_check.exists) {
            const usercheckprofile = await db.collection('users').doc(req.user.userid).get();
            await ref.create({
                inspectiondoneby: req.user.userid,
                name: req.user.username,
                photo: usercheckprofile.data().photos,
                phone: usercheckprofile.data().phone,
                inspectionid: req.body.inspectionid,
                areatype: req.body.areatype,
                photos: req.body.photos,
                ipaddress: req.body.ipaddress,
                storageid: req.body.storageid,
                conditions: req.body.conditions,
                observation: req.body.observation,
                managerreadstatus: false,
                dealerreadstatus: false,
                landlordreadstatus: false,
                tenantreadstatus: false,
                action: req.body.action,
                additionalnotes: req.body.additionalnotes,
                time: admin.firestore.FieldValue.serverTimestamp()
            })
            return res.status(201).send({ status: 1, message: "Sub Inspection has been added. It will be visible once it has finished processing.", id: ref.id });
        } else {
            return res.status(200).send({ status: 0, message: "Inspection id is invalid" });
        }
    } catch (error) {
        return res.status(500).send({ status: 0, error: error.message });
    }
}


//get list of all inspections against a property
exports.getPropertyInspections = async (req, res) => {
    try {
        // inspectionstatus propertyid
        const query = db.collection('inspections');
        var response = [];
        const snapshot1 = query.where('propertyid', '==', req.params.id).orderBy('time', 'desc');
        const snapshot = await snapshot1.where('inspectionstatus', '==', req.params.status).get();
        if (snapshot.empty) {
            return res.status(200).send({ status: 0, message: 'Inspection against property do not exist' });
        } else {
            snapshot.forEach(doc => {
                const tmplandlord = {
                    id: doc.id,
                    landlord: {
                        id: doc.data().landlord,
                        landlord: doc.data().landlordname,
                        photo: doc.data().landlordprofilephoto,
                        phone: doc.data().landlordphone
                    },
                    dealer: {
                        id: doc.data().dealer,
                        name: doc.data().dealername,
                        photo: doc.data().dealerprofilephoto,
                        phone: doc.data().dealerphone
                    },
                    assignto: {
                        id: doc.data().assignto,
                        name: doc.data().assigntoname,
                        photo: doc.data().assigntoprofilephoto,
                        phone: doc.data().assigntophone
                    },
                    initiatedby: {
                        id: doc.data().initiatedby,
                        name: doc.data().initiatedbyname,
                        photo: doc.data().initiatedbyphoto,
                        phone: doc.data().initiatedbyphone
                    },
                    // ipaddress: doc.data().ipaddress,
                    description: doc.data().description,
                    inspectiontype: doc.data().inspectiontype,
                    inspectionstatus: doc.data().inspectionstatus,
                    photos: doc.data().photos,
                    time: doc.data().time
                }
                response.push(tmplandlord);
            });
            return res.status(200).send({ status: 1, total: response.length, propertyid: req.params.id, inspections: response });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send({ status: 0, message: error });
    }
}

exports.getSubInspecProperties = async (req, res) => {
    try { // inspectionstatus propertyid
        const query = db.collection('subinspections');
        var response = [];
        const snapshot = await query.where('inspectionid', '==', req.params.id).get();
        if (snapshot.empty) {
            return res.status(200).send({ status: 0, message: 'No Subinspection available at the moment' });
        } else {
            snapshot.forEach(doc => {
                const tmplandlord = {
                    id: doc.id,
                    inspectionid: doc.data().inspectionid,
                    inspectedby: {
                        id: doc.data().inspectiondoneby,
                        name: doc.data().name,
                        photo: doc.data().photo,
                        phone: doc.data().phone
                    },
                    // ipaddress: doc.data().ipaddress,
                    areatype: doc.data().areatype,
                    photos: doc.data().photos,
                    conditions: doc.data().conditions,
                    observation: doc.data().observation,
                    action: doc.data().action,
                    additionalnotes: doc.data().additionalnotes,
                    time: doc.data().time
                }
                response.push(tmplandlord);
            });
            return res.status(200).send({ status: 1, subinspections: response });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send({ status: 0, message: error });
    }
}

// get sub inspection by id
exports.getSubInspecByID = async (req, res) => {
    try { // inspectionstatus propertyid
        const query = await db.collection('subinspections').doc(req.params.id).get();
        if (!query.exists) {
            return res.status(200).send({ status: 0, message: 'No Subinspection available at the moment' });
        } else {
            const doc = query;
            const tmpsubinspec = {
                id: doc.id,
                inspectionid: doc.data().inspectionid,
                inspectedby: {
                    id: doc.data().inspectiondoneby,
                    name: doc.data().name,
                    photo: doc.data().photo,
                    phone: doc.data().phone
                },
                // ipaddress: doc.data().ipaddress,
                areatype: doc.data().areatype,
                photos: doc.data().photos,
                conditions: doc.data().conditions,
                observation: doc.data().observation,
                action: doc.data().action,
                additionalnotes: doc.data().additionalnotes,
                time: doc.data().time
            }
            return res.status(200).send({ status: 1, subinspections: tmpsubinspec });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send({ status: 0, message: error });
    }
}

// Landlord can search all inspections for all his properties
exports.getAllInspectionsOfLandlord = async (req, res) => {
    try {
        const query = db.collection('inspections').where('landlord', '==', req.params.userid);
        var response = [];
        const snapshot = await query.where('inspectionstatus', '==', req.params.status).get();
        if (snapshot.empty) {
            return res.status(200).json({ status: 0, message: "Inspections do not exist" });
        } else {
            snapshot.forEach(doc => {
                const selectedinspection = {
                    id: doc.id,
                    landlord: {
                        id: doc.data().landlord,
                        landlord: doc.data().landlordname,
                        photo: doc.data().landlordprofilephoto,
                        phone: doc.data().landlordphone
                    },
                    dealer: {
                        id: doc.data().dealer,
                        name: doc.data().dealername,
                        photo: doc.data().dealerprofilephoto,
                        phone: doc.data().dealerphone
                    },
                    assignto: {
                        id: doc.data().assignto,
                        name: doc.data().assigntoname,
                        photo: doc.data().assigntoprofilephoto,
                        phone: doc.data().assigntophone
                    },
                    initiatedby: {
                        id: doc.data().initiatedby,
                        name: doc.data().initiatedbyname,
                        photo: doc.data().initiatedbyphoto,
                        phone: doc.data().initiatedbyphone
                    },
                    // ipaddress: doc.data().ipaddress,
                    description: doc.data().description,
                    inspectiontype: doc.data().inspectiontype,
                    inspectionstatus: doc.data().inspectionstatus,
                    time: doc.data().time,
                    propertyid: doc.data().propertyid,
                }
                response.push(selectedinspection);
            });
            return res.status(200).send({ status: 1, properties_inspections: response });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send({ status: 0, message: error });
    }
}

// Dealer can search all inspection for all properties which he manage
exports.getAllInspectionsOfDealer = async (req, res) => {
    try {
        const query = db.collection('inspections').where('dealer', '==', req.params.userid);
        var response = [];
        const snapshot = await query.where('inspectionstatus', '==', req.params.status).get();
        if (snapshot.empty) {
            return res.status(200).json({ status: 0, message: "Inspections do not exist" });
        } else {
            snapshot.forEach(doc => {
                const selectedinspection = {
                    id: doc.id,
                    landlord: {
                        id: doc.data().landlord,
                        landlord: doc.data().landlordname,
                        photo: doc.data().landlordprofilephoto,
                        phone: doc.data().landlordphone
                    },
                    dealer: {
                        id: doc.data().dealer,
                        name: doc.data().dealername,
                        photo: doc.data().dealerprofilephoto,
                        phone: doc.data().dealerphone
                    },
                    assignto: {
                        id: doc.data().assignto,
                        name: doc.data().assigntoname,
                        photo: doc.data().assigntoprofilephoto,
                        phone: doc.data().assigntophone
                    },
                    initiatedby: {
                        id: doc.data().initiatedby,
                        name: doc.data().initiatedbyname,
                        photo: doc.data().initiatedbyphoto,
                        phone: doc.data().initiatedbyphone
                    },
                    // ipaddress: doc.data().ipaddress,
                    description: doc.data().description,
                    inspectiontype: doc.data().inspectiontype,
                    inspectionstatus: doc.data().inspectionstatus,
                    time: doc.data().time,
                    propertyid: doc.data().propertyid,
                }
                response.push(selectedinspection);
            });
            var tmpdealer = {
                id: req.user.userid,
                name: req.user.username
            }
            return res.status(200).send({ status: 1, dealer: tmpdealer, properties_inspections: response });      //please return named json array
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send({ status: 0, message: error });
    }
}

exports.getJobAssignManager = async (req, res) => {
    try {
        var inspect_response = [];
        var req_response = [];
        const ref = db.collection('requests').where('manager', '==', req.params.userid).where('identifier', '==', 'other')
        const que = ref.orderBy('time', 'desc')
        var snapshotrequest;
        var stat = req.params.status
        stat = stat.toLowerCase()
        if (stat === "active")
            snapshotrequest = await que.where('status', '==', "active").get();
        else snapshotrequest = await que.where('processstatus', '==', "completed").get();

        // snapshotrequest = await que.where('status', '==', 'active').get();
        if (!snapshotrequest.empty) {
            snapshotrequest.forEach(doc => {
                var requestdatatmp = doc.data();
                if (requestdatatmp.requesttype.toLowerCase() === 'visit') {
                    var retstatus;
                    if (requestdatatmp.status.toLowerCase() !== "active")
                        retstatus = "Completed";
                    else if (requestdatatmp.managerstatus === false && requestdatatmp.manager === "not available")
                        retstatus = "Pending" // pending, scheduled, In Progress, complete
                    else if (requestdatatmp.managerstatus === false && requestdatatmp.manager !== "not available")
                        retstatus = "Scheduled"
                    else if (requestdatatmp.managerstatus === true)
                        retstatus = "InProgress"
                    var req = {
                        id: doc.id,
                      //  photos: requestdatatmp.photos,
                      //  propertyid: requestdatatmp.propertyid,
                        property: {
                            id: requestdatatmp.propertyid,
                            title: requestdatatmp.propertytitle,
                            photos: requestdatatmp.photos
                        },
                        landlord: {
                            id: requestdatatmp.landlord,
                            name: requestdatatmp.landlordname,
                            photo: requestdatatmp.landlordprofilephoto,
                            phone: requestdatatmp.landlordphone
                        },
                        tenant: {
                            id: requestdatatmp.tenant,
                            name: requestdatatmp.tenantname,
                            photo: requestdatatmp.tenantprofilephoto,
                            phone: requestdatatmp.tenantphone
                        },
                        dealer: {
                            id: requestdatatmp.dealer,
                            name: requestdatatmp.dealername,
                            photo: requestdatatmp.dealerprofilephoto,
                            phone: requestdatatmp.dealerphone
                        },
                        manager: {
                            id: requestdatatmp.manager,
                            name: requestdatatmp.managername,
                            photo: requestdatatmp.managerprofilephoto,
                            phone: requestdatatmp.managerphone
                        },
                        // ipaddress: requestdatatmp.ipaddress,
                        forward: requestdatatmp.forward,
                        description: requestdatatmp.description,
                        requesttype: requestdatatmp.requesttype,
                        status: retstatus,
                        time: requestdatatmp.time

                    }
                    req_response.push(req);
                }
            });
        }





        const query = db.collection('inspections');
        const snapshot1 = query.where('assignto', '==', req.params.userid).orderBy('time', 'desc');
        const snapshot = await snapshot1.where('inspectionstatus', '==', req.params.status).get();
        if (!snapshot.empty) {
            snapshot.forEach(doc => {
                var inspecdata = doc.data()
                const inspec = {
                    id: doc.id,
                 //   photos: inspecdata.photos,
                 //   propertyid: inspecdata.propertyid,
                    property: {
                        id: inspecdata.propertyid,
                      //  title: requestdatatmp.propertytitle,
                        photos: inspecdata.photos,
                    },
                    landlord: {
                        id: inspecdata.landlord,
                        landlord: inspecdata.landlordname,
                        photo: inspecdata.landlordprofilephoto,
                        phone: inspecdata.landlordphone
                    },
                    dealer: {
                        id: inspecdata.dealer,
                        name: inspecdata.dealername,
                        photo: inspecdata.dealerprofilephoto,
                        phone: inspecdata.dealerphone
                    },
                    assignto: {
                        id: inspecdata.assignto,
                        name: inspecdata.assigntoname,
                        photo: inspecdata.assigntoprofilephoto,
                        phone: inspecdata.assigntophone
                    },
                    // ipaddress: inspecdata.ipaddress,
                    description: inspecdata.description,
                    inspectiontype: inspecdata.inspectiontype,
                    inspectionstatus: inspecdata.inspectionstatus,
                    time: inspecdata.time
                }
               // console.log(inspec)
                inspect_response.push(inspec);
            });
        }

        let response = inspect_response.concat(req_response)
        if (response.length > 0)
            return res.status(200).send({ status: 1, Jobs: response });
        else
            return res.status(200).send({ status: 0, message: "Jobs Not Available" });
    } catch (error) {
        return res.status(500).send({ status: 0, message: error.message });
    }
}


exports.getPersonalInspection = async (req, res) => {
    try {
        const query = db.collection('inspections');
        var response = [];
        const snapshot1 = query.where('assignto', '==', req.user.userid).orderBy('time', 'desc');
        const snapshot = await snapshot1.where('inspectionstatus', '==', req.params.status).get();
        if (snapshot.empty) {
            return res.status(200).send({ status: 0, message: 'No Inspection for you at this moment' });
        } else {
            snapshot.forEach(doc => {
                var inspecdata = doc.data()
                const inspec = {
                    id: doc.id,
                    photos: inspecdata.photos,
                    propertyid: inspecdata.propertyid,
                    managername: inspecdata.managername,
                    landlord: {
                        id: inspecdata.landlord,
                        landlord: inspecdata.landlordname,
                        photo: inspecdata.landlordprofilephoto,
                        phone: inspecdata.landlordphone
                    },
                    dealer: {
                        id: inspecdata.dealer,
                        name: inspecdata.dealername,
                        photo: inspecdata.dealerprofilephoto,
                        phone: inspecdata.dealerphone
                    },
                    assignto: {
                        id: inspecdata.assignto,
                        name: inspecdata.assigntoname,
                        photo: inspecdata.assigntoprofilephoto,
                        phone: inspecdata.assigntophone
                    },
                    // ipaddress: inspecdata.ipaddress,
                    description: inspecdata.description,
                    inspectiontype: inspecdata.inspectiontype,
                    inspectionstatus: inspecdata.inspectionstatus,
                    time: inspecdata.time
                }
                response.push(inspec);
            });
        }
        return res.status(200).send({ status: 1, Inspections: response });
    } catch (error) {
        return res.status(500).send({ status: 0, message: error.message });
    }
}

exports.updateInspectionStatus = async (req, res) => {
    try {
        var inspectionid = req.params.inspecid;
        var inspecstatus = req.params.status.toLowerCase();
        if (inspecstatus.toLowerCase() === 'active') inspecstatus = 'active'
        else if (inspecstatus.toLowerCase() === 'completed') inspecstatus = 'completed'
        else {
            return res.status(200).send({ status: 0, message: "Invalid Status" })
        }
        await db.collection('inspections').doc(inspectionid).update({
            inspectionstatus: inspecstatus.toLowerCase()
        })
        return res.status(200).send({ status: 0, message: "Inspection status updated successfully" })

    } catch (error) {
        return res.status(501).send({ status: 0, message: error.message })
    }

}
