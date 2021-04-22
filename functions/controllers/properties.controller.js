/* eslint-disable consistent-return */
var admin = require("firebase-admin");
const db = admin.firestore();
const { updateTenantLeaseAgreement } = require("../controllers/leaseagreement.controller")
const { generateAccessToken, checkMailSubscription } = require("../auth/TokenAuth")
const { sendNotificationToSpecificUser, sendNotificationbyUserId } = require("../controllers/pushnotifications.controller")
//const { createNotificationLogForRequest } = require("../controllers/notificationslog.controller")
const geolib = require('geolib');
const notificationmessage = require("../messages/pushnotificationmessages")
// const { request } = require("express");
var moment = require("moment");
var sgMial = require('@sendgrid/mail');
const { randomInt } = require("crypto");

sgMial.setApiKey(process.env.SENDGRID_ONLY_MAIL_API_KEY)

exports.helloProperties = (req, res) => {
    return res.status(200).send({ status: 1, message: "ok" });
}

function calculateTimePeriod(enddate) {
    var date = new Date(enddate);
    var tmp = date.toLocaleDateString();
    return tmp;
}

function printSomething(req) {
    // "address": {
    //     "city": "Islamabad",
    //     "country": "pakistan",
    //     "street": "Street 1 , I-14",
    //     "house": "101A",
    //     "postal code": "44000"
    // }
    let address = {
        "city": req.body.address.city.toLowerCase(),
        "country": req.body.address.country.toLowerCase(),
        "street": req.body.address.street.toLowerCase(),
        "house": req.body.address.house.toLowerCase(),
        "postalcode": req.body.address.postalcode.toLowerCase()
    }
    console.log(req.body.address);
    console.log(address);

}

//create new Property
exports.createProperty = async (req, res) => {
    try {
        if (req.body.address.city === undefined || !req.body.address.city) {
            return res.status(400).send({ status: 0, message: "City Missing" })
        }
        if (req.body.address.country === undefined || !req.body.address.country) {
            return res.status(400).send({ status: 0, message: "Country Missing" })
        }
        if (req.body.address.streetaddress === undefined || !req.body.address.streetaddress) {
            return res.status(400).send({ status: 0, message: "Street Address Missing" })
        }
        if (req.body.address.postalcode === undefined || !req.body.address.postalcode) {
            return res.status(400).send({ status: 0, message: "Postal Code Missing" })
        }
        if (req.body.address.area === undefined || !req.body.address.area) {
            return res.status(400).send({ status: 0, message: "Area Missing" })
        }
        if (req.body.title === undefined || !req.body.title) {
            return res.status(400).send({ status: 0, message: "Title Missing" })
        }
        if (req.body.storageid === undefined || !req.body.storageid) {
            return res.status(400).send({ status: 0, message: "Storage Id Missing" })
        }
        if (req.body.size === undefined || !req.body.size) {
            return res.status(400).send({ status: 0, message: "Property Size Missing" })
        }
        if (req.body.sizeunit === undefined || !req.body.sizeunit) {
            return res.status(400).send({ status: 0, message: "Property Size Unit Missing" })
        } else {
            var sizeunittemp = req.body.sizeunit.toLowerCase();
            if (sizeunittemp !== "sq.ft" && sizeunittemp !== "marla" && sizeunittemp !== "kanal") {
                return res.status(400).send({ status: 0, message: "Property Size Unit Invalid" })
            }
        }
        if (req.body.rental === undefined || !req.body.rental) {
            return res.status(400).send({ status: 0, message: "Property Rental Missing" })
        }
        if (req.body.ipaddress === undefined || !req.body.ipaddress) {
            return res.status(400).send({ status: 0, message: "Ip address Missing" })
        }
        if (req.body.description === undefined || !req.body.description) {
            return res.status(400).send({ status: 0, message: "Description Missing" })
        }
        if (req.body.category === undefined || !req.body.category) {
            return res.status(400).send({ status: 0, message: "Catagory Missing" })
        }
        if (req.body.subcategory === undefined || !req.body.subcategory) {
            return res.status(400).send({ status: 0, message: "Property subcatagory Missing" })
        }
        if (req.body.category.toLowerCase() === 'commercial') {
            if (req.body.numberoffloors === undefined || !req.body.numberoffloors) {
                return res.status(400).send({ status: 0, message: "Number of floors Missing" })
            }
        } else if (req.body.category.toLowerCase() === 'residential') {
            if (req.body.bedrooms === undefined || !req.body.bedrooms) {
                return res.status(400).send({ status: 0, message: "Bedrooms Missing" })
            }
            if (req.body.bathrooms === undefined || !req.body.bathrooms) {
                return res.status(400).send({ status: 0, message: "Bathroom Missing" })
            }
        }

        let address = {
            "city": req.body.address.city.toLowerCase(),
            "country": req.body.address.country.toLowerCase(),
            "streetaddress": req.body.address.streetaddress.toLowerCase(),
            "postalcode": req.body.address.postalcode.toLowerCase(),
            "area": req.body.address.area.toLowerCase()
        }
        const ref = await db.collection('users').doc(req.user.userid).get();
        const keyforprop = db.collection('properties').doc().id;
        var profiledata = ref.data();
        if (req.body.category.toLowerCase() === 'commercial') {
            db.collection('properties').doc(keyforprop)
                .create({
                    title: req.body.title,
                    // citylowercase: req.body.address.city.toLowerCase(),
                    // countrylowercase: req.body.address.country.toLowerCase(),
                    securitydeposit: req.body.securitydeposit,
                    storageid: req.body.storageid,
                    address: address,
                    size: req.body.size,
                    sizeunit: req.body.sizeunit,
                    numberoffloors: req.body.numberoffloors,
                    category: req.body.category.toLowerCase(),
                    subcategory: req.body.subcategory.toLowerCase(),
                    description: req.body.description.toLowerCase(),
                    location: req.body.location,
                    rental: req.body.rental,
                    dealerreadstatus: false,
                    dealer: "not available",
                    dealername: "not available",
                    dealerprofilephoto: "not available",
                    dealerphone: "not available",
                    landlord: req.user.userid,
                    landlordname: profiledata.username.toLowerCase(),
                    landlordphone: profiledata.phone,
                    landlordprofilephoto: profiledata.photos,
                    status: "available",
                    photos: req.body.photos,
                    tenant: 'not available',
                    tenantname: "not available",
                    tenantprofilephoto: "not available",
                    tenantphone: "not available",
                    ipaddress: req.body.ipaddress,
                    time: admin.firestore.FieldValue.serverTimestamp()
                })
        } else if (req.body.category.toLowerCase() === 'residential') {
            db.collection('properties').doc(keyforprop)
                .create({
                    title: req.body.title,
                    // citylowercase: req.body.address.city.toLowerCase(),
                    // countrylowercase: req.body.address.country.toLowerCase(),
                    securitydeposit: req.body.securitydeposit,
                    storageid: req.body.storageid,
                    address: address,
                    size: req.body.size,
                    sizeunit: req.body.sizeunit,
                    bedrooms: req.body.bedrooms,
                    bathrooms: req.body.bathrooms,
                    category: req.body.category.toLowerCase(),
                    subcategory: req.body.subcategory.toLowerCase(),
                    description: req.body.description.toLowerCase(),
                    location: req.body.location,
                    rental: req.body.rental,
                    dealer: "not available",
                    dealerreadstatus: false,
                    dealername: "not available",
                    dealerprofilephoto: "not available",
                    dealerphone: "not available",
                    landlord: req.user.userid,
                    landlordname: profiledata.username.toLowerCase(),
                    landlordphone: profiledata.phone,
                    landlordprofilephoto: profiledata.photos,
                    status: "available",
                    photos: req.body.photos,
                    tenant: 'not available',
                    tenantname: "not available",
                    tenantprofilephoto: "not available",
                    tenantphone: "not available",
                    ipaddress: req.body.ipaddress,
                    time: admin.firestore.FieldValue.serverTimestamp()
                })
        } else {
            return res.status(400).send({ status: 0, message: "Property catagory can only be residential or commercial" })
        }
        //    if(checkMailSubscription(req.user.userid))
        createPropertySendMail(ref.data().email);
        res.status(201).send({ status: 1, message: "Your Property has been added successfully. It will be visible once it has finished processing.", propertyid: keyforprop });
        // runImage(req.body.photos[0], propertyid)
        return null;
    } catch (error) {
        console.log(error);
        return res.status(500).send({ status: 0, message: error.message });
    }
}
// function runImage(url, propertyid) {
//     testImage(url, propertyid).then(record.bind(null, url), record.bind(null, url));
// }
// async function testImage(url, propertyid) {
//     return new Promise(function (resolve, reject) {
//         var timeout = timeoutT || 5000000000;
//         var timer, img = new Image();
//         img.onerror = img.onabort = function () {
//             clearTimeout(timer);
//             reject("error");
//         };
//         img.onload = function () {
//             clearTimeout(timer);
//             testing(propertyid);
//             resolve("success");
//         };
//         timer = setTimeout(function () {
//             img.src = "//!!!!/noexist.jpg";
//             reject("timeout");
//         }, timeout);
//         img.src = url;
//     });
// }
// async function testing(propertyid) {
//     try {
//         await new Promise(resolve => setTimeout(resolve, 15000));
//         res.status(200).send({ status: 1, message: "Property has been added successfully", drafted: false })
//         const propertyref = await db.collection('draftedproperties').doc(propertyid).get()
//         if (propertyref.exists) {
//             await db.collection('properties').doc(propertyid).set(propertyref.data())
//             db.collection('properties').doc(propertyid).update({ time: admin.firestore.FieldValue.serverTimestamp() })
//             db.collection('abced').doc("1234").set({ time: admin.firestore.FieldValue.serverTimestamp() })
//             return null;
//         } 
//     } catch (error) {
//         console.log({ status: "inside testing", message: error.message })
//     }
// }
async function createPropertySendMail(email) {
    try {
        const msg = {
            to: email,
            from: "info@f3timetracker.com",
            subject: "Property Added into Account",
            text: "Request for resetting your password for " + email + ", Below is code to reset your password",
            html: "You have Created a new property into your account" + "<br><strong> Thank you for using our survices </strong>"
        };
        sgMial.send(msg);
    } catch (error) {
        console.log(error.logs)
    }
}

//drafted properties
exports.getLandlordPropertiesDrafted = async (req, res) => {
    try {
        var page = parseInt(req.params.page)
        var lim = parseInt(req.params.size)
        var start;
        if (req.params.page === 1) start = 0
        else start = page * lim - lim;
        var end = start + lim;
        //     console.log(req.params.id);
        const snapshot = db.collection('draftedproperties').where('landlord', '==', req.user.userid).orderBy('time', 'desc');
        //      const snapshot = query;
        let response = [];

        await snapshot.get().then(querySnapshot => {
            if (querySnapshot.empty) {
                //             console.log(querySnapshot.empty);
                return res.status(200).send({ status: 0, message: "Zero Drafted Property" });
            } else {
                if (start > querySnapshot.size) {
                    return res.status(200).send({ status: 0, properties: response });
                } else {
                    let docs = querySnapshot.docs;
                    let fortmp = docs[0];
                    const reslandlord = {
                        id: fortmp.data().landlord,
                        name: fortmp.data().landlordname,
                    }
                    for (var i = start; i < end && i < querySnapshot.size; i++) {
                        let doc = docs[i];
                        var propertydata = docs[i].data()
                        const selectedproperty = {
                            id: doc.id,
                            title: propertydata.title,
                            address: propertydata.address,
                            size: propertydata.size,
                            securitydeposit: propertydata.securitydeposit,
                            category: propertydata.category,
                            sizeunit: propertydata.sizeunit,
                            numberoffloors: propertydata.numberoffloors,
                            bedrooms: propertydata.bedrooms,
                            bathrooms: propertydata.bathrooms,
                            subcategory: propertydata.subcategory,
                            description: propertydata.description,
                            location: propertydata.location,
                            rental: propertydata.rental,
                            status: propertydata.status,
                            photos: propertydata.photos,
                            time: propertydata.time,
                            // ipaddress: propertydata.ipaddress,
                            dealer: {
                                id: propertydata.dealer,
                                name: propertydata.dealername,
                                photo: propertydata.dealerprofilephoto,
                                phone: propertydata.dealerphone
                            },
                            tenant: {
                                id: propertydata.tenant,
                                name: propertydata.tenantname,
                                photo: propertydata.tenantprofilephoto,
                                phone: propertydata.tenantphone
                            }
                        }
                        response.push(selectedproperty);
                    }
                    return res.status(200).send({ status: 1, total: response.length, landlord: reslandlord, properties: response });
                }
            }
        })
    } catch (error) {
        return res.status(500).send({ status: 0, message: error.message });
    }
}


//getLandlordPropertiesForSpecificDealer
//read all properties of landlord by id for specific dealer
exports.getLandlordPropertiesForSpecificDealer = async (req, res) => {
    try {
        var page = parseInt(req.params.page)
        var lim = parseInt(req.params.size)
        var start;
        if (req.params.page === 1) start = 0
        else start = page * lim - lim;
        var end = start + lim;
        //     console.log(req.params.id);
        const snapshot = db.collection('properties').where('landlord', '==', req.params.id).orderBy('time', 'desc');
        //      const snapshot = query;
        let response = [];

        await snapshot.get().then(querySnapshot => {
            if (querySnapshot.empty) {
                //             console.log(querySnapshot.empty);
                return res.status(200).send({ status: 0, message: "Properties do not exist" });
            } else {
                if (start > querySnapshot.size) {
                    return res.status(200).send({ status: 0, properties: response });
                } else {
                    let docs = querySnapshot.docs;
                    let fortmp = docs[0];
                    const reslandlord = {
                        id: fortmp.data().landlord,
                        name: fortmp.data().landlordname,
                    }
                    for (var i = start; i < end && i < querySnapshot.size; i++) {
                        let doc = docs[i];
                        var propertydata = doc.data()

                        if (propertydata.dealer === "not available") {
                            const selectedproperty = {
                                id: doc.id,
                                title: propertydata.title,
                                address: propertydata.address,
                                size: propertydata.size,
                                securitydeposit: propertydata.securitydeposit,
                                bedrooms: propertydata.bedrooms,
                                bathrooms: propertydata.bathrooms,
                                category: propertydata.category,
                                sizeunit: propertydata.sizeunit,
                                numberoffloors: propertydata.numberoffloors,
                                subcategory: propertydata.subcategory,
                                description: propertydata.description,
                                location: propertydata.location,
                                rental: propertydata.rental,
                                status: propertydata.status,
                                photos: propertydata.photos,
                                time: propertydata.time,
                                // ipaddress: propertydata.ipaddress,
                                dealer: {
                                    id: propertydata.dealer,
                                    name: propertydata.dealername,
                                    photo: propertydata.dealerprofilephoto,
                                    phone: propertydata.dealerphone
                                },
                                tenant: {
                                    id: propertydata.tenant,
                                    name: propertydata.tenantname,
                                    photo: propertydata.tenantprofilephoto,
                                    phone: propertydata.tenantphone
                                }
                            }
                            response.push(selectedproperty);
                        }

                    }
                    if (response.length === 0)
                        return res.status(200).send({ status: 0, message: "Properties do not exist" });
                    else
                        return res.status(200).send({ status: 1, total: response.length, landlord: reslandlord, properties: response });
                }
            }
        })
    } catch (error) {
        return res.status(500).send({ status: 0, message: error.message });
    }
}


//read all properties of landlord by id
exports.getLandlordProperties = async (req, res) => {
    try {
        var page = parseInt(req.params.page)
        var lim = parseInt(req.params.size)
        var start;
        if (req.params.page === 1) start = 0
        else start = page * lim - lim;
        var end = start + lim;
        //     console.log(req.params.id);
        const snapshot = db.collection('properties').where('landlord', '==', req.params.id).orderBy('time', 'desc');
        //      const snapshot = query;
        let response = [];

        await snapshot.get().then(querySnapshot => {
            if (querySnapshot.empty) {
                //             console.log(querySnapshot.empty);
                return res.status(200).send({ status: 0, message: "Properties do not exist" });
            } else {
                if (start > querySnapshot.size) {
                    return res.status(200).send({ status: 0, properties: response });
                } else {
                    let docs = querySnapshot.docs;
                    let fortmp = docs[0];
                    const reslandlord = {
                        id: fortmp.data().landlord,
                        name: fortmp.data().landlordname,
                    }
                    for (var i = start; i < end && i < querySnapshot.size; i++) {
                        let doc = docs[i];
                        var propertydata = docs[i].data()
                        const selectedproperty = {
                            id: doc.id,
                            title: propertydata.title,
                            address: propertydata.address,
                            size: propertydata.size,
                            securitydeposit: propertydata.securitydeposit,
                            category: propertydata.category,
                            sizeunit: propertydata.sizeunit,
                            numberoffloors: propertydata.numberoffloors,
                            bedrooms: propertydata.bedrooms,
                            bathrooms: propertydata.bathrooms,
                            subcategory: propertydata.subcategory,
                            description: propertydata.description,
                            location: propertydata.location,
                            rental: propertydata.rental,
                            status: propertydata.status,
                            photos: propertydata.photos,
                            time: propertydata.time,
                            // ipaddress: propertydata.ipaddress,
                            dealer: {
                                id: propertydata.dealer,
                                name: propertydata.dealername,
                                photo: propertydata.dealerprofilephoto,
                                phone: propertydata.dealerphone
                            },
                            tenant: {
                                id: propertydata.tenant,
                                name: propertydata.tenantname,
                                photo: propertydata.tenantprofilephoto,
                                phone: propertydata.tenantphone
                            }
                        }
                        response.push(selectedproperty);
                    }
                    return res.status(200).send({ status: 1, total: response.length, landlord: reslandlord, properties: response });
                }
            }
        })
    } catch (error) {
        return res.status(500).send({ status: 0, message: error.message });
    }
}
//get all properties by Location
exports.getAllPropertiesByLocation = async (req, res) => {
    try {
        /*   
        var page = parseInt(req.params.page)
             var lim = parseInt(req.params.size)
             var start;
             if (req.params.page === 1) start = 0
             else start = page * lim - lim;
             var end = start + lim;
             */
        var distance = (parseFloat(req.params.distance) + 6) * 0.000621 //50 meters // accuracy of +- 6 meters
        var latitude = parseFloat(req.params.latitude);
        var longitude = parseFloat(req.params.longitude);
        let lat = 0.0144927536231884
        let lon = 0.0181818181818182

        let lowerLat = latitude - (lat * distance)
        let lowerLon = longitude - (lon * distance)
        let greaterLat = latitude + (lat * distance)
        let greaterLon = longitude + (lon * distance)
        console.log(lowerLat)
        console.log(greaterLat)
        console.log(lowerLon)
        console.log(greaterLon)
        let response = []
        let query = db.collection('properties').where('location.latitude', '>', lowerLat)
        let query1 = await query.where('location.latitude', '<', greaterLat).get()
        if (query1.empty) {
            return res.status(200).send({ status: 0, message: "properties not available" })
        } else {
            query1.forEach(doc => {
                if (doc.data().location.longitude > lowerLon && doc.data().location.longitude < greaterLon) {
                    var propertydata = doc.data();
                    const selectedproperty = {
                        id: doc.id,
                        title: propertydata.title,
                        address: propertydata.address,
                        size: propertydata.size,
                        category: propertydata.category,
                        sizeunit: propertydata.sizeunit,
                        numberoffloors: propertydata.numberoffloors,
                        bedrooms: propertydata.bedrooms,
                        bathrooms: propertydata.bathrooms,
                        subcategory: propertydata.subcategory,
                        description: propertydata.description,
                        location: propertydata.location,
                        rental: propertydata.rental,
                        securitydeposit: propertydata.securitydeposit,
                        status: propertydata.status,
                        photos: propertydata.photos,
                        time: propertydata.time,
                        // ipaddress: propertydata.ipaddress,
                        landlord: {
                            id: propertydata.landlord,
                            name: propertydata.landlordname,
                            photo: propertydata.landlordprofilephoto,
                            phone: propertydata.landlordphone
                        },
                        dealer: {
                            id: propertydata.dealer,
                            name: propertydata.dealername,
                            photo: propertydata.dealerprofilephoto,
                            phone: propertydata.dealerphone
                        },
                        tenant: {
                            id: propertydata.tenant,
                            name: propertydata.tenantname,
                            photo: propertydata.tenantprofilephoto,
                            phone: propertydata.tenantphone
                        }
                    }
                    response.push(selectedproperty);
                }
            })
            return res.status(200).send({ status: 1, total: response.length, message: response })
        }
    } catch (error) {
        return res.status(500).send({ status: 0, message: error.message })
    }
    // let response = [];
    /*
    await query.get().then(querySnapshot => {
        if (querySnapshot.empty) {
            return res.status(200).send({ status: 0, message: "Properties do not exist" });
        } else {
            if (start > querySnapshot.size) {
                return res.status(200).send({ status: 0, properties: response });
            } else {
                let docs = querySnapshot.docs;
                console.log(start + " end:" + end + " size:" + querySnapshot.size);
                for (var i = start; i < end && i < querySnapshot.size; i++) {
                    let doc = docs[i];
                    const selectedproperty = {
                        id: doc.id,
                        title: doc.data().title,
                        address: doc.data().address,
                        size: doc.data().size,
                        bedrooms: doc.data().bedrooms,
                        bathrooms: doc.data().bathrooms,
                        subcategory: doc.data().subcategory,
                        description: doc.data().description,
                        location: doc.data().location,
                        rental: doc.data().rental,
                        status: doc.data().status,
                        photos: doc.data().photos,
                        time: doc.data().time,
                        landlord: {
                            id: doc.data().landlord,
                            name: doc.data().landlordname,
                        },
                        dealer: {
                            id: doc.data().dealer,
                            name: doc.data().dealername,
                        },
                        tenant: {
                            id: doc.data().tenant,
                            name: doc.data().tenantname,
                        }
                    }
                    response.push(selectedproperty);
                }
                return res.status(200).send({ status: 1, total: response.length, properties: response });
            }
        }
    })
} catch (error) {
    console.log(error);
    return res.status(500).send({ status: 0, error: error });
}
*/
}
//get all properties by city
exports.getAllPropertiesByCity = async (req, res) => {
    try {
        var city = req.params.city.toLowerCase();
        var page = parseInt(req.params.page)
        var lim = parseInt(req.params.size)
        var start;
        if (req.params.page === 1) start = 0
        else start = page * lim - lim;
        var end = start + lim;
        let query = db.collection('properties').where('address.city', '==', city).where('status', '==', "available").orderBy('time', 'desc');
        let response = [];
        await query.get().then(querySnapshot => {
            if (querySnapshot.empty) {
                return res.status(200).send({ status: 0, message: "Properties do not exist" });
            } else {
                if (start > querySnapshot.size) {
                    return res.status(200).send({ status: 0, properties: response });
                } else {
                    let docs = querySnapshot.docs;
                    for (var i = start; i < end && i < querySnapshot.size; i++) {
                        let doc = docs[i];
                        //console.log(doc);
                        var propertydata = docs[i].data()
                        const selectedproperty = {
                            id: doc.id,
                            title: propertydata.title,
                            address: propertydata.address,
                            size: propertydata.size,
                            category: propertydata.category,
                            sizeunit: propertydata.sizeunit,
                            numberoffloors: propertydata.numberoffloors,
                            location: propertydata.location,
                            rental: propertydata.rental,
                            securitydeposit: propertydata.securitydeposit,
                            bedrooms: propertydata.bedrooms,
                            bathrooms: propertydata.bathrooms,
                            subcategory: propertydata.subcategory,
                            description: propertydata.description,
                            // ipaddress: propertydata.ipaddress,
                            status: propertydata.status,
                            photos: propertydata.photos,
                            time: propertydata.time,
                            landlord: {
                                id: propertydata.landlord,
                                name: propertydata.landlordname,
                                photo: propertydata.landlordprofilephoto,
                                phone: propertydata.landlordphone
                            },
                            dealer: {
                                id: propertydata.dealer,
                                name: propertydata.dealername,
                                photo: propertydata.dealerprofilephoto,
                                phone: propertydata.dealerphone
                            },
                            tenant: {
                                id: propertydata.tenant,
                                name: propertydata.tenantname,
                                photo: propertydata.tenantprofilephoto,
                                phone: propertydata.tenantphone
                            }
                        }
                        response.push(selectedproperty);
                    }
                    return res.status(200).send({ status: 1, total: response.length, properties: response });
                }
            }
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send({ status: 0, error: error });
    }
}
//get all available properties only
exports.getAllAvailablePropertiesOnly = async (req, res) => {
    try {
        var page = parseInt(req.params.page)
        var lim = parseInt(req.params.size)
        var start;
        if (req.params.page === 1) start = 0
        else start = page * lim - lim;
        var end = start + lim;
        let query = db.collection('properties').where('status', '==', 'available').orderBy('time', 'desc');
        let response = [];
        await query.get().then(querySnapshot => {
            if (querySnapshot.empty) {
                return res.status(200).send({ status: 0, message: "Properties do not exist" });
            } else {
                if (start > querySnapshot.size) {
                    return res.status(200).send({ status: 0, properties: response });
                } else {
                    let docs = querySnapshot.docs;
                    console.log(start + " end:" + end + " size:" + querySnapshot.size);
                    for (var i = start; i < end && i < querySnapshot.size; i++) {
                        let doc = docs[i];
                        var propertydata = docs[i].data()
                        const selectedproperty = {
                            id: doc.id,
                            title: propertydata.title,
                            address: propertydata.address,
                            size: propertydata.size,
                            securitydeposit: propertydata.securitydeposit,
                            category: propertydata.category,
                            sizeunit: propertydata.sizeunit,
                            numberoffloors: propertydata.numberoffloors,
                            bedrooms: propertydata.bedrooms,
                            bathrooms: propertydata.bathrooms,
                            subcategory: propertydata.subcategory,
                            description: propertydata.description,
                            // ipaddress: propertydata.ipaddress,
                            location: propertydata.location,
                            rental: propertydata.rental,
                            status: propertydata.status,
                            photos: propertydata.photos,
                            time: propertydata.time,
                            landlord: {
                                id: propertydata.landlord,
                                name: propertydata.landlordname,
                                photo: propertydata.landlordprofilephoto,
                                phone: propertydata.landlordphone
                            },
                            dealer: {
                                id: propertydata.dealer,
                                name: propertydata.dealername,
                                photo: propertydata.dealerprofilephoto,
                                phone: propertydata.dealerphone
                            },
                            tenant: {
                                id: propertydata.tenant,
                                name: propertydata.tenantname,
                                photo: propertydata.tenantprofilephoto,
                                phone: propertydata.tenantphone
                            }
                        }
                        response.push(selectedproperty);
                    }
                    return res.status(200).send({ status: 1, total: response.length, properties: response });
                }
            }
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send({ status: 0, error: error });
    }
}



//get all properties
exports.getAllProperties = async (req, res) => {
    try {
        var page = parseInt(req.params.page)
        var lim = parseInt(req.params.size)
        var start;
        if (req.params.page === 1) start = 0
        else start = page * lim - lim;
        var end = start + lim;
        let query = db.collection('properties').orderBy('time', 'desc');
        let response = [];
        await query.get().then(querySnapshot => {
            if (querySnapshot.empty) {
                return res.status(200).send({ status: 0, message: "Properties do not exist" });
            } else {
                if (start > querySnapshot.size) {
                    return res.status(200).send({ status: 0, properties: response });
                } else {
                    let docs = querySnapshot.docs;
                    console.log(start + " end:" + end + " size:" + querySnapshot.size);
                    for (var i = start; i < end && i < querySnapshot.size; i++) {
                        let doc = docs[i];
                        var propertydata = docs[i].data()
                        const selectedproperty = {
                            id: doc.id,
                            title: propertydata.title,
                            address: propertydata.address,
                            size: propertydata.size,
                            category: propertydata.category,
                            sizeunit: propertydata.sizeunit,
                            numberoffloors: propertydata.numberoffloors,
                            bedrooms: propertydata.bedrooms,
                            bathrooms: propertydata.bathrooms,
                            securitydeposit: propertydata.securitydeposit,
                            subcategory: propertydata.subcategory,
                            description: propertydata.description,
                            // ipaddress: propertydata.ipaddress,
                            location: propertydata.location,
                            rental: propertydata.rental,
                            status: propertydata.status,
                            photos: propertydata.photos,
                            time: propertydata.time,
                            landlord: {
                                id: propertydata.landlord,
                                name: propertydata.landlordname,
                                photo: propertydata.landlordprofilephoto,
                                phone: propertydata.landlordphone
                            },
                            dealer: {
                                id: propertydata.dealer,
                                name: propertydata.dealername,
                                photo: propertydata.dealerprofilephoto,
                                phone: propertydata.dealerphone
                            },
                            tenant: {
                                id: propertydata.tenant,
                                name: propertydata.tenantname,
                                photo: propertydata.tenantprofilephoto,
                                phone: propertydata.tenantphone
                            }
                        }
                        response.push(selectedproperty);
                    }
                    return res.status(200).send({ status: 1, total: response.length, properties: response });
                }
            }
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send({ status: 0, error: error });
    }
}



//get all available properties by interest
exports.getAllAvailablePropertiesByInterest = async (req, res) => {
    try {
        var property_area;
        if (req.body.area !== undefined) {
            property_area = req.body.area
        } else {
            property_area = null
        }
        var property_category;
        if (req.body.category !== undefined) {
            property_catagory = req.body.category
        } else {
            property_category = null
        }
        var property_bedrooms;
        if (req.body.bedrooms !== undefined) {
            property_bedrooms = req.body.bedrooms
        } else {
            property_bedrooms = null
        }
        var property_bathrooms;
        if (req.body.bathrooms !== undefined) {
            property_bathrooms = req.body.bathrooms
        } else {
            property_bathrooms = null
        }
        var property_city;
        if (req.body.city !== undefined) {
            property_city = req.body.city
        } else {
            property_city = null
        }
        var rental_min, rental_max;
        if (req.body.rental !== undefined && req.body.rental !== null) {
            rental_min = req.body.rental[0]
            rental_max = req.body.rental[1]
        } else {
            rental_min = null
            rental_max = null
        }
        var page = parseInt(req.params.page)
        var lim = parseInt(req.params.size)
        var start;
        if (req.params.page === 1) start = 0
        else start = page * lim - lim;
        var end = start + lim;
        let query = db.collection('properties').where('status', '==', 'available').orderBy('time', 'desc');
        let response = [];
        await query.get().then(querySnapshot => {
            if (querySnapshot.empty) {
                return res.status(200).send({ status: 0, message: "Properties do not exist" });
            } else {
                if (start > querySnapshot.size) {
                    return res.status(200).send({ status: 0, properties: response });
                } else {
                    let docs = querySnapshot.docs;
                    //console.log(start + " end:" + end + " size:" + querySnapshot.size);
                    for (var i = start; i < end && i < querySnapshot.size; i++) {
                        let doc = docs[i];
                        let docdata = docs[i].data();
                        var typecheck = true;
                        var rentalcheck = true;
                        var bedroomcheck = true;
                        var bathroomcheck = true;
                        var citycheck = true;
                        var countrycheck = true;
                        var areacheck = true;
                        if (property_bedrooms !== null && property_bedrooms !== undefined) {
                            if (docdata.bedrooms !== property_bedrooms) {
                                bedroomcheck = false;
                            }
                        }
                        if (property_bathrooms !== null && property_bathrooms !== undefined) {
                            if (docdata.bathrooms !== property_bathrooms) {
                                bathroomcheck = false;
                            }
                        }
                        if (property_city !== null && property_city !== undefined) {
                            if (docdata.address.city.toLowerCase() !== property_city.toLowerCase()) {
                                citycheck = false;
                            }
                        }
                        if (property_area !== null && property_area !== undefined) {
                            if (docdata.address.area.toLowerCase() !== property_area.toLowerCase()) {
                                areacheck = false;
                            }
                        }
                        if (property_category !== null && property_category !== undefined) {
                            if (docdata.category.toLowerCase() !== property_category.toLowerCase()) {
                                typecheck = false;
                            }
                        }
                        if (req.body.rental !== null && req.body.rental !== undefined) {
                            //          console.log(doc.data().rental + " < " + rental_min + " || " + doc.data().rental + " > " + rental_max)
                            //          console.log((doc.data().rental < rental_min) + " || " + (doc.data().rental > rental_max))
                            if ((docdata.rental < rental_min) || (docdata.rental > rental_max)) {
                                rentalcheck = false
                            }
                        }
                        if (areacheck === true && rentalcheck === true && typecheck === true && citycheck === true && bedroomcheck === true && bathroomcheck === true) {
                            const selectedproperty = {
                                id: doc.id,
                                title: docdata.title,
                                address: docdata.address,
                                size: docdata.size,
                                category: docdata.category,
                                sizeunit: docdata.sizeunit,
                                numberoffloors: docdata.numberoffloors,
                                bedrooms: docdata.bedrooms,
                                bathrooms: docdata.bathrooms,
                                subcategory: docdata.subcategory,
                                description: docdata.description,
                                // ipaddress: docdata.ipaddress,
                                location: docdata.location,
                                securitydeposit: docdata.securitydeposit,
                                rental: docdata.rental,
                                status: docdata.status,
                                photos: docdata.photos,
                                time: docdata.time,
                                landlord: {
                                    id: docdata.landlord,
                                    name: docdata.landlordname,
                                    photo: docdata.landlordprofilephoto,
                                    phone: docdata.landlordphone
                                },
                                dealer: {
                                    id: docdata.dealer,
                                    name: docdata.dealername,
                                    photo: docdata.dealerprofilephoto,
                                    phone: docdata.dealerphone
                                },
                                tenant: {
                                    id: docdata.tenant,
                                    name: docdata.tenantname,
                                    photo: docdata.tenantprofilephoto,
                                    phone: docdata.tenantphone
                                }
                            }
                            response.push(selectedproperty);
                        } else {
                            end = end + 1;
                        }

                    }
                    return res.status(200).send({ status: 1, total: response.length, properties: response });
                }
            }
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send({ status: 0, error: error.message });
    }
}

exports.getDealerProperties = async (req, res) => {
    try {
        var page = parseInt(req.params.page)
        var lim = parseInt(req.params.size)
        var start;
        if (req.params.page === 1) start = 0
        else start = page * lim - lim;
        var end = start + lim;
        const query = db.collection('properties').where('dealer', '==', req.params.id).orderBy('time', 'desc');
        const snapshot = query;
        let response = [];

        await snapshot.get().then(querySnapshot => {
            if (querySnapshot.empty) {
                return res.status(200).send({ status: 0, message: "Properties do not exist" });
            } else {
                if (start > querySnapshot.size) {
                    return res.status(200).send({ status: 0, total: 0, properties: response });
                } else {
                    let docs = querySnapshot.docs;
                    let fortmp = docs[0];
                    const resdealer = {
                        id: fortmp.data().dealer,
                        name: fortmp.data().dealername,
                    }
                    for (var i = start; i < end && i < querySnapshot.size; i++) {
                        let doc = docs[i];
                        var propertydata = docs[i].data()
                        const selectedproperty = {
                            id: doc.id,
                            title: propertydata.title,
                            address: propertydata.address,
                            category: propertydata.category,
                            sizeunit: propertydata.sizeunit,
                            securitydeposit: propertydata.securitydeposit,
                            numberoffloors: propertydata.numberoffloors,
                            // ipaddress: propertydata.ipaddress,
                            size: propertydata.size,
                            bedrooms: propertydata.bedrooms,
                            bathrooms: propertydata.bathrooms,
                            subcategory: propertydata.subcategory,
                            description: propertydata.description,
                            location: propertydata.location,
                            rental: propertydata.rental,
                            status: propertydata.status,
                            photos: propertydata.photos,
                            time: propertydata.time,
                            landlord: {
                                id: propertydata.landlord,
                                name: propertydata.landlordname,
                                photo: propertydata.landlordprofilephoto,
                                phone: propertydata.landlordphone
                            },
                            tenant: {
                                id: propertydata.tenant,
                                name: propertydata.tenantname,
                                photo: propertydata.tenantprofilephoto,
                                phone: propertydata.tenantphone
                            }
                        }
                        response.push(selectedproperty);
                    }
                    return res.status(200).send({ status: 1, total: response.length, dealer: resdealer, properties: response });
                }
            }
        })
    } catch (error) {
        return res.status(500).send({ status: 0, message: error.message });
    }
}

exports.insertPropertyPhotosAndLocation = async (req, res) => {
    try {
        // await new Promise(resolve => setTimeout(resolve, 15000));
        // res.status(200).send({ status: 1, message: "Property has been added successfully", drafted: false })
        if (req.params.propertyid === undefined || req.params.propertyid === null)
            return res.status(200).send({ status: 1, message: "Property id null or undefined", drafted: false });
        const propertyref = await db.collection('draftedproperties').doc(req.params.propertyid).get()
        if (propertyref.exists) {
            await db.collection('properties').doc(req.params.propertyid).set(propertyref.data())
            db.collection('properties').doc(req.params.propertyid).update({ time: admin.firestore.FieldValue.serverTimestamp() })
            db.collection('draftedproperties').doc(req.params.propertyid).delete();
            // db.collection('abced').doc("1234").set({ time: admin.firestore.FieldValue.serverTimestamp() })
            return res.status(200).send({ status: 1, message: "Property has been added successfully", drafted: false });
        } else {
            return res.status(200).send({ status: 0, message: "Property does not exist" })
        }
    } catch (error) {
        return res.status(500).send({ status: 0, message: error.message })
    }
}
//Update Property Information -> Require JSON Object under the name userinformation
exports.updatePropertyInformation = async (req, res) => {
    try {
        var prop = req.body.propertyinformation;
        //  var updatedprop = proptoLowerCase()

        // console.log(prop.length)

        const propertyref = await db.collection('properties').doc(req.body.propertyid).get()
        if (propertyref.exists) {
            db.collection('properties').doc(req.body.propertyid).update(req.body.propertyinformation);
            if (req.body.propertyinformation.title !== undefined) {
                changePropertyNameInAllRecords(req.body.propertyid, req.body.propertyinformation)
            }
            if (req.body.propertyinformation.photos !== undefined && propertyref.data().status === 'drafted') {
                db.collection('properties').doc(req.body.propertyid).update({ status: 'available' });
                return res.status(200).send({ status: 1, message: "Property uploaded successfully" })
            }
            return res.status(200).send({ status: 1, message: "Property has been updated successfully" })
        } else {
            return res.status(200).send({ status: 0, message: "Property does not exist" })
        }
    } catch (error) {
        return res.status(500).send({ status: 0, message: error.message })
    }
}
async function changePropertyNameInAllRecords(propertyid, propertyinfo) {
    try {
        const requestref = await db.collection('requests').where('propertyid', '==', propertyid).get()
        if (!requestref.empty) {
            requestref.forEach(doc => {
                db.collection('requests').doc(doc.id).update({ propertytitle: propertyinfo.title })
            })
        }
        return undefined
    } catch (error) {
        return res.status(500).send({ status: 0, message: error.message })
    }
}

// Update property Status
exports.updatePropertyStatus = async (req, res) => {
    try {
        const usersRef = db.collection('properties').doc(req.body.propertyid)
        usersRef.update({ status: req.body.status })
        return res.status(200).send({ status: 1, message: "Property Status has been updated successfully" })
    } catch (error) {
        return res.status(200).send({ status: 0, message: error.message })
    }
}

// Delete Property
exports.deleteProperty = async (req, res) => {
    try {
        const usersRef = await db.collection('properties').doc(req.params.id).delete()
        deletePropertyRelatedData(req.params.id);
        return res.status(200).send({ status: 1, message: "Property has been deleted successfully" })
    } catch (error) {
        return res.status(500).send({ status: 0, message: error.message })
    }
}

async function deletePropertyRelatedData(propertyid) {
    try {
        const inspections = await db.collection('inspections').where('propertyid', '==', propertyid).get();
        let inspectionsids = []
        const path = db.collection('properties').doc(propertyid).collection('history');
        deleteCollection(db, path, 200)
        if (!inspections.empty) {
            inspections.forEach(inspec => {
                inspectionsids.push(inspec.id)
                console.log(inspec.id + "   " + inspectionsids[0])
                var promise = db.collection('inspections').doc(inspec.id).delete();
            })
            for (var i = 0; i < inspectionsids.length; i++) {
                var subinspections = db.collection('subinspections').where('inspectionid', '==', inspectionsids[i])
                var subpromise = subinspections.get().then(snapshot => {
                    if (!snapshot.empty) {
                        snapshot.forEach(subdoc => {
                            var subdelpromise = db.collection('subinspections').doc(subdoc.id).delete()
                        })
                    }
                    return null;
                })
            }
        }
        const requests = await db.collection('requests').where('propertyid', '==', propertyid).get();
        if (!requests.empty) {
            requests.forEach(doc => {
                var promise = db.collection('requests').doc(doc.id).delete();
            })
        }

    } catch (error) {
        console.log(error)
    }
}
async function deleteCollection(db, collectionPath, batchSize) {
    const collectionRef = collectionPath;
    const query = collectionRef.orderBy('__name__').limit(batchSize);

    return new Promise((resolve, reject) => {
        deleteQueryBatch(db, query, resolve).catch(reject);
    });
}

async function deleteQueryBatch(db, query, resolve) {
    const snapshot = await query.get();

    const batchSize = snapshot.size;
    if (batchSize === 0) {
        // When there are no documents left, we are done
        resolve();
        return;
    }

    // Delete documents in a batch
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        console.log(doc.id)
        batch.delete(doc.ref);
    });
    await batch.commit();

    // Recurse on the next process tick, to avoid
    // exploding the stack.
    process.nextTick(() => {
        deleteQueryBatch(db, query, resolve);
    });
}

// Attach dealer to a specific properties
exports.addDealerToProperty = async (req, res) => {
    try {
        const ref = db.collection('requests').doc()
        const que = db.collection('requests').where('propertyid', '==', req.body.propertyid);
        const que2 = que.where('status', '==', 'active')
        const snapshot = await que2.where('requesttype', '==', "add dealer").get();
        console.log(snapshot.size)
        if (snapshot.size === 1) { //if active
            return res.status(200).send({ status: 0, message: "You already have same request for this property" })
        } else {
            const propertydataref = await db.collection('properties').doc(req.body.propertyid).get();
            const propertydata = propertydataref.data();
            const dealerref = await db.collection('users').doc(req.user.userid).get();
            const dealerdata = dealerref.data()
            ref.create({
                propertytitle: propertydata.title,
                landlord: propertydata.landlord,
                landlordname: propertydata.landlordname,
                landlordprofilephoto: propertydata.landlordprofilephoto,
                landlordphone: propertydata.landlordphone,
                dealer: req.user.userid,
                landlordreadstatus: false,
                dealerreadstatus: false,
                photos: propertydata.photos,
                dealername: dealerdata.username,
                dealerprofilephoto: dealerdata.photos,
                dealerphone: dealerdata.phone,
                propertyid: req.body.propertyid,
                description: req.body.description,
                requesttype: "add dealer",
                ipaddress: req.body.ipaddress,
                forward: true,
                identifier: 'other',
                status: 'active', // active,accept,reject,done
                time: admin.firestore.FieldValue.serverTimestamp()
            })
            //   generateRequestSendMail(propertydata, tenantref.data(), req.body.requesttype)
            sendNotificationbyUserId(propertydata.landlord, dealerdata.username + " has requested for your property")
            return res.status(201).send({ status: 1, message: "New Request has been created", id: ref.id });
        }
    } catch (error) {
        return res.status(500).send({ status: 0, message: error.message });
    }

}
// Accept dealer or reject dealer
exports.acceptdealerrequestforproperty = async (req, res) => {
    try {
        if (req.params.status.toLowerCase() === 'accepted') {
            const requestref = await db.collection('requests').doc(req.params.requestid).get();
            if (requestref.exists) {
                const requestdata = requestref.data();
                const propertyRef = db.collection('properties').doc(requestdata.propertyid);
                const tmp = { dealer: requestdata.dealer, dealername: requestdata.dealername, dealerprofilephoto: requestdata.dealerprofilephoto, dealerphone: requestdata.dealerphone }
                console.log(tmp)
                propertyRef.update(tmp);
                db.collection('requests').doc(req.params.requestid).update({
                    status: "accepted",
                    processstatus: "completed",
                    requestacceptiontime: admin.firestore.FieldValue.serverTimestamp(),
                })
                sendNotificationbyUserId(requestdata.dealer, requestdata.landlordname + " has accepted your request")
                return res.status(200).send({ status: 1, message: "Request has been accepted successfully" });
            } else {
                return res.status(200).send({ status: 0, message: "Dealer has not been added, Invalid Request Id" });
            }
        } else {
            const requestref = await db.collection('requests').doc(req.params.requestid).get();
            if (requestref.exists) {
                const requestdata = requestref.data();
                sendNotificationbyUserId(requestdata.dealer, requestdata.landlordname + " has rejected your request")
            }
            db.collection('requests').doc(req.params.requestid).update({
                status: "rejected",
                requestacceptiontime: admin.firestore.FieldValue.serverTimestamp(),
            })
            return res.status(200).send({ status: 1, message: "Request has been rejected" });
        }
    } catch (error) {
        return res.status(500).send({ status: 0, message: error.message });
    }
}

//read data of specific property
exports.getPropertyInformation = async (req, res) => {
    try {
        const document = db.collection('properties').doc(req.params.id);
        let property = await document.get();
        if (!property.exists) return res.status(200).send({ status: 0, message: "Property does not exist" });
        var propertydata = property.data()
        let response = {
            id: property.id,
            title: propertydata.title,
            address: propertydata.address,
            size: propertydata.size,
            bedrooms: propertydata.bedrooms,
            bathrooms: propertydata.bathrooms,
            category: propertydata.category,
            sizeunit: propertydata.sizeunit,
            numberoffloors: propertydata.numberoffloors,
            subcategory: propertydata.subcategory,
            securitydeposit: propertydata.securitydeposit,
            description: propertydata.description,
            // ipaddress: doc.data().ipaddress,
            //  securitydeposit: propertydata.securitydeposit,
            location: propertydata.location,
            rental: propertydata.rental,
            status: propertydata.status,
            photos: propertydata.photos,
            time: propertydata.time,
            landlord: {
                id: propertydata.landlord,
                name: propertydata.landlordname,
                photo: propertydata.landlordprofilephoto,
                phone: propertydata.landlordphone
            },
            dealer: {
                id: propertydata.dealer,
                name: propertydata.dealername,
                photo: propertydata.dealerprofilephoto,
                phone: propertydata.dealerphone
            },
            tenant: {
                id: propertydata.tenant,
                name: propertydata.tenantname,
                photo: propertydata.tenantprofilephoto,
                phone: propertydata.tenantphone
            }
        }
        return res.status(200).send({ status: 1, property_information: response });
    } catch (error) {
        return res.status(500).send({ status: 0, error: error.message });
    }
}

// Remove dealer from specific property
exports.removeDealerFromProperty = async (req, res) => {
    try {
        const document = await db.collection('properties').doc(req.params.propertyid).update({ dealer: "not available", dealername: "not available", dealerprofilephoto: "not available", dealerphone: "not available" });
        return res.status(200).send({ status: 1, message: "Dealer has been successfully removed" });
    } catch (error) {
        return res.status(500).send({ status: 0, error: error.message });
    }
}

// Get dealers of a landlord (Current User - Landlord)
exports.getDealerOfLandlord = async (req, res) => {
    try {
        const query = db.collection('properties');
        const snapshot = await query.where('landlord', '==', req.user.userid).get();
        let dealerlist = [];
        let response = [];
        var flag;
        if (snapshot.empty) {
            return res.status(200).send({ status: 0, message: "Dealers not available" });
        }
        snapshot.forEach(doc => {
            var dealer = doc.data().dealer;
            var tem = doc.data().dealer.toLowerCase();
            if (tem !== 'not available') {
                flag = true;
                for (var i = 0; i < dealerlist.length; i++) {
                    if (dealer === dealerlist[i]) {
                        flag = false;
                        break;
                    }
                }
                if (flag) {
                    dealerlist.push(dealer);
                }
            }
            // if (tem === 'not available') {

            // } else {
            //     flag = true;
            //     for (var i = 0; i < dealerlist.length; i++) {
            //         if (dealer == dealerlist[i]) {
            //             flag = false;
            //             break;
            //         }
            //     }
            //     if (flag) {
            //         dealerlist.push(dealer);
            //     }
            // }
        });

        for (let dealerid of dealerlist) {                             //await removed
            // eslint-disable-next-line no-await-in-loop
            var que = await db.collection('users').doc(dealerid).get();
            var dealerdatatmp = que.data();
            var dd = {
                id: que.id,
                officeaddress: dealerdatatmp.officeaddress,
                workinghours: dealerdatatmp.workinghours,
                email: dealerdatatmp.email,
                name: dealerdatatmp.username,
                type: dealerdatatmp.type,
                phone: dealerdatatmp.phone,
                photos: dealerdatatmp.photos,
                cnic: dealerdatatmp.cnic,
                userstatus: dealerdatatmp.userstatus
            }
            response.push(dd)
        }
        return res.status(200).send({ status: 1, dealer_list: response });
    } catch (error) {
        return res.status(500).send({ status: 0, error: error.message });
    }
}

// get all landlords of a specific dealers (Current User- Dealer) 
exports.getLandlordOfDealer = async (req, res) => {
    try {
        const query = db.collection('properties');
        const snapshot = await query.where('dealer', '==', req.user.userid).get();
        let landlordlist = [];
        let response = [];
        var flag;
        if (snapshot.empty) {
            return res.status(200).send({ status: 0, message: "Landlords not available" });
        }
        snapshot.forEach(doc => {
            const landlord = doc.data().landlord;
            flag = true;
            for (var i = 0; i < landlordlist.length; i++) {
                if (landlord === landlordlist[i]) {
                    flag = false;
                    break;
                }
            }
            if (flag)
                landlordlist.push(landlord);
        });
        for (let landlordid of landlordlist) {             //removed await
            // eslint-disable-next-line no-await-in-loop
            var quee = await db.collection('users').doc(landlordid).get();
            var ll = {
                id: quee.id,
                email: quee.data().email,
                name: quee.data().username,
                type: quee.data().subcategory,
                phone: quee.data().phone,
                photos: quee.data().photos,
                cnic: quee.data().cnic,
                userstatus: quee.data().userstatus
            }
            response.push(ll)
        }
        return res.status(200).send({ status: 1, landlord_list: response });
    } catch (error) {
        return res.status(500).send({ status: 0, error: error.message });
    }
}


exports.getRequestInformation = async (req, res) => {
    try {
        const refer = await db.collection('requests').doc(req.params.requestid).get()
        var response;
        if (!refer.exists) {
            return res.status(200).send({ status: 0, message: "Invalid Request Id" });
        } else {
            var requestdatatmp = refer.data();
            if (requestdatatmp.requesttype.toLowerCase() === 'visit') {
                var retstatus;
                if (requestdatatmp.status.toLowerCase() !== "active")
                    retstatus = "Completed";
                else if (requestdatatmp.managerstatus === false && requestdatatmp.manager === "not available")
                    retstatus = "Pending" // pending, scheduled, In Progress, completed
                else if (requestdatatmp.managerstatus === false && requestdatatmp.manager !== "not available")
                    retstatus = "Scheduled"
                else if (requestdatatmp.managerstatus === true)
                    retstatus = "In Progress"

                response = {
                    id: refer.id,
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
            } else if (requestdatatmp.requesttype.toLowerCase() === 'add dealer') {
                response = {
                    id: refer.id,
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
                    dealer: {
                        dealer: requestdatatmp.dealer,
                        name: requestdatatmp.dealername,
                        photo: requestdatatmp.dealerprofilephoto,
                        phone: requestdatatmp.dealerphone
                    },
                    // ipaddress: doc.data().ipaddress,
                    description: requestdatatmp.description,
                    requesttype: requestdatatmp.requesttype,
                    status: requestdatatmp.status,
                    time: requestdatatmp.time
                }
            }
            else {
                response = {
                    id: refer.id,
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
                        dealer: requestdatatmp.dealer,
                        name: requestdatatmp.dealername,
                        photo: requestdatatmp.dealerprofilephoto,
                        phone: requestdatatmp.dealerphone
                    },
                    // ipaddress: doc.data().ipaddress,
                    forward: requestdatatmp.forward,
                    description: requestdatatmp.description,
                    requesttype: requestdatatmp.requesttype,
                    status: requestdatatmp.status,
                    time: requestdatatmp.time
                }

            }
            return res.status(200).send({ status: 1, request: response });
        }

    } catch (error) {
        return res.status(500).send({ status: 0, message: error.message });
    }
}


exports.getMyRequestsLandlord = async (req, res) => {
    try {
        const ref = db.collection('requests').where('landlord', '==', req.user.userid).where('forward', '==', true).where('identifier', '==', 'other')
        const que = ref.orderBy('time', 'desc')
        var snapshot;
        var stat = req.params.status
        stat = stat.toLowerCase()
        if (stat === "active")
            snapshot = await que.where('status', '==', req.params.status).get();
        else snapshot = await que.where('processstatus', '==', "completed").get();
        let response = []
        if (snapshot.empty) {
            return res.status(200).send({ status: 0, message: "No request available" });
        } else {
            snapshot.forEach(doc => {
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
                        retstatus = "In Progress"
                    var req = {
                        id: doc.id,
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
                    response.push(req);
                } else if (requestdatatmp.requesttype.toLowerCase() === 'add dealer') {
                    const req = {
                        id: doc.id,
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
                        dealer: {
                            dealer: requestdatatmp.dealer,
                            name: requestdatatmp.dealername,
                            photo: requestdatatmp.dealerprofilephoto,
                            phone: requestdatatmp.dealerphone
                        },
                        // ipaddress: doc.data().ipaddress,
                        description: requestdatatmp.description,
                        requesttype: requestdatatmp.requesttype,
                        status: requestdatatmp.status,
                        time: requestdatatmp.time
                    }
                    response.push(req);
                }
                else {
                    const req = {
                        id: doc.id,
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
                            dealer: requestdatatmp.dealer,
                            name: requestdatatmp.dealername,
                            photo: requestdatatmp.dealerprofilephoto,
                            phone: requestdatatmp.dealerphone
                        },
                        // ipaddress: doc.data().ipaddress,
                        description: requestdatatmp.description,
                        requesttype: requestdatatmp.requesttype,
                        status: requestdatatmp.status,
                        time: requestdatatmp.time
                    }
                    response.push(req);
                }

            });

        }
        return res.status(200).send({ status: 1, Myrequest: response });
    } catch (error) {
        return res.status(500).send({ status: 0, message: error.message });
    }
}

//////////
exports.getMyRequestsManagers = async (req, res) => {
    try {
        const ref = db.collection('requests').where('manager', '==', req.user.userid).where('identifier', '==', 'other')
        const que = ref.orderBy('time', 'desc')
        var snapshotrequest;
        let response = []
        var stat = req.params.status
        stat = stat.toLowerCase()
        if (stat === "active")
            snapshotrequest = await que.where('status', '==', "active").get();
        else snapshotrequest = await que.where('processstatus', '==', "completed").get();

        // snapshotrequest = await que.where('status', '==', 'active').get();
        if (snapshotrequest.empty) {
            return res.status(200).send({ status: 0, message: "No request available" });
        } else {
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
                        retstatus = "In Progress"
                    var req = {
                        id: doc.id,
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
                    response.push(req);
                }
            });
        }
        return res.status(200).send({ status: 1, Myrequest: response });
    } catch (error) {
        return res.status(501).send({ status: 0, message: error.message });
    }

}

/////////

exports.getMyRequestsTenant = async (req, res) => {
    try {
        const ref = db.collection('requests').where('tenant', '==', req.user.userid).orderBy('time', 'desc').where('identifier', '==', 'other')
        var snapshot;
        var stat = req.params.status
        stat = stat.toLowerCase()
        if (stat === "active")
            snapshot = await ref.where('status', '==', req.params.status).get();
        else snapshot = await ref.where('processstatus', '==', "completed").get();
        let response = []
        if (snapshot.empty) {
            return res.status(200).send({ status: 0, message: "No request available" });
        } else {
            snapshot.forEach(doc => {
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
                        retstatus = "In Progress"
                    var req = {
                        id: doc.id,
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
                    response.push(req);
                } else {
                    const req = {
                        id: doc.id,
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
                            dealer: requestdatatmp.dealer,
                            name: requestdatatmp.dealername,
                            photo: requestdatatmp.dealerprofilephoto,
                            phone: requestdatatmp.dealerphone
                        },
                        // ipaddress: doc.data().ipaddress,
                        forward: requestdatatmp.forward,
                        description: requestdatatmp.description,
                        requesttype: requestdatatmp.requesttype,
                        status: requestdatatmp.status,
                        time: requestdatatmp.time
                    }
                    response.push(req);
                }
            });

        }
        return res.status(200).send({ status: 1, Myrequest: response });
    } catch (error) {
        return res.status(500).send({ status: 0, message: error.message });
    }
}
exports.getNearestManager = async (req, res) => {
    try {
        const ref = await db.collection('properties').doc(req.params.propertyid).get();
        if (ref.exists) {
            const propertydata = ref.data()
            const query = db.collection('users');
            const snapshot = await query.where('dealer', '==', propertydata.dealer).get();
            let response;
            if (snapshot.empty) {
                return res.status(200).send({ status: 0, message: "Managers do not exist" });
            } else {
                var lowestvalue;
                var firsttime = true;
                snapshot.forEach(doc => {
                    var manager = doc.id;
                    var managerdata = doc.data();
                    var value = geolib.getPreciseDistance(
                        { latitude: propertydata.location.latitude, longitude: propertydata.location.latitude },
                        { latitude: managerdata.location.latitude, longitude: managerdata.location.latitude }
                    );
                    if (firsttime && managerdata.userstatus === 'active') {
                        lowestvalue = value
                        firsttime = false
                        response = {
                            id: manager,
                            name: managerdata.username,
                            email: managerdata.email,
                            phone: managerdata.phone,
                            type: managerdata.type,
                            userstatus: managerdata.userstatus,
                            photos: managerdata.photos,
                            location: managerdata.location,
                            cnic: managerdata.cnic,
                            time: managerdata.time
                        }
                    } else {
                        if (value < lowestvalue && managerdata.userstatus === 'active') {
                            lowestvalue = value
                            response = {
                                id: manager,
                                name: managerdata.username,
                                email: managerdata.email,
                                phone: managerdata.phone,
                                type: managerdata.type,
                                userstatus: managerdata.userstatus,
                                photos: managerdata.photos,
                                location: managerdata.location,
                                cnic: managerdata.cnic,
                                time: managerdata.time
                            }
                        }
                    }
                });
                if (response === undefined)
                    return res.status(200).send({ status: 0, message: "Manager not available" });
                else
                    return res.status(200).send({ status: 1, NearestManager: response });
            }
        }
    } catch (error) {
        return null;
    }

}
exports.getManagerPropertiesList = async (req, res) => {
    try {
        const query = db.collection('inspections');
        var response = [];
        var propertiesList = [];
        var finallist = [];
        const snapshot = await query.where('assignto', '==', req.user.userid).orderBy('time', 'desc').get();
        //    const snapshot = await snapshot1.where('inspectionstatus', '==', req.params.status).get();
        if (snapshot.empty) {
            return res.status(200).send({ status: 0, message: 'Properties List not available for you' });
        } else {
            snapshot.forEach(doc => {
                var inspectiondata = doc.data();
                propertiesList.push(inspectiondata.propertyid);
            });
            var flag;
            for (var i = 0; i < propertiesList.length; i++) {
                flag = true;
                for (var j = i + 1; j < propertiesList.length; j++) {
                    if (propertiesList[i] === propertiesList[j]) {
                        flag = false;
                    }
                }
                if (flag) {
                    finallist.push(propertiesList[i])
                }
            }
            for (let k = 0; k < finallist.length; k++) {
                // eslint-disable-next-line no-await-in-loop
                var ref = await db.collection('properties').doc(finallist[k]).get();
                if (ref.exists) {
                    var propertydata = ref.data()
                    const selectedproperty = {
                        id: ref.id,
                        title: propertydata.title,
                        address: propertydata.address,
                        size: propertydata.size,
                        securitydeposit: propertydata.securitydeposit,
                        category: propertydata.category,
                        sizeunit: propertydata.sizeunit,
                        numberoffloors: propertydata.numberoffloors,
                        bedrooms: propertydata.bedrooms,
                        bathrooms: propertydata.bathrooms,
                        subcategory: propertydata.subcategory,
                        description: propertydata.description,
                        // ipaddress: propertydata.ipaddress,
                        location: propertydata.location,
                        rental: propertydata.rental,
                        status: propertydata.status,
                        photos: propertydata.photos,
                        time: propertydata.time,
                        landlord: {
                            id: propertydata.landlord,
                            name: propertydata.landlordname,
                            photo: propertydata.landlordprofilephoto,
                            phone: propertydata.landlordphone
                        },
                        dealer: {
                            id: propertydata.dealer,
                            name: propertydata.dealername,
                            photo: propertydata.dealerprofilephoto,
                            phone: propertydata.dealerphone
                        },
                        tenant: {
                            id: propertydata.tenant,
                            name: propertydata.tenantname,
                            photo: propertydata.tenantprofilephoto,
                            phone: propertydata.tenantphone
                        }
                    }
                    response.push(selectedproperty);
                }

            }
            return res.status(200).send({ status: 1, properties: response });
        }
    } catch (error) {
        return res.status(500).send({ status: 0, message: error.message });
    }
}
exports.getPropertiesWithoutDealer = async (req, res) => {
    try {
        var page = parseInt(req.params.page)
        var lim = parseInt(req.params.size)
        var start;
        if (req.params.page === 1) start = 0
        else start = page * lim - lim;
        var end = start + lim;
        let query = db.collection('properties').where('dealer', '==', 'not available').orderBy('time', 'desc');
        let response = [];
        await query.get().then(querySnapshot => {
            if (querySnapshot.empty) {
                return res.status(200).send({ status: 0, message: "Properties do not exist" });
            } else {
                if (start > querySnapshot.size) {
                    return res.status(200).send({ status: 0, properties: response });
                } else {
                    let docs = querySnapshot.docs;
                    console.log(start + " end:" + end + " size:" + querySnapshot.size);
                    for (var i = start; i < end && i < querySnapshot.size; i++) {
                        let doc = docs[i];
                        var propertydata = docs[i].data()
                        const selectedproperty = {
                            id: doc.id,
                            title: propertydata.title,
                            address: propertydata.address,
                            size: propertydata.size,
                            category: propertydata.category,
                            sizeunit: propertydata.sizeunit,
                            numberoffloors: propertydata.numberoffloors,
                            bedrooms: propertydata.bedrooms,
                            bathrooms: propertydata.bathrooms,
                            subcategory: propertydata.subcategory,
                            securitydeposit: propertydata.securitydeposit,
                            description: propertydata.description,
                            // ipaddress: propertydata.ipaddress,
                            location: propertydata.location,
                            rental: propertydata.rental,
                            status: propertydata.status,
                            photos: propertydata.photos,
                            time: propertydata.time,
                            landlord: {
                                id: propertydata.landlord,
                                name: propertydata.landlordname,
                                photo: propertydata.landlordprofilephoto,
                                phone: propertydata.landlordphone
                            },
                            dealer: {
                                id: propertydata.dealer,
                                name: propertydata.dealername,
                                photo: propertydata.dealerprofilephoto,
                                phone: propertydata.dealerphone
                            },
                            tenant: {
                                id: propertydata.tenant,
                                name: propertydata.tenantname,
                                photo: propertydata.tenantprofilephoto,
                                phone: propertydata.tenantphone
                            }
                        }
                        response.push(selectedproperty);
                    }
                    return res.status(200).send({ status: 1, total: response.length, properties: response });
                }
            }
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send({ status: 0, error: error });
    }
}
exports.getMyRequestsDealer = async (req, res) => {
    try {
        const ref = db.collection('requests').where('dealer', '==', req.user.userid).where('identifier', '==', 'other')
        var snapshot;
        var stat = req.params.status
        stat = stat.toLowerCase()
        if (stat === "active") {
            snapshot = await ref.where('status', '==', req.params.status).orderBy('time', 'desc').get();
        }
        else {
            snapshot = await ref.where('processstatus', '==', "completed").orderBy('time', 'desc').get();
        }
        let response = []
        if (snapshot.empty) {
            return res.status(200).send({ status: 0, message: "No request available" });
        } else {
            snapshot.forEach(doc => {
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
                        retstatus = "In Progress"
                    var req = {
                        id: doc.id,
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
                    response.push(req);
                } else if (requestdatatmp.requesttype.toLowerCase() !== 'add dealer') {
                    var req1 = {
                        id: doc.id,
                        property: {
                            id: requestdatatmp.propertyid,
                            title: requestdatatmp.propertytitle
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
                            dealer: requestdatatmp.dealer,
                            name: requestdatatmp.dealername,
                            photo: requestdatatmp.dealerprofilephoto,
                            phone: requestdatatmp.dealerphone
                        },
                        // ipaddress: requestdatatmp.ipaddress,
                        forward: requestdatatmp.forward,
                        description: requestdatatmp.description,
                        requesttype: requestdatatmp.requesttype,
                        status: requestdatatmp.status,
                        time: requestdatatmp.time

                    }
                    response.push(req1);
                }
            });
        }
        return res.status(200).send({ status: 1, Myrequest: response });
    } catch (error) {
        return res.status(500).send({ status: 0, message: error.message });
    }
}

exports.forwardRequestDealer = async (req, res) => {
    try {
        const ref = db.collection('requests').doc(req.params.requestid)
        var promise = ref.get().then(doc => {
            if (doc.data().forward === true) {
                return res.status(200).send({ status: 0, message: "Request is already sent to landlord" })
            } else {
                db.collection('requests').doc(req.params.requestid).update({ forward: true, forwardtime: admin.firestore.FieldValue.serverTimestamp() })
                sendNotificationbyUserId(doc.data().landlord, doc.data().dealername + notificationmessage.DEALER_FORWARD_PROPERTY_REQUEST);
                return res.status(200).send({ status: 0, message: "Request has been sent to landlord" })
                // createNotificationLogForRequest(doc.data().landlord,
                //     { 
                //         propertyid: req.body.propertyid, 
                //         requestid: req.params.requestid, 
                //         dealerid:req.user.userid,
                //         requesttype:"leased",
                //     })
            }
        })
    } catch (error) {
        console.log(error.message)
        return res.status(200).send({ status: 0, message: error.message })
    }
}
exports.cancelRequestTenant = async (req, res) => {
    try {
        db.collection('requests').doc(req.params.requestid).update({
            status: "canceled"
        });
        return res.status(200).send({ status: 1, message: "Request has been canceled" });
    } catch (error) {
        return res.status(500).send({ status: 0, message: error.message });
    }
}
// exports.addManagerToVisitRequest = async (req, res) => {

//     try {
//         var visitid = req.params.requestid
//         var manager = req.params.managerid
//         const managerref = await db.collection('users').doc(manager).get();
//         if (managerref.exists) {
//             const managerdata = managerref.data()
//             db.collection('visitrequest').doc(visitid).update({
//                 manager: managerref.id,
//                 managername: managerdata.username,
//                 managerprofilephoto: managerdata.photos,
//                 managerphone: managerdata.phone,
//             })
//         } else {
//             return res.status(500).send({ status: 0, message: "Invalid Manager Id"});
//         }

//     } catch (error) {
//         return res.status(500).send({ status: 0, message: error.message });
//     }

// }
exports.addManagerToVisitRequest = async (req, res) => {
    try {
        var visitid = req.params.requestid
        var manager = req.params.managerid
        if (visitid === undefined || !visitid) {
            res.status(200).send({ status: 1, message: "Request id is empty, null or undefined" });
        }
        if (manager === undefined || !manager) {
            res.status(200).send({ status: 1, message: "Manager id is empty, null or undefined" });
        }
        const managerref = await db.collection('users').doc(manager).get();
        if (managerref.exists) {
            const managerdata = managerref.data()
            db.collection('requests').doc(visitid).update({
                manager: managerref.id,
                managername: managerdata.username,
                managerprofilephoto: managerdata.photos,
                managerphone: managerdata.phone,
            })
            res.status(200).send({ status: 1, message: "Manager has been addded succesfully" });
            sendNotificationbyUserId(managerref.id, notificationmessage.DEALER_ASSIGN_JOB);
            const refe = await db.collection('requests').doc(visitid).get()
            if (refe.exists)
                sendNotificationbyUserId(refe.data().tenant, notificationmessage.TENANT_VISIT_REQUEST_INPROGRESS);
            return null;
        } else {
            return res.status(500).send({ status: 0, message: "Invalid Manager Id" });
        }

    } catch (error) {
        return res.status(500).send({ status: 0, message: error.message });
    }

}
// exports.changeManagerStatusInVisitRequest = async (req, res) => {
//     try {
//         db.collection("requests").doc(req.params.requestid).update({
//             managerstatus: true
//         })
//         res.status(200).send({
//             status: 1, message: "Request has been accepted successfully"
//         })
//         const ref = await db.collection("requests").doc(req.params.requestid).get();
//         // if(ref.exists)
//         // sendNotificationbyUserId(ref.data().dealer," ")
//         // sendNotificationbyUserId(ref.data().tenant," ")
//         return null;
//     } catch (error) {
//         return res.status(200).send({
//             status: 0, message: error.message
//         })
//     }
// }

exports.managerAcceptVisitRequest = async (req, res) => {
    try {
        var visitid = req.params.requestid
        db.collection('requests').doc(visitid).update({
            managerstatus: true
        })
        res.status(200).send({ status: 1, message: "Request accepted successfully" })
        const reffordata = await db.collection('requests').doc(visitid).get()
        if (reffordata.exists) {
            sendNotificationbyUserId(reffordata.data().dealer, reffordata.data().managername + notificationmessage.MANAGER_ACCEPTED_VISIT_REQUEST);
            sendNotificationbyUserId(reffordata.data().tenant, reffordata.data().managername + notificationmessage.MANAGER_ACCEPTED_VISIT_REQUEST_TO_TENANT);
        }
        return null;
    } catch (error) {
        return res.status(501).send({ status: 0, error: error.message })
    }

}

exports.generateRequestForProperty = async (req, res) => {
    try {
        const ref = db.collection('requests').doc()
        const que = db.collection('requests').where('propertyid', '==', req.body.propertyid);
        const que1 = que.where('tenant', '==', req.user.userid)
        const que2 = que1.where('status', '==', 'active')
        const snapshot = await que2.where('requesttype', '==', req.body.requesttype.toLowerCase()).get();
        console.log(snapshot.size)
        if (snapshot.size === 1) { //if active
            return res.status(200).send({ status: 0, message: "You already have same request for this property" })
        } else {
            const propertydataref = await db.collection('properties').doc(req.body.propertyid).get();
            const propertydata = propertydataref.data();
            var dealerid = propertydata.dealer;
            if (dealerid === "not available") {
                return res.status(201).send({ status: 0, message: "Dealer not available for this property" });
            } else if (req.body.requesttype.toLowerCase() === 'visit') {
                const tenantref = await db.collection('users').doc(req.user.userid).get();
                const tenantdata = tenantref.data()
                ref.create({
                    tenant: req.user.userid,
                    tenantname: tenantdata.username,
                    tenantprofilephoto: tenantdata.photos,
                    tenantphone: tenantdata.phone,
                    propertytitle: propertydata.title,
                    landlord: propertydata.landlord,
                    photos: propertydata.photos,
                    managerreadstatus: false,
                    dealerreadstatus: false,
                    landlordreadstatus: false,
                    tenantreadstatus: false,
                    identifier: "other",
                    landlordname: propertydata.landlordname,
                    landlordprofilephoto: propertydata.landlordprofilephoto,
                    landlordphone: propertydata.landlordphone,
                    dealer: propertydata.dealer,
                    dealername: propertydata.dealername,
                    dealerprofilephoto: propertydata.dealerprofilephoto,
                    dealerphone: propertydata.dealerphone,
                    manager: "not available",
                    managername: "not available",
                    managerprofilephoto: "not available",
                    managerphone: "not available",
                    managerstatus: false,
                    propertyid: req.body.propertyid,
                    description: req.body.description,
                    requesttype: req.body.requesttype,
                    ipaddress: req.body.ipaddress,
                    forward: false,
                    status: 'active', // active,accept,reject,done
                    time: admin.firestore.FieldValue.serverTimestamp()
                })
                generateRequestSendMail(propertydata, tenantref.data(), req.body.requesttype)
                sendNotificationbyUserId(propertydata.dealer, tenantdata.username + notificationmessage.TENANT_REQUEST_FOR_PROPERTY_VISIT);
                sendNotificationbyUserId(propertydata.landlord, tenantdata.username + notificationmessage.TENANT_REQUEST_FOR_PROPERTY_VISIT_LANDLORD + propertydata.dealername);
                return res.status(201).send({ status: 1, message: "Visit Request has been created", id: ref.id });
            } else if (req.body.requesttype.toLowerCase() === 'repair') {
                const tenantref = await db.collection('users').doc(req.user.userid).get();
                const tenantdata = tenantref.data()
                ref.create({
                    tenant: req.user.userid,
                    tenantname: tenantdata.username,
                    tenantprofilephoto: tenantdata.photos,
                    tenantphone: tenantdata.phone,
                    propertytitle: propertydata.title,
                    landlord: propertydata.landlord,
                    photos: propertydata.photos,
                    landlordname: propertydata.landlordname,
                    landlordprofilephoto: propertydata.landlordprofilephoto,
                    landlordphone: propertydata.landlordphone,
                    dealer: propertydata.dealer,
                    dealername: propertydata.dealername,
                    dealerprofilephoto: propertydata.dealerprofilephoto,
                    dealerphone: propertydata.dealerphone,
                    manager: "not available",
                    managername: "not available",
                    managerprofilephoto: "not available",
                    managerphone: "not available",
                    managerstatus: false,
                    managerreadstatus: false,
                    dealerreadstatus: false,
                    landlordreadstatus: false,
                    tenantreadstatus: false,
                    repairstatus: false,
                    repairinitiated: false,
                    repaircast: "inprocess",
                    priority: req.body.priority.toLowerCase(),
                    propertyid: req.body.propertyid,
                    identifier: "other",
                    description: req.body.description,
                    requesttype: req.body.requesttype.toLowerCase(),
                    ipaddress: req.body.ipaddress,
                    forward: false,
                    status: 'active', // active,accepted,rejected,completed
                    time: admin.firestore.FieldValue.serverTimestamp()
                })
                generateRequestSendMail(propertydata, tenantref.data(), req.body.requesttype)
                return res.status(201).send({ status: 1, message: "Repair Request has been created", id: ref.id });
            } else if (req.body.requesttype.toLowerCase() === 'leased') {
                const tenantref = await db.collection('users').doc(req.user.userid).get();
                const tenantdata = tenantref.data()
                var calculateduration = calculateMonths(req.body.startdate, req.body.enddate)
                var calculatenextduedate = getCustomDate(req.body.startdate)
                ref.set({
                    tenant: req.user.userid,
                    tenantname: tenantdata.username,
                    tenantprofilephoto: tenantdata.photos,
                    tenantphone: tenantdata.phone,
                    propertytitle: propertydata.title,
                    photos: propertydata.photos,
                    landlord: propertydata.landlord,
                    landlordname: propertydata.landlordname,
                    landlordprofilephoto: propertydata.landlordprofilephoto,
                    landlordphone: propertydata.landlordphone,
                    dealer: propertydata.dealer,
                    dealername: propertydata.dealername,
                    address: propertydata.address,
                    rentalvalue: propertydata.rental,
                    rentaltype: req.body.rentaltype,
                    startdate: req.body.startdate,
                    enddate: req.body.enddate,
                    notes: req.body.notes,
                    rentalduedate: calculatenextduedate,
                    securitydeposit: req.body.securitydeposit,
                    managerreadstatus: false,
                    dealerreadstatus: false,
                    landlordreadstatus: false,
                    tenantreadstatus: false,
                    leaseagreementtext: "Agreement is under process and will be generated when content is provided by higher authorities",
                    leaseagreementstatus: "active",
                    tenantsignaturestatus: false,
                    landlordsignaturestatus: false,
                    paymentstatus: "pending",
                    duration: calculateduration,
                    dealersignaturestatus: true,
                    requestacceptiontime: admin.firestore.FieldValue.serverTimestamp(),
                    dealerprofilephoto: propertydata.dealerprofilephoto,
                    dealerphone: propertydata.dealerphone,
                    propertyid: req.body.propertyid,
                    description: req.body.description,
                    requesttype: req.body.requesttype.toLowerCase(),
                    ipaddress: req.body.ipaddress,
                    forward: false,
                    identifier: "leased",
                    status: 'active',
                    time: admin.firestore.FieldValue.serverTimestamp()
                }, { merge: true })
                updateTenantLeaseAgreement(ref.id, req.body.tenantBase64Signature);
                // createNotificationLogForRequest(propertydata.dealer,
                //     { 
                //         propertyid: req.body.propertyid, 
                //         requestid: ref.id, 
                //         tenantid: req.user.userid,
                //         requesttype:"leased",
                //     })
                //generateRequestSendMail(propertydata, tenantref.data(), req.body.requesttype)
                res.status(201).send({ status: 1, message: "New Request has been created", id: ref.id });     //please return the insepction id in the response
                sendNotificationbyUserId(propertydata.dealer, tenantdata.username + notificationmessage.TENANT_REQUEST_FOR_PROPERTY_TO_DEALER);
                sendNotificationbyUserId(propertydata.landlord, tenantdata.username + notificationmessage.TENANT_REQUEST_FOR_PROPERTY_TO_LANDLORD + propertydata.dealername);
                return null
            }
        }
    } catch (error) {
        return res.status(500).send({ status: 0, message: error.message });
    }

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
async function generateRequestSendMail(propertydata, tenantdata, type) {

    const dealerref = await db.collection('users').doc(propertydata.landlord).get();
    const dealer = dealerref.data()
    const msg = {
        to: dealer.email,
        from: "info@f3timetracker.com",
        subject: "Property request for " + type,
        //   text: "Request for resetting your password for " + email + ", Below is code to reset your password",
        html: tenantdata.username + " has requested to for your property<br>" + "<strong> Property Title: " + propertydata.title + "<br>\
         Landlord:"+ propertydata.landlordname + "<br>Request subcatagory " + type + " </strong><br> Thank you for using our survices"
    };
    sgMial.send(msg);

}

exports.requestResponse = async (req, res) => {
    //   sendNotificationToSpecificUser("abc","abc")
    try {
        var requestid = req.body.requestid;
        var status = req.body.requeststatus.toLowerCase();
        if (status === 'accepted') {
            const ref = await db.collection('requests').doc(requestid).get();
            if (ref.exists) { // 
                var tem_request = ref.data();
                var propertyid = tem_request.propertyid;
                //       var tenantid = tem_request.tenant;
                //       var tenantname = tem_request.tenantname;
                //       var requesttype = tem_request.requesttype;
                // use request type switch\
                if (tem_request.requesttype.toLowerCase() === 'leased') {
                    await db.collection('requests').doc(requestid).update({
                        status: status,
                        remarks: req.body.remarks,
                        responseip: req.body.ipaddress,
                        leaseagreementtext: "Agreement is under process and will be generated when content is provided by higher authorities",
                        leaseagreementstatus: "active",
                        tenantsignaturestatus: false,
                        landlordsignaturestatus: false,
                        dealerreadstatus: false,
                        landlordreadstatus: false,
                        paymentstatus: "pending",
                        duration: 'not available',
                        dealersignaturestatus: true,
                        requestacceptiontime: admin.firestore.FieldValue.serverTimestamp(),
                        intialrequestgenrationtime: tem_request.time,
                        time: admin.firestore.FieldValue.serverTimestamp(),

                    })
                    // createNotificationLogForRequest(doc.data().landlord,
                    //     { 
                    //         propertyid: propertyid, 
                    //         requestid: requestid, 
                    //         dealerid:tem_request.dealer,
                    //         requesttype:"leaseagreement",
                    //     })

                    await db.collection('properties').doc(propertyid).update({
                        status: "inleased"
                    })
                    sendNotificationbyUserId(tem_request.tenant, tem_request.landlordname + notificationmessage.LANDLORD_SIGNED_LEASED);
                    sendNotificationbyUserId(tem_request.dealer, tem_request.landlordname + notificationmessage.LANDLORD_SIGNED_LEASED);
                } else {
                    await db.collection('requests').doc(requestid).update({
                        status: status,
                        remarks: req.body.remarks,
                        responseip: req.body.ipaddress,
                        //leaseagreementtext: "Agreement is under process and will be generated when content is provided by higher authorities",
                        //leaseagreementstatus: "active",
                        // tenantsignaturestatus: false,
                        //landlordsignaturestatus: false,
                        //dealerreadstatus: false,
                        // landlordreadstatus: false,
                        // paymentstatus: "pending",
                        //  duration: 'not available',
                        // dealersignaturestatus: true,
                        processstatus: 'completed',
                        requestacceptiontime: admin.firestore.FieldValue.serverTimestamp(),
                        //  intialrequestgenrationtime: tem_request.time,
                        time: admin.firestore.FieldValue.serverTimestamp(),

                    })

                }

                // await db.collection('properties').doc(propertyid).collection("history").doc().create({
                //     tenant: tem_request.tenant,
                //     time: admin.firestore.FieldValue.serverTimestamp()
                // })
                if (tem_request.requesttype.toLowerCase() === "visit") {
                    console.log("inside visit notification")
                    sendNotificationbyUserId(tem_request.tenant, "Your visit request has been completed")
                    sendNotificationbyUserId(tem_request.landlord, "Visit request for your property has been completed")
                    sendNotificationbyUserId(tem_request.dealer, "Manager has completed the Visit request")
                }
                res.status(200).send({ status: 0, message: "Request has been successfully processed" })
                return null
            } else {
                return res.status(200).send({ status: 0, message: "Request do not exist" })
            }
        } else {
            await db.collection('requests').doc(requestid).update({
                status: "rejected",
                remarks: req.body.remarks,
                requestacceptiontime: admin.firestore.FieldValue.serverTimestamp(),
                processstatus: 'completed'
            })
            return res.status(200).send({ status: 0, message: "Request Status has been updated successfully" })
        }
    } catch (error) {
        return res.status(500).send({ status: 0, message: error.message });
    }
}



