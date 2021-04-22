/* eslint-disable no-loop-func */
/* eslint-disable prefer-arrow-callback */
//auth
var admin = require("firebase-admin");
const db = admin.firestore();
const bcrypt = require("bcrypt")
const { generateAccessToken } = require("../auth/TokenAuth")
const jwt = require("jsonwebtoken");
///
var sgMial = require('@sendgrid/mail');
sgMial.setApiKey(process.env.SENDGRID_ONLY_MAIL_API_KEY)
///


// Node.js doesn't have a built-in multipart/form-data parsing library.
// Instead, we can use the 'busboy' library from NPM to parse these requests.


async function returnToken(req, res) {
    var useridentity = req.body.identification;
    console.log(useridentity);
    try {
        var ref = await db.collection('anonymoususers').where('identity', '==', useridentity).get();
        if (ref.empty) {
            console.log('something is not right')
            await returnToken(req,res);
            return null;
        } else {
            var newusr;
            var newuserreturn;
            ref.forEach(doc => {
                newusr = {
                    userid: doc.id,
                    usertype: doc.data().usertype,
                    username: doc.data().username,
                    validuser: "anonymous"
                }
                newuserreturn = {
                    userid: doc.id,
                    type: doc.data().usertype,
                    username: doc.data().username,
                    validuser: "anonymous"
                }
            })
            const accessToken = generateAccessToken(newusr)
            const refreshToken = jwt.sign(newusr, process.env.REFRESH_TOKEN_SECRET)
            try {
                db.collection('userstoken').doc('/' + newusr.userid + '/').set({
                    refreshToken: refreshToken
                });
            } catch (error) {
                res.status(404).send({ status: 0, message: error.message });
                return null;
            }
            res.status(200).json({ status: 1, accessToken: accessToken, refreshToken: refreshToken, userdata: newuserreturn });
            return null;
        }
    } catch (error) {
        res.status(500).send({ status: 0, message: error.message })
        return null; 
    }

}

exports.anonymousRegistrationOrLogin = async (req, res) => {
    var useridentity = req.body.identification;
    //console.log(useridentity);
    try {
        var ref = await db.collection('anonymoususers').where('identity', '==', useridentity).get();
        if (ref.empty) {
            await db.collection('anonymoususers').doc().create({
                usertype: 'tenant',
                username: 'anonymous',
                identity: req.body.identification,
                validuser: "anonymous"
            })
                returnToken(req, res);
        } else {
            var newusr;
            var rtnewusr;
            ref.forEach(doc => {
                newusr = {
                    userid: doc.id,
                    usertype: doc.data().usertype,
                    username: doc.data().username,
                    validuser: "anonymous"
                }
                rtnewusr = {
                    userid: doc.id,
                    type: doc.data().usertype,
                    username: doc.data().username,
                    validuser: "anonymous"
                }
            })
            const accessToken = generateAccessToken(newusr)
            const refreshToken = jwt.sign(newusr, process.env.REFRESH_TOKEN_SECRET)
            try {
                db.collection('userstoken').doc('/' + newusr.userid + '/').set({
                    refreshToken: refreshToken
                });
            } catch (error) {
                return res.status(501).send({ status: 0, message: error.message });
            }
            return res.status(200).json({ status: 1, accessToken: accessToken, refreshToken: refreshToken, userdata: rtnewusr });
        }
        return null;
    } catch (error) {
        return res.status(500).send({ status: 0, message: error.message })
    }

}
exports.AnonymousUserConversion = async (req, res) => {
    var useridentity = req.body.identification;
    var keyforguestuser;
    try {
        var ref = await db.collection('anonymoususers').where('identity', '==', useridentity).get();
        if (ref.empty) {
            res.status(200).send({ status: 0, message: "Guest Login does not exist" })
        } else {
            ref.forEach(doc => {
                keyforguestuser = doc.id
            })

            try {
                const usr = db.collection('users');
                if (req.body.type === "manager" || req.body.type === "Manager") {
                    return res.status(403).send({ status: 0, message: "Forbidden, Dealer can register Manager" });
                } else {
                    const snapshot = await usr.where('email', '==', req.body.email).get();
                    if (!snapshot.empty) {
                        return res.status(409).send({ status: 0, message: "Please use another email address" });
                    } else {
                        const snapshot2 = await usr.where('phone', '==', req.body.phone).get();
                        if (snapshot2.empty) {
                            const hashpassword = await bcrypt.hash(req.body.password, 10)
                            console.log(req.body.storageid)
                            if (req.body.type === 'dealer') {
                                db.collection('users').doc(keyforguestuser)
                                    .create({
                                        username: req.body.username,
                                        email: req.body.email,
                                        phone: req.body.phone,
                                        password: hashpassword,
                                        type: req.body.type,
                                        storageid: req.body.storageid,
                                        userstatus: 'active',
                                        photos: req.body.photos,
                                        officeaddress: req.body.officeaddress,
                                        workinghours: req.body.workinghours,
                                        ipaddress: req.body.ipaddress,
                                        cnic: req.body.cnic,
                                        emailverification: false,
                                        phoneverification: false,
                                        sendmeemail: true,
                                        time: admin.firestore.FieldValue.serverTimestamp()
                                    });
                            } else {
                                db.collection('users').doc(keyforguestuser)
                                    .create({
                                        username: req.body.username,
                                        email: req.body.email,
                                        phone: req.body.phone,
                                        password: hashpassword,
                                        type: req.body.type,
                                        storageid: req.body.storageid,
                                        userstatus: 'active',
                                        photos: req.body.photos,
                                        ipaddress: req.body.ipaddress,
                                        cnic: req.body.cnic,
                                        emailverification: false,
                                        phoneverification: false,
                                        sendmeemail: true,
                                        time: admin.firestore.FieldValue.serverTimestamp()
                                    });
                            }
                            //   verifyEmailAddress(req.body.email);
                            //  sendVericationSms(req.body.phone)
                            deleteAnonymouseUser(keyforguestuser);
                            return res.status(201).send({ status: 1, message: "Your account has been created successfully", Emailmessage: "Verification email sent" }); //{status: "created" , message: "Your account....."}
                        }
                        return res.status(409).send({ status: 0, message: "Please use another phone number" }); //{status: 0 , message: "Your account cannot....."}
                    }
                }
            } catch (error) {
                return res.status(500).send({ status: 0, error: error.message });
            }

        }
        return null;
    }
    catch (error) {
        return res.status(500).send({ status: 0, error: error });
    }

}
async function deleteAnonymouseUser(keyforguestuser) {
    try {
        db.collection("anonymoususers").doc(keyforguestuser).delete();
    } catch (error) {
        console.log(error)
    }
}

