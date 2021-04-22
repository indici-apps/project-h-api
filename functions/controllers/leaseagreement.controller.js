var admin = require("firebase-admin")
const db = admin.firestore();
const { Storage } = require('@google-cloud/storage')
const mime = require('mime')
const projectId = "project-h-de8a7"
const bucketName = `${projectId}.appspot.com`
const { v4: uuidv4 } = require('uuid')
const moment = require('moment')
const notificationmessage = require("../messages/pushnotificationmessages");
const { sendNotificationbyUserId } = require("./pushnotifications.controller");

function createPublicFileURL(storageName) {
    return `http://storage.googleapis.com/${bucketName}/${encodeURIComponent(storageName)}`;
}

exports.getLeaseAgreementInformation = async (req, res) => {
    try {
        const refer = await db.collection('requests').doc(req.params.leaseagreementid).get()
        var response;
        if (!refer.exists) {
            return res.status(200).send({ status: 0, message: "Invalid Request Id" });
        }
        else {
            var requestdatatmp = refer.data();
            var expirytime = calculateTimePeriod(requestdatatmp.enddate)
            const currentdate = new Date();
            const startingdateoflease = new Date(requestdatatmp.startdate)
            var displaymessages = false;
            if (currentdate >= startingdateoflease && requestdatatmp.status === 'accepted') {
                displaymessages = true;
            }
            response = {
                id: refer.id,
                displaymessage: displaymessages,
                property: {
                    id: requestdatatmp.propertyid,
                    title: requestdatatmp.propertytitle,
                    photos: requestdatatmp.photos
                },
                landlord: {
                    id: requestdatatmp.landlord,
                    name: requestdatatmp.landlordname,
                    photo: requestdatatmp.landlordprofilephoto,
                    phone: requestdatatmp.landlordphone,
                    landlordsignaturephoto: requestdatatmp.landlordsignaturephoto,
                },
                tenant: {
                    id: requestdatatmp.tenant,
                    name: requestdatatmp.tenantname,
                    photo: requestdatatmp.tenantprofilephoto,
                    phone: requestdatatmp.tenantphone,
                    tenantsignaturephoto: requestdatatmp.tenantsignaturephoto,
                },
                dealer: {
                    dealer: requestdatatmp.dealer,
                    name: requestdatatmp.dealername,
                    photo: requestdatatmp.dealerprofilephoto,
                    phone: requestdatatmp.dealerphone
                },
                //status: status,
                //remarks: req.body.remarks,
                //responseip: req.body.ipaddress,
                expiremessage: expirytime,
                dealersignaturestatus: requestdatatmp.dealersignaturestatus,
                leaseagreementtext: requestdatatmp.leaseagreementtext,
                leaseagreementstatus: requestdatatmp.leaseagreementstatus,
                tenantsignaturestatus: requestdatatmp.tenantsignaturestatus,
                landlordsignaturestatus: requestdatatmp.landlordsignaturestatus,
                duration: requestdatatmp.duration,
                rentalduedate: requestdatatmp.rentalduedate,
                rentalvalue: requestdatatmp.rentalvalue,
                rentaltype: requestdatatmp.rentaltype,
                startdate: requestdatatmp.startdate,
                enddate: requestdatatmp.enddate,
                notes: requestdatatmp.notes,
                securitydeposit: requestdatatmp.securitydeposit,
                forward: requestdatatmp.forward,

                //ipaddress: doc.data().ipaddress,
                //description: requestdatatmp.description,
                //requesttype: requestdatatmp.requesttype,
                //status: requestdatatmp.status,
                time: requestdatatmp.requestacceptiontime
            }
            return res.status(200).send({ status: 1, request: response });
        }

    } catch (error) {
        return res.status(500).send({ status: 0, message: error.message });
    }
}

exports.getMyLeaseAgreementLandlord = async (req, res) => {
    try {
        // console.log("inside landlord lease agg")
        // console.log(req.user.userid)
        if (req.params.status !== undefined && !req.params.status)
            return res.status(500).send({ status: 0, message: "status is empty, null or undefined" });
        var snapshot;
        var stat = req.params.status.toLowerCase()
        if (stat !== 'active' && stat !== 'completed' && stat !== 'inprogress')
            return res.status(500).send({ status: 0, message: "Invalid status" });
        const ref = db.collection('requests').where('landlord', '==', req.user.userid).where('forward', '==', true)
        const que = ref.orderBy('requestacceptiontime', 'desc')
        //   stat = stat.toLowerCase()
        if (stat === "active")
            snapshot = await que.where('leaseagreementstatus', '==', req.params.status).get();
        else if (stat === "completed")
            snapshot = await que.where('leaseagreementstatus', '==', "completed").get();
        else if (stat === "inprogress")
            snapshot = await que.where('end', '==', false).get();
        let response = []
        if (snapshot.empty) {
            return res.status(200).send({ status: 0, message: "No request available" });
        } else {
            snapshot.forEach(doc => {
                var requestdatatmp = doc.data();
                var expirytime = calculateTimePeriod(requestdatatmp.enddate)
                const currentdate = new Date();
                const startingdateoflease = new Date(requestdatatmp.startdate)
                var displaymessages = false;
                if (currentdate >= startingdateoflease && requestdatatmp.status === 'accepted') {
                    displaymessages = true;
                }
                var req = {
                    id: doc.id,
                    displaymessage: displaymessages,
                    property: {
                        id: requestdatatmp.propertyid,
                        title: requestdatatmp.propertytitle,
                        photos: requestdatatmp.photos
                    },
                    landlord: {
                        id: requestdatatmp.landlord,
                        name: requestdatatmp.landlordname,
                        photo: requestdatatmp.landlordprofilephoto,
                        phone: requestdatatmp.landlordphone,
                        landlordsignaturephoto: requestdatatmp.landlordsignaturephoto,
                    },
                    tenant: {
                        id: requestdatatmp.tenant,
                        name: requestdatatmp.tenantname,
                        photo: requestdatatmp.tenantprofilephoto,
                        phone: requestdatatmp.tenantphone,
                        tenantsignaturephoto: requestdatatmp.tenantsignaturephoto,
                    },
                    dealer: {
                        dealer: requestdatatmp.dealer,
                        name: requestdatatmp.dealername,
                        photo: requestdatatmp.dealerprofilephoto,
                        phone: requestdatatmp.dealerphone
                    },
                    expiremessage: expirytime,
                    leaseagreementtext: requestdatatmp.leaseagreementtext,
                    leaseagreementstatus: requestdatatmp.leaseagreementstatus,
                    tenantsignaturestatus: requestdatatmp.tenantsignaturestatus,
                    landlordsignaturestatus: requestdatatmp.landlordsignaturestatus,
                    duration: requestdatatmp.duration,
                    rentalduedate: requestdatatmp.rentalduedate,
                    dealersignaturestatus: requestdatatmp.dealersignaturestatus,
                    time: requestdatatmp.requestacceptiontime,
                    rentalvalue: requestdatatmp.rentalvalue,
                    rentaltype: requestdatatmp.rentaltype,
                    startdate: requestdatatmp.startdate,
                    enddate: requestdatatmp.enddate,
                    notes: requestdatatmp.notes,
                    securitydeposit: requestdatatmp.securitydeposit,
                    //status: status,
                    //remarks: req.body.remarks,
                    //responseip: req.body.ipaddress,
                    //ipaddress: doc.data().ipaddress,
                    forward: requestdatatmp.forward,
                    //description: requestdatatmp.description,
                    //requesttype: requestdatatmp.requesttype,
                    //status: requestdatatmp.status,
                }
                response.push(req);
            })
        }
        return res.status(200).send({ status: 1, leaseagreements: response });
    } catch (error) {
        return res.status(500).send({ status: 0, message: error.message });
    }
}

exports.getMyLeaseAgreementTenant = async (req, res) => {
    try {
        if (req.params.status !== undefined && !req.params.status)
            return res.status(500).send({ status: 0, message: "status is empty, null or undefined" });
        var stat = req.params.status.toLowerCase()
        if (stat !== 'active' && stat !== 'completed' && stat !== 'inprogress')
            return res.status(500).send({ status: 0, message: "Invalid status" });
        const ref = db.collection('requests').where('tenant', '==', req.user.userid).orderBy('requestacceptiontime', 'desc')
        var snapshot;
        if (stat === "active")
            snapshot = await ref.where('leaseagreementstatus', '==', req.params.status).get();
        else snapshot = await ref.where('leaseagreementstatus', '==', req.params.status).get();
        let response = []
        if (snapshot.empty) {
            return res.status(200).send({ status: 0, message: "No request available" });
        } else {
            snapshot.forEach(doc => {
                var requestdatatmp = doc.data();
                var expirytime = calculateTimePeriod(requestdatatmp.enddate)
                const currentdate = new Date();
                const startingdateoflease = new Date(requestdatatmp.startdate)
                var displaymessages = false;
                if (currentdate >= startingdateoflease && requestdatatmp.status === 'accepted') {
                    displaymessages = true;
                }
                var req = {
                    id: doc.id,
                    displaymessage: displaymessages,
                    property: {
                        id: requestdatatmp.propertyid,
                        title: requestdatatmp.propertytitle,
                        photos: requestdatatmp.photos
                    },
                    landlord: {
                        id: requestdatatmp.landlord,
                        name: requestdatatmp.landlordname,
                        photo: requestdatatmp.landlordprofilephoto,
                        phone: requestdatatmp.landlordphone,
                        landlordsignaturephoto: requestdatatmp.landlordsignaturephoto,
                    },
                    tenant: {
                        id: requestdatatmp.tenant,
                        name: requestdatatmp.tenantname,
                        photo: requestdatatmp.tenantprofilephoto,
                        phone: requestdatatmp.tenantphone,
                        tenantsignaturephoto: requestdatatmp.tenantsignaturephoto,
                    },
                    dealer: {
                        dealer: requestdatatmp.dealer,
                        name: requestdatatmp.dealername,
                        photo: requestdatatmp.dealerprofilephoto,
                        phone: requestdatatmp.dealerphone
                    },
                    expiremessage: expirytime,
                    rentalduedate: requestdatatmp.rentalduedate,
                    leaseagreementtext: requestdatatmp.leaseagreementtext,
                    leaseagreementstatus: requestdatatmp.leaseagreementstatus,
                    tenantsignaturestatus: requestdatatmp.tenantsignaturestatus,
                    landlordsignaturestatus: requestdatatmp.landlordsignaturestatus,
                    dealersignaturestatus: requestdatatmp.dealersignaturestatus,
                    time: requestdatatmp.requestacceptiontime,
                    rentalvalue: requestdatatmp.rentalvalue,
                    rentaltype: requestdatatmp.rentaltype,
                    startdate: requestdatatmp.startdate,
                    enddate: requestdatatmp.enddate,
                    notes: requestdatatmp.notes,
                    duration: requestdatatmp.duration,
                    securitydeposit: requestdatatmp.securitydeposit,
                    //status: status,
                    //remarks: req.body.remarks,
                    //responseip: req.body.ipaddress,
                    //ipaddress: doc.data().ipaddress,
                    //forward: requestdatatmp.forward,
                    //description: requestdatatmp.description,
                    //requesttype: requestdatatmp.requesttype,
                    //status: requestdatatmp.status,
                }
                response.push(req);
            })
        }
        return res.status(200).send({ status: 1, leaseagreements: response });
    } catch (error) {
        return res.status(500).send({ status: 0, message: error.message });
    }
}

exports.getMyLeaseAgreementDealer = async (req, res) => {
    try {
        if (req.params.status !== undefined && !req.params.status)
            return res.status(500).send({ status: 0, message: "status is empty, null or undefined" });
        var stat = req.params.status.toLowerCase()
        if (stat !== 'active' && stat !== 'completed' && stat !== 'inprogress')
            return res.status(500).send({ status: 0, message: "Invalid status" });
        const ref = db.collection('requests').where('dealer', '==', req.user.userid)
        var snapshot;
        if (stat === "active") {
            snapshot = await ref.where('leaseagreementstatus', '==', req.params.status).orderBy('requestacceptiontime', 'desc').get();
        }
        else {
            snapshot = await ref.where('leaseagreementstatus', '==', req.params.status).orderBy('requestacceptiontime', 'desc').get();
        }
        let response = []
        if (snapshot.empty) {
            return res.status(200).send({ status: 0, message: "No request available" });
        } else {
            snapshot.forEach(doc => {
                var requestdatatmp = doc.data();
                var expirytime = calculateTimePeriod(requestdatatmp.enddate)
                const currentdate = new Date();
                const startingdateoflease = new Date(requestdatatmp.startdate)
                var displaymessages = false;
                if (currentdate >= startingdateoflease && requestdatatmp.status === 'accepted') {
                    displaymessages = true;
                }
                var req = {
                    id: doc.id,
                    displaymessage: displaymessages,
                    property: {
                        id: requestdatatmp.propertyid,
                        title: requestdatatmp.propertytitle,
                        photos: requestdatatmp.photos
                    },
                    landlord: {
                        id: requestdatatmp.landlord,
                        name: requestdatatmp.landlordname,
                        photo: requestdatatmp.landlordprofilephoto,
                        phone: requestdatatmp.landlordphone,
                        landlordsignaturephoto: requestdatatmp.landlordsignaturephoto,
                    },
                    tenant: {
                        id: requestdatatmp.tenant,
                        name: requestdatatmp.tenantname,
                        photo: requestdatatmp.tenantprofilephoto,
                        phone: requestdatatmp.tenantphone,
                        tenantsignaturephoto: requestdatatmp.tenantsignaturephoto,
                    },
                    dealer: {
                        dealer: requestdatatmp.dealer,
                        name: requestdatatmp.dealername,
                        photo: requestdatatmp.dealerprofilephoto,
                        phone: requestdatatmp.dealerphone
                    },
                    leaseagreementtext: requestdatatmp.leaseagreementtext,
                    leaseagreementstatus: requestdatatmp.leaseagreementstatus,
                    tenantsignaturestatus: requestdatatmp.tenantsignaturestatus,
                    landlordsignaturestatus: requestdatatmp.landlordsignaturestatus,
                    duration: requestdatatmp.duration,
                    expiremessage: expirytime,
                    rentalvalue: requestdatatmp.rentalvalue,
                    rentalduedate: requestdatatmp.rentalduedate,
                    rentaltype: requestdatatmp.rentaltype,
                    startdate: requestdatatmp.startdate,
                    enddate: requestdatatmp.enddate,
                    notes: requestdatatmp.notes,
                    securitydeposit: requestdatatmp.securitydeposit,
                    dealersignaturestatus: requestdatatmp.dealersignaturestatus,
                    time: requestdatatmp.requestacceptiontime,
                    //status: status,
                    //remarks: req.body.remarks,
                    //responseip: req.body.ipaddress,
                    //ipaddress: doc.data().ipaddress,
                    forward: requestdatatmp.forward,
                    //description: requestdatatmp.description,
                    //requesttype: requestdatatmp.requesttype,
                    //status: requestdatatmp.status,
                }
                response.push(req);
            })
        }
        return res.status(200).send({ status: 1, leaseagreements: response });
    } catch (error) {
        return res.status(500).send({ status: 0, message: error.message });
    }
}

exports.updateTenantLeaseAgreement = async (leaseid, base64Signature) => {
    try {

        const key = leaseid;
        const folder = "leasesignatures";
        const bucket = admin.storage().bucket(bucketName)
        var randomfilename = "tenantsignature";
        const picdata = String(base64Signature).split(',')
        var fpoint = picdata[0].indexOf("/")
        var spoint = picdata[0].indexOf(";")
        const pictype = picdata[0].substring(fpoint + 1, spoint)
        const contenttype = "image/" + pictype
        console.log(pictype)
        console.log(contenttype)
        const filename = randomfilename + "." + pictype;
        console.log(filename)
        const filepath = folder + "/" + key + "/" + "tenant" + "/" + filename
        const file = bucket.file(filepath)

        var stream = require('stream');
        var bufferStream = new stream.PassThrough();
        bufferStream.end(Buffer.from(picdata[1], 'base64'));
        bufferStream.pipe(file.createWriteStream({
            public: true,
            metadata: {
                metadata: {
                    contentType: contenttype,
                    firebaseStorageDownloadTokens: uuidv4(),
                    cacheControl: "public, max-age=3000"
                }
            },
        }))
            // eslint-disable-next-line prefer-arrow-callback
            .on('error', function (err) {
                console.log(err.message)
            })
            // eslint-disable-next-line prefer-arrow-callback
            .on('finish', function () {
                // The file upload is complete.
                console.log("success")
            });
        db.collection('requests').doc(key).set({
            tenantsignaturephoto: createPublicFileURL(filepath),
            tenantsignaturestatus: false,
            landlordsignaturestatus: true,
            tenantsignaturetime: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true })
        console.log("tenant signature updated successfully");

    } catch (error) {
        console.log(error);
    }

}

exports.updateLandlordLeaseAgreement = async (req, res) => {

    try {
        const key = req.body.leaseagreementid;
        const folder = "leasesignatures";
        const bucket = admin.storage().bucket(bucketName)
        var randomfilename = "landlordsignature";
        const picdata = String(req.body.base64Signature).split(',')
        var fpoint = picdata[0].indexOf("/")
        var spoint = picdata[0].indexOf(";")
        const pictype = picdata[0].substring(fpoint + 1, spoint)
        const contenttype = "image/" + pictype
        console.log(pictype)
        console.log(contenttype)
        const filename = randomfilename + "." + pictype;
        console.log(filename)
        const filepath = folder + "/" + key + "/" + "landlord" + "/" + filename
        const file = bucket.file(filepath)

        var stream = require('stream');
        var bufferStream = new stream.PassThrough();
        bufferStream.end(Buffer.from(picdata[1], 'base64'));
        bufferStream.pipe(file.createWriteStream({
            public: true,
            metadata: {
                metadata: {
                    contentType: contenttype,
                    firebaseStorageDownloadTokens: uuidv4(),
                    cacheControl: "public, max-age=3000"
                }
            },
        }))
            // eslint-disable-next-line prefer-arrow-callback
            .on('error', function (err) {
                console.log(err.message)
            })
            // eslint-disable-next-line prefer-arrow-callback
            .on('finish', function () {
                // The file upload is complete.
                console.log("success")
            });
        try {
            var calculateduration = calculateMonths(req.body.startdate, req.body.enddate)
            var calculatenextduedate = getCustomDate(req.body.startdate)
            db.collection('requests').doc(key).update({
                landlordsignaturephoto: createPublicFileURL(filepath),
                // landlordsignaturestatus: false,
                status: 'accepted',
                landlordsignaturetime: admin.firestore.FieldValue.serverTimestamp(),
                leaseagreementstatus: "completed",
                requestacceptiontime: admin.firestore.FieldValue.serverTimestamp(),
                startdate: req.body.startdate,
                enddate: req.body.enddate,
                duration: calculateduration,
                rentalduedate: calculatenextduedate,
                rentaltype: req.body.rentaltype,
                securitydeposit: req.body.securitydeposit,
                end: false,
                landlordnotes: req.body.notes,
            })
            res.status(200).send({ status: 1, signatureurl: createPublicFileURL(filepath), message: "Lease Agreement Completed" });
            const refreq = await db.collection('requests').doc(key).get();

            var tem_request = refreq.data();
            var propertyid = tem_request.propertyid;
            db.collection('properties').doc(propertyid).update({
                status: tem_request.requesttype,
                tenant: tem_request.tenant,
                tenantname: tem_request.tenantname,
                tenantprofilephoto: tem_request.tenantprofilephoto,
                tenantphone: tem_request.tenantphone
            })

            db.collection('properties').doc(propertyid).collection("history").doc().create({
                tenant: tem_request.tenant,
                time: admin.firestore.FieldValue.serverTimestamp()
            })
            // return res.status(200).send({ status: 1, signatureurl: createPublicFileURL(filepath), message: "Lease Agreement Completed" });
            sendNotificationbyUserId(tem_request.tenant, tem_request.landlordname + notificationmessage.LANDLORD_SIGNED_LEASED);
            sendNotificationbyUserId(tem_request.dealer, tem_request.landlordname + notificationmessage.LANDLORD_SIGNED_LEASED);
        } catch (error) {
            return res.status(501).send({ status: 0, message: error.message });
        }

    } catch (error) {
        return res.status(200).send({ status: 0, message: error.message });
    }

}

exports.requestSignatureByDealer = async (req, res) => {
    try {
        db.collection('requests').doc(req.params.leaseagreementid).update({
            tenantsignaturestatus: true,
            dealersignaturestatus: false
        })
        return res.status(200).send({ status: 1, message: "Signature Request Sent" });
    } catch (error) {
        return res.status(200).send({ status: 0, message: error.message });
    }
}


function calculateTimePeriod(enddate) {
    var date = new Date();
    var date2 = new Date(enddate);
    var start_date = moment(date, 'DD-MM-YYYY HH:mm:ss');
    var end_date = moment(date2, 'DD-MM-YYYY HH:mm:ss');
    var duration = moment.duration(end_date.diff(start_date));
    var months = duration.asMonths();
    var year = duration.asYears();
    var days = duration.asDays();
    if (year < 1 && months >= 1)
        return "You lease is due to expire in " + Math.ceil(months) + " Months";

    if (months < 1 && days < 30)
        return "You lease is due to expire in " + Math.floor(year) + " Year";

    if (year >= 1)
        return "You lease is due to expire in " + Math.floor(year) + " Year " + (Math.ceil(months) - (12 * Math.floor(year))) + " Month";

    if (days >= 1)
        return "You lease is due to expire in " + Math.ceil(days) + " Days";

    return "You lease has been expied";

}

function getCustomDate(predate) {
    const start_date = new Date(predate);
    const date = new Date(predate);
    date.setMonth(date.getMonth() + 1)
    var month;
    var tmpmonth = parseInt(date.getMonth());
    if (tmpmonth > 9)
        month = tmpmonth + 1;
    else
        month = "0" + (tmpmonth + 1);

    var tmpdate;
    var tmpdateD = parseInt(date.getDate());
    if (tmpdateD < 10)
        tmpdate = "0" + tmpdateD;
    else
        tmpdate = tmpdateD;
    var currentdate = date.getUTCFullYear() + "-" + month + "-" + tmpdate;
    return currentdate;
}
function calculateMonths(startdate, enddate) {
    var date = new Date(startdate);
    var date2 = new Date(enddate);
    var start_date = moment(date, 'DD-MM-YYYY HH:mm:ss');
    var end_date = moment(date2, 'DD-MM-YYYY HH:mm:ss');
    var duration = moment.duration(end_date.diff(start_date));
    var months = duration.asMonths();
    return Math.ceil(months);
}