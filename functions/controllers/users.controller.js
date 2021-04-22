/* eslint-disable no-loop-func */
/* eslint-disable prefer-arrow-callback */
//auth
var admin = require("firebase-admin");
const bcrypt = require("bcrypt")
const db = admin.firestore();
const { DataSnapshot } = require("firebase-functions/lib/providers/database");
const { generateAccessToken } = require("../auth/TokenAuth")
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require('uuid');
///
var sgMial = require('@sendgrid/mail');
sgMial.setApiKey(process.env.SENDGRID_ONLY_MAIL_API_KEY)
///
const { Storage } = require('@google-cloud/storage');
const mime = require('mime');
const projectId = "project-h-de8a7" //
const bucketName = `${projectId}.appspot.com`;

///
const storageforurl = new Storage();
const storage = new Storage({
    projectId: projectId,
    keyFilename: "./permission_fb.json"
});
///

exports.hellotesting = (req, res) => {
    res.json("All done")
}


/**
 * Parses a 'multipart/form-data' upload request
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
const path = require('path');
const os = require('os');
const fs = require('fs');

// Node.js doesn't have a built-in multipart/form-data parsing library.
// Instead, we can use the 'busboy' library from NPM to parse these requests.
// Busboy doesn't work woth cloud function as it override the body
const Busboy = require('busboy');
const { verify } = require("crypto");

exports.uploadfiles = async (req, res) => {
    if (req.method !== 'POST') {
        // Return a "method not allowed" error
        return res.status(405).end();
    } else {
        try {
            const busboy = new Busboy({ headers: req.headers });
            const tmpdir = os.tmpdir();
            // This object will accumulate all the url for uploaded files
            const urlresponse = []

            // This object will accumulate all the fields, keyed by their name
            const fields = {};

            // This object will accumulate all the uploaded files, keyed by their name.
            const uploads = {};
            const filetype = {}

            // This code will process each non-file field in the form.
            busboy.on('field', (fieldname, val) => {
                // TODO(developer): Process submitted field values here
                console.log(`Processed field ${fieldname}: ${val}.`);
                fields[fieldname] = val;
                console.log("testing fieldname" + fields[fieldname])
                // console.log("testing fieldname"+fields[fieldname])
            });

            const fileWrites = [];

            // This code will process each file uploaded.
            busboy.on('file', (fieldname, file, filename) => {
                // Note: os.tmpdir() points to an in-memory file system on GCF
                // Thus, any files in it must fit in the instance's memory.
                console.log(`Processed file ${filename}`);

                const filepath = path.join(tmpdir, filename);
                console.log(`Processed file path ${filepath}`);
                console.log(`Processed file path ${file}`);
                uploads[fieldname] = filepath;
                const writeStream = fs.createWriteStream(filepath);
                file.pipe(writeStream);

                // File was processed by Busboy; wait for it to be written.
                // Note: GCF may not persist saved files across invocations.
                // Persistent files must be kept in other locations
                // (such as Cloud Storage buckets).
                const promise = new Promise((resolve, reject) => {
                    file.on('end', () => {
                        writeStream.end();
                    });
                    writeStream.on('finish', resolve);
                    writeStream.on('error', reject);
                });
                fileWrites.push(promise);
            });

            // Triggered once all uploaded files are processed by Busboy.
            // We still need to wait for the disk writes (saves) to complete.
            busboy.on('finish', async () => {
                await Promise.all(fileWrites);

                // TODO(developer): Process saved files here
                const key = fields["id"];
                const folder = fields["foldername"];
                for (const file in uploads) {
                    console.log("file : " + file + " uploads : " + uploads[file])
                    //
                    const bucket = admin.storage().bucket(bucketName);

                    //  const tmpfilePath = filepath; //add file path here
                    // const uploadTo = folder + "/" + key + "/" + file; // add the destination path
                    const fileMime = mime.getType(uploads[file]);
                    console.log("Filemine?  " + fileMime);
                    const picdata = String(fileMime).split('/')
                    var filetypetmp = picdata[1]
                    var randomfilename = ""
                    for (let i = 0; i < 20; i++) {
                        randomfilename += String(Math.floor(Math.random() * 10))
                    }

                    const uploadTo = folder + "/" + key + "/" + randomfilename + "." + filetypetmp; // add the destination path
                    console.log("uploadTo??? " + uploadTo)
                    urlresponse.push(createPublicFileURL(uploadTo));
                    // bucket.upload
                    bucket.upload(uploads[file], {
                        destination: uploadTo,
                        public: true,
                        metadata: {
                            metadata: {
                                contentType: fileMime,
                                firebaseStorageDownloadTokens: uuidv4(),
                                cacheControl: "public, max-age=3000"
                            }
                        }
                    },
                        function (err, _file1) {
                            if (err) {
                                console.log(err);
                                return;
                            }
                            // urlresponse.push(createPublicFileURL(uploadTo));
                            fs.unlinkSync(uploads[file]);
                            console.log(file);
                        });
                }
                for (const file in uploads) {
                    try {
                        //        fs.unlinkSync(uploads[file]);
                    } catch (error) {
                        console.log(error.message)
                    }
                }
                return res.status(200).send({ status: 1, foldername: fields["foldername"], storageid: fields["id"], url: urlresponse })
                //  res.send();
            });
            busboy.end(req.rawBody);
            //return null;
            //  req.rawBody.
        } catch (error) {
            return res.status(200).send({ status: 0, message: error })
        }
    }
}
function createPublicFileURL(storageName) {
    return `http://storage.googleapis.com/${bucketName}/${encodeURIComponent(storageName)}`;
}
exports.changeProfilePictureBase64 = async (req, res) => {
    try {
        const key = req.body.userid;
        const folder = 'users';
        const bucket = admin.storage().bucket(bucketName)//+ "/" + folder + "/" + key);
        const reference = await db.collection('users').doc(key).get();
        if (reference.exists) {
            const temdataforuser = reference.data()
            const profilepic = temdataforuser.photos
            const storageid = temdataforuser.storageid
            const usertype = temdataforuser.type
            var currunturl = profilepic.split("%2F")
            console.log(currunturl[2]);
            var previousfile = currunturl[2];
            var randomfilename = "";
            for (let i = 0; i < 15; i++) {
                randomfilename += String(Math.floor(Math.random() * 10))
            }
            const picdata = String(req.body.base64Image).split(',')
            var fpoint = picdata[0].indexOf("/")
            var spoint = picdata[0].indexOf(";")
            const pictype = picdata[0].substring(fpoint + 1, spoint)
            const contenttype = "image/" + pictype
            //     console.log(pictype)
            //    console.log(contenttype)
            const filename = randomfilename + "." + pictype;
            //     console.log(filename)
            const filepath = "users" + "/" + storageid + "/" + filename
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
                .on('error', function (err) {
                    console.log(err.message)
                })
                .on('finish', function () {
                    // The file upload is complete.
                    console.log("success")
                });
            const picurl = createPublicFileURL(filepath)
            db.collection('users').doc(key).update({
                photos: picurl
            })
            const delfile = bucket.file("users/" + storageid + "/" + previousfile)
            const promise = delfile.delete();
            ChangeProfilePictureInAllRecords(key, picurl, usertype);
            return res.status(200).send({ status: 1, message: "Profile picture has been updated successfully" });
        } else {
            return res.status(200).send({ status: 0, message: "Invalid User Id" });
        }
    } catch (error) {
        return res.status(501).send({ status: 0, message: error.message });
    }

}
async function ChangeProfilePictureInAllRecords(userid, photo, usertype) {
    var id = userid;
    try {

        if (usertype === "landlord") {
            try {
                var query11 = db.collection("properties").where("landlord", "==", id)
                var promise1 = query11.get().then(snapshot => {
                    snapshot.forEach(doc => {
                        db.collection('properties').doc(doc.id).update({ landlordprofilephoto: photo });
                    })
                    return null;
                })
            } catch (error) {
                console.log(error.message)
            }
            try {
                var query10 = db.collection('inspections').where("landlord", "==", id)
                var promise2 = query10.get().then(snapshot => {
                    snapshot.forEach(doc => {
                        db.collection('inspections').doc(doc.id).update({ landlordprofilephoto: photo });
                    })
                    return null;
                })
            } catch (error) {
                console.log(error.message)
            }
            try {
                var query9 = db.collection('requests').where("landlord", "==", id)
                var promise3 = query9.get().then(snapshot => {
                    snapshot.forEach(doc => {
                        db.collection('requests').doc(doc.id).update({ landlordprofilephoto: photo });
                    })
                    return null;
                })
            } catch (error) {
                console.log(error.message)
            }
        } else if (usertype === "dealer") {
            try {
                var query8 = db.collection('properties').where("dealer", "==", id)
                var promise4 = query8.get().then(snapshot => {
                    snapshot.forEach(doc => {
                        db.collection('properties').doc(doc.id).update({ dealerprofilephoto: photo });
                    })
                    return null;
                })
            } catch (error) {
                console.log(error.message)
            }
            try {
                var query7 = db.collection('inspections').where('initiatedby', "==", id)
                var promise5 = query7.get().then(snapshot => {
                    snapshot.forEach(doc => {
                        db.collection('inspections').doc(doc.id).update({ initiatedbyphoto: photo });
                    })
                    return null;
                })
            } catch (error) {
                console.log(error.message)
            }
            try {
                var query6 = db.collection('inspections').where('dealer', "==", id)
                var promise6 = query6.get().then(snapshot => {
                    snapshot.forEach(doc => {
                        db.collection('inspections').doc(doc.id).update({ dealerprofilephoto: photo });
                    })
                    return null;
                })
            } catch (error) {
                console.log(error.message)
            }
            try {
                var query13 = db.collection('subinspections').where('inspectiondoneby', "==", id)
                var promise13 = query13.get().then(snapshot => {
                    snapshot.forEach(doc => {
                        db.collection('subinspections').doc(doc.id).update({ photo: photo });
                    })
                    return null;
                })
            } catch (error) {
                console.log(error.message)
            }
            try {
                var query12 = db.collection('requests').where('dealer', "==", id)
                var promise12 = query12.get().then(snapshot => {
                    snapshot.forEach(doc => {
                        db.collection('requests').doc(doc.id).update({ dealerprofilephoto: photo });
                    })
                    return null;
                })
            } catch (error) {
                console.log(error.message)
            }

        } else if (usertype === "tenant") {
            try {
                var query5 = db.collection('properties').where('tenant', "==", id)
                var promise7 = query5.get().then(snapshot => {
                    snapshot.forEach(doc => {
                        db.collection('properties').doc(doc.id).update({ tenantprofilephoto: photo });
                    })
                    return null;
                })
            } catch (error) {
                console.log(error.message)
            }
            try {
                var query4 = db.collection('requests').where('tenant', "==", id)
                var promise8 = query4.get().then(snapshot => {
                    snapshot.forEach(doc => {
                        db.collection('requests').doc(doc.id).update({ tenantprofilephoto: photo });
                    })
                    return null;
                })
            } catch (error) {
                console.log(error.message)
            }


        } else if (usertype === "manager") {
            try {
                var query3 = db.collection('subinspections').where('inspectiondoneby', "==", id)
                var promise9 = query3.get().then(snapshot => {
                    snapshot.forEach(doc => {
                        db.collection('subinspections').doc(doc.id).update({ photo: photo });
                    })
                    return null;
                })
            } catch (error) {
                console.log(error.message)
            }
            try {
                var query2 = db.collection('inspections').where('initiatedby', "==", id)
                var promise10 = query2.get().then(snapshot => {
                    snapshot.forEach(doc => {
                        db.collection('inspections').doc(doc.id).update({ initiatedbyphoto: photo });
                    })
                    return null;
                })
            } catch (error) {
                console.log(error.message)
            }
            try {
                var query1 = db.collection('inspections').where('assignto', "==", id)
                var promise11 = query1.get().then(snapshot => {
                    snapshot.forEach(doc => {
                        db.collection('inspections').doc(doc.id).update({ assigntoprofilephoto: photo });
                    })
                    return null;
                })
            } catch (error) {
                console.log(error.message)
            }
            try {
                var managerrequest = db.collection('requests').where('manager', "==", id)
                var promisemri = managerrequest.get().then(snapshot => {
                    snapshot.forEach(doc => {
                        db.collection('requests').doc(doc.id).update({ managerprofilephoto: photo });
                    })
                    return null;
                })
            } catch (error) {
                console.log(error.message)
            }
        }
    }
    catch (error) {
        console.log(error.message)
    }
}

exports.uploadBase64Images = async (req, res) => {
    const key = req.body.id;
    const folder = req.body.folder;
    const bucket = admin.storage().bucket(bucketName)//+ "/" + folder + "/" + key);
    var randomfilename = "";
    for (let i = 0; i < 15; i++) {
        randomfilename += String(Math.floor(Math.random() * 10))
    }

    const picdata = String(req.body.base64Image).split(',')
    var fpoint = picdata[0].indexOf("/")
    var spoint = picdata[0].indexOf(";")
    const pictype = picdata[0].substring(fpoint + 1, spoint)
    const contenttype = "image/" + pictype
    console.log(pictype)
    console.log(contenttype)
    const filename = randomfilename + "." + pictype;
    console.log(filename)
    const filepath = folder + "/" + key + "/" + filename
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
        .on('error', function (err) {
            console.log(err.message)
        })
        .on('finish', function () {
            // The file upload is complete.
            console.log("success")
        });
    return res.status(200).send({ status: 1, url: createPublicFileURL(filepath) });
}
exports.uploadBase64MultipleImages = async (req, res) => {
    const key = req.body.id;
    const folder = req.body.folder;
    const bucket = admin.storage().bucket(bucketName)//+ "/" + folder + "/" + key);
    let images = req.body.base64Images;
    const total = images.length;
    let response = []

    images.forEach(base64pic => {
        var randomfilename = "";
        for (let i = 0; i < 15; i++) {
            randomfilename += String(Math.floor(Math.random() * 10))
        }

        var picdata = String(base64pic).split(',')
        var fpoint = picdata[0].indexOf("/")
        var spoint = picdata[0].indexOf(";")
        var pictype = picdata[0].substring(fpoint + 1, spoint)
        var contenttype = "image/" + pictype
        console.log(pictype)
        console.log(contenttype)
        var filename = randomfilename + "." + pictype;
        console.log(filename)
        var filepath = folder + "/" + key + "/" + filename
        response.push(createPublicFileURL(filepath))
        var file = bucket.file(filepath)

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
            .on('error', function (err) {
                console.log(err.message)
            })
            .on('finish', function () {
                // The file upload is complete.
                console.log("success")
            });
    })

    return res.status(200).send({ status: 1, url: response });

}

function isEmailValid(req, res, email) {
    // var email = req.body.email;
    var emailRegex = /^[-!#$%&'*+\0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
    if (!email) {
        res.status(400).send({ status: 0, message: "Please enter email" });
        return false;
    }
    if (email.length > 254) {
        res.status(400).send({ status: 0, message: "Invalid email, length greater than 254" });
        return false;
    }
    var valid = emailRegex.test(email);
    if (!valid) {
        res.status(400).send({ status: 0, message: "Please enter a valid email" });
        return false;
    }
    // Further checking of some things regex can't handle
    var parts = email.split("@");
    if (parts[0].length > 64) {
        res.status(400).send({ status: 0, message: "Invalid email, length greater than 64" });
        return false;
    }

    var domainParts = parts[1].split(".");
    if (domainParts.some(function (part) { return part.length > 63; })) {
        res.status(400).send({ status: 0, message: "Invalid email, length greater than 63" });
        return false;

    }
    //  res.status(400).send({ status: 0, message: "true" });
    return true;
}

//Client login function 
exports.clientLogin = async (req, res) => {
    try {
        var retuserdata;
        if (!isEmailValid(req, res, req.body.email))
            return null;
        if (req.body.password === null || req.body.password === undefined || !req.body.password) {
            return res.status(400).send({ status: 0, message: "Password is null or undefined or empty" });
        }
        const usr = db.collection('users');
        const snapshot = await usr.where('email', '==', req.body.email.toLowerCase()).get();
        if (snapshot.empty) {
            return res.status(404).send({ status: 0, message: "Invalid username or password" });
        } else {
            var userdata, emailver, phonever;
            snapshot.forEach(doc => {
                var temp_userdata = doc.data();
                emailver = temp_userdata.emailverification;
                phonever = temp_userdata.phoneverification;
                if (temp_userdata.type === 'dealer') {
                    //  console.log("inside dealer login??? "+ temp_userdata.type)
                    userdata = {
                        userid: doc.id,
                        email: temp_userdata.email,
                        password: temp_userdata.password,
                        username: temp_userdata.username,
                        type: temp_userdata.type,
                        storageid: temp_userdata.storageid,
                        officeaddress: temp_userdata.officeaddress,
                        workinghours: temp_userdata.workinghours,
                        phone: temp_userdata.phone,
                        photos: temp_userdata.photos,
                        cnic: temp_userdata.cnic,
                        userstatus: temp_userdata.userstatus,
                        dealer: temp_userdata.dealer
                    }
                    retuserdata = {
                        userid: userdata.userid,
                        email: userdata.email,
                        username: userdata.username,
                        type: userdata.type,
                        storageid: userdata.storageid,
                        phone: userdata.phone,
                        officeaddress: temp_userdata.officeaddress,
                        workinghours: temp_userdata.workinghours,
                        photos: userdata.photos,
                        cnic: userdata.cnic,
                        userstatus: userdata.userstatus,
                        dealer: userdata.dealer,
                        validuser: "dealer"
                    }
                } else if (temp_userdata.type === 'manager') {
                    userdata = {
                        userid: doc.id,
                        email: temp_userdata.email,
                        password: temp_userdata.password,
                        username: temp_userdata.username,
                        type: temp_userdata.type,
                        storageid: temp_userdata.storageid,
                        phone: temp_userdata.phone,
                        photos: temp_userdata.photos,
                        officeaddress: temp_userdata.officeaddress,
                        workinghours: temp_userdata.workinghours,
                        cnic: temp_userdata.cnic,
                        userstatus: temp_userdata.userstatus,
                        dealer: temp_userdata.dealer
                    }
                    retuserdata = {
                        userid: userdata.userid,
                        email: userdata.email,
                        username: userdata.username,
                        type: userdata.type,
                        officeaddress: temp_userdata.officeaddress,
                        workinghours: temp_userdata.workinghours,
                        storageid: userdata.storageid,
                        phone: userdata.phone,
                        photos: userdata.photos,
                        cnic: userdata.cnic,
                        userstatus: userdata.userstatus,
                        dealer: userdata.dealer,
                        validuser: "manager"
                    }
                } else {
                    userdata = {
                        userid: doc.id,
                        email: temp_userdata.email,
                        password: temp_userdata.password,
                        username: temp_userdata.username,
                        type: temp_userdata.type,
                        storageid: temp_userdata.storageid,
                        phone: temp_userdata.phone,
                        photos: temp_userdata.photos,
                        cnic: temp_userdata.cnic,
                        userstatus: temp_userdata.userstatus
                    }
                    retuserdata = {
                        userid: userdata.userid,
                        email: userdata.email,
                        username: userdata.username,
                        type: userdata.type,
                        storageid: userdata.storageid,
                        phone: userdata.phone,
                        photos: userdata.photos,
                        cnic: userdata.cnic,
                        userstatus: userdata.userstatus,
                        validuser: "tenant"
                    }
                }
            });
            /*  if (emailver === false || phonever === false) {
                  var message = "";
                  if (emailver === false) message = "Email Address is not verified"
                  if (phonever === false) message = "Phone Number is not verified"
                  if (emailver === false && phonever === false) message = "Email Address and Phone Number is not verified"
                  return res.status(200).send({ status: 0, message: message })
              } else */
            if (await bcrypt.compare(req.body.password, userdata.password)) {
                if (!(userdata.userstatus === 'active'))
                    return res.status(404).send({ status: 0, message: "your account status is " + userdata.userstatus });
                else {
                    const newusr = {
                        userid: userdata.userid,
                        usertype: userdata.type,
                        username: userdata.username
                    }
                    // console.log("under newusr dealer???"+ newusr.usertype)
                    const accessToken = generateAccessToken(newusr)
                    const refreshToken = jwt.sign(newusr, process.env.REFRESH_TOKEN_SECRET)
                    try {
                        db.collection('userstoken').doc('/' + userdata.userid + '/').set({
                            refreshToken: refreshToken
                        });
                    } catch (error) {
                        return res.status(404).send({ status: 0, message: error.message });
                    }
                    save_loginhistory(retuserdata.userid, req.body.ipaddress);
                    //var fbtoken = await getCustomToken(userdata.userid);
                    admin
                        .auth()
                        .createCustomToken(retuserdata.userid)
                        .then((customToken) => {
                            // Send token back to client
                            // console.log(customToken)
                            return res.status(200).json({ status: 1, accessToken: accessToken, refreshToken: refreshToken, userdata: retuserdata, firebasetoken: customToken });
                        })
                        .catch((error) => {
                            console.log('Error creating custom token:', error);
                        });
                    // return res.status(200).json({ status: 1, accessToken: accessToken, refreshToken: refreshToken, userdata: retuserdata, firebasetoken: fbtoken });
                }
            } else {
                return res.status(404).send({ status: 0, message: "Invalid username or password" });
            }

        }
    } catch (error) {
        return res.status(500).send({ status: 0, error: error.message });
    }
}
async function getCustomToken(uid) {
    admin
        .auth()
        .createCustomToken(uid)
        .then((customToken) => {
            // Send token back to client
            console.log(customToken)
            return customToken;
        })
        .catch((error) => {
            console.log('Error creating custom token:', error);
        });
}
// To save login history of user
async function save_loginhistory(usrid, ip) {
    db.collection('users').doc(usrid).collection('loginhistory').doc().create({
        ipaddress: ip,
        time: admin.firestore.FieldValue.serverTimestamp()
    })

}
// Get login history
exports.getLoginHistory = async (req, res) => {
    const ref = await db.collection('users').doc(req.user.userid).collection('loginhistory').orderBy("time").get();
    if (!ref.empty) {
        let response = []
        ref.forEach(doc => {
            var tmp = doc.data()
            response.push(tmp)
        })
        return res.status(200).send({ status: 1, login_history: response })
    } else {
        return res.status(200).send({ status: 0, login_history: "Login history not available" })
    }
}
function usertypeCheck(req, res) {
    if (req.body.officeaddress !== null || req.body.officeaddress !== undefined) {
        console.log("check working")
    }

}
function phonenumberCheck(req, res) {
    if (req.body.phone === null || req.body.phone === undefined || !req.body.phone) {
        res.status(400).send({ status: 0, message: "Please enter phone number" });
        return false;
    }
    var phoneno = /^\+?([0-9]{12})$/;
    var valid = phoneno.test(req.body.phone)
    if (valid) {
        return true;
    }
    else {
        res.status(400).send({ status: 0, message: "Phone number should contain 10 digits only" });
        return false;
    }
}
//client regitration  
exports.clientRegistration = async (req, res) => {
    try {
        // /req.body.phone
        if (!isEmailValid(req, res, req.body.email))
            return null;
        if (!phonenumberCheck(req, res))
            return null;
        if (req.body.type === null || req.body.type === undefined || !req.body.type) {
            return res.status(400).send({ status: 0, message: "Please select landlord,tenant or dealer" });
        }
        if (req.body.password === null || req.body.password === undefined || !req.body.password) {
            return res.status(400).send({ status: 0, message: "Please enter the password" });
        }
        if (req.body.storageid === null || req.body.storageid === undefined || !req.body.storageid) {
            return res.status(400).send({ status: 0, message: "Please send storage id" });
        }
        if (req.body.photos === null || req.body.photos === undefined || !req.body.photos) {
            return res.status(400).send({ status: 0, message: "Please select a photo" });
        }
        if (req.body.cnic === null || req.body.cnic === undefined || !req.body.cnic) {
            return res.status(400).send({ status: 0, message: "Please select a photo" });
        }
        if (req.body.workinghours === null || req.body.workinghours === undefined || !req.body.workinghours) {
            return res.status(400).send({ status: 0, message: "Please enter availability time" });
        }
        if (req.body.ipaddress === null || req.body.ipaddress === undefined || !req.body.ipaddress) {
            return res.status(400).send({ status: 0, message: "Please send Ipaddress" });
        }
        if (req.body.username === null || req.body.username === undefined || !req.body.username)
            return res.status(400).send({ status: 0, message: "Please enter username" });
        if (req.body.officeaddress === null || req.body.officeaddress === undefined) {
            if (req.body.type.toLowerCase() === "dealer") {
                return res.status(400).send({ status: 0, message: "Please enter office address" });
            }
        }
        // if (!usertypeCheck(req, res))
        //     return null;

        const usr = db.collection('users');
        if (req.body.type.toLowerCase() === "manager") {
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
                        db.collection('users').doc()
                            .create({
                                username: req.body.username,
                                email: req.body.email.toLowerCase(),
                                phone: req.body.phone,
                                password: hashpassword,
                                type: req.body.type.toLowerCase(),
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
                        db.collection('users').doc()
                            .create({
                                username: req.body.username,
                                email: req.body.email.toLowerCase(),
                                phone: req.body.phone,
                                password: hashpassword,
                                type: req.body.type.toLowerCase(),
                                storageid: req.body.storageid,
                                userstatus: 'active',
                                workinghours: req.body.workinghours,
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
                    return res.status(201).send({ status: 1, message: "Your account has been created successfully", Emailmessage: "Verification email sent" }); //{status: "created" , message: "Your account....."}
                }
                return res.status(409).send({ status: 0, message: "Please use another phone number" }); //{status: 0 , message: "Your account cannot....."}
            }
        }
    } catch (error) {
        return res.status(500).send({ status: 0, error: error });
    }
}
async function verifyEmailAddress(email) {
    console.log(email)
    var array = new Uint32Array(6);
    array[0] = Math.floor(Math.random() * 10);
    array[1] = Math.floor(Math.random() * 10);
    array[2] = Math.floor(Math.random() * 10);
    array[3] = Math.floor(Math.random() * 10);
    array[4] = Math.floor(Math.random() * 10);
    array[5] = Math.floor(Math.random() * 10);
    //    this.window.crypto.getRandomValues(array);
    var code = String(array[0]) + String(array[1]) + String(array[2]) + String(array[3]) + String(array[4]) + String(array[5])
    db.collection('emailverification').doc(email).set({
        rcode: code,
        //     attempt: 3
    })

    const msg = {
        to: email,
        from: "info@f3timetracker.com",
        subject: "Email Verfication For Project-h",
        //   text: "Request for resetting your password for " + email + ", Below is code to reset your password",
        html: "Email Verification Code is <br>" + "<strong>" + array[0] + " " + array[1] + " " + array[2] + " " + array[3] + " " + array[4] + " " + array[5] + " " + "</strong>"
    };
    sgMial.send(msg);

}
exports.emailVerificationCode = async (req, res) => {
    var email = req.body.email;
    var code = req.body.code;
    if (!isEmailValid(req, res, email))
        return null;

    const ref = await db.collection('users').where('email', '==', email).get();
    if (ref.empty) {
        return res.status(200).send({ status: 0, message: "Invalid Email" })
    } else {
        var uid;
        ref.forEach(doc => {
            uid = doc.id;
        })
        const emailver = await db.collection('emailverification').doc(email).get();
        if (emailver.exists) {
            if (code === emailver.data().rcode) {
                db.collection('emailverification').doc(email).delete();
                db.collection('users').doc(uid).update({
                    emailverification: true
                });
                return res.status(200).send({ status: 1, message: "Email verified successfully" })
            } else {
                return res.status(200).send({ status: 0, message: "Invalid Code for verification" })
            }
        } else {
            return res.status(401).send({ status: 0, message: "Unauthorized Request" })
        }
    }

}

//Manager regitration  
exports.managerRegistration = async (req, res) => {
    try {
        if (!isEmailValid(req, res, req.body.email))
            return null;
        if (!phonenumberCheck(req, res))
            return null;
        if (!req.body.username === null || req.body.username === undefined || !req.body.username)
            return res.status(400).send({ status: 0, message: "Username is null or undefined or empty" });
        if (!req.body.password === null || req.body.password === undefined || !req.body.password)
            return res.status(400).send({ status: 0, message: "Password is null or undefined or empty" });
        // if (!req.body.type === null || req.body.type === undefined || !req.body.type || req.body.type.toLowerCase() !== 'manager')
        //     return res.status(400).send({ status: 0, message: "Type is null or undeined or empty or invalid" });
        if (!req.body.ipaddress === null || req.body.ipaddress === undefined || !req.body.ipaddress)
            return res.status(400).send({ status: 0, message: "Ipaddress is null or undefined or empty" });
        if (!req.body.storageid === null || req.body.storageid === undefined || !req.body.storageid)
            return res.status(400).send({ status: 0, message: "Storage id is null or undefined or empty" });
        if (!req.body.location === null || req.body.location === undefined || !req.body.location)
            return res.status(400).send({ status: 0, message: "Location is null or undefined or empty" });
        if (!req.body.officeaddress === null || req.body.officeaddress === undefined || !req.body.officeaddress)
            return res.status(400).send({ status: 0, message: "Office address id is null or undefined or empty" });
        if (!req.body.photos === null || req.body.photos === undefined || !req.body.photos)
            return res.status(400).send({ status: 0, message: "Photos is null or undefined or empty" });
        // if (!req.body.cnic === null || req.body.cnic === undefined || !req.body.cnic)
        //     return res.status(400).send({ status: 0, message: "Cnic is null or undefined or empty" });
        if (!req.user.userid === null || req.user.userid === undefined || !req.user.userid)
            return res.status(400).send({ status: 0, message: "Dealer id is null or undefined or empty" });

        const usr = db.collection('users');
        const snapshot = await usr.where('email', '==', req.body.email.toLowerCase()).get();
        if (!snapshot.empty) {
            return res.status(409).send({ status: 0, message: "Please use another email address" });
        } else {
            const snapshot2 = await usr.where('phone', '==', req.body.phone).get();
            if (snapshot2.empty) {
                var pass = generatecode(8);
                const hashpassword = await bcrypt.hash(pass, 10)
                db.collection('users').doc()
                    .create({
                        username: req.body.username,
                        email: req.body.email.toLowerCase(),
                        phone: req.body.phone,
                        password: hashpassword,
                        type: 'manager',
                        ipaddress: req.body.ipaddress,
                        storageid: req.body.storageid,
                        location: req.body.location,
                        userstatus: req.body.userstatus.toLowerCase(),
                        officeaddress: req.body.officeaddress,
                        workinghours: req.body.workinghours,
                        photos: req.body.photos,
                        //  cnic: req.body.cnic,
                        emailverification: true,
                        phoneverification: false,
                        dealer: req.user.userid,
                        time: admin.firestore.FieldValue.serverTimestamp()
                    });
                console.log(pass);
                sendManagerPass(req.body.email, pass);
                return res.status(201).send({ status: 1, message: "Account has been created successfully" }); //{status: "created" , message: "Your account....."}
            }
            return res.status(409).send({ status: 0, message: "Please use another phone number" }); //{status: 0 , message: "Your account cannot....."}
        }
    } catch (error) {
        return res.status(500).send({ status: 0, error: error });
    }
}
function sendManagerPass(email, pass) {
    try {
        const msg = {
            to: email,
            from: "info@f3timetracker.com",
            subject: "Password For Project-h",
            //  text: "Your Account has been registered with project-h for " + email + ", Below is your password",
            html: "Welcom to Project-h<br>Your Account has been registered with project-h for " + email + ".<br>Your password is " + "</br><strong>" + pass + "</strong><br> Change your password when you login for security purpose."
        };
        sgMial.send(msg);
    } catch (error) {
        console.log(error.message);
    }
}
function generatecode(size) {
    var code = String(Math.floor(Math.random() * 10))
    for (var i = 1; i < size; i++) {
        code = code + String(Math.floor(Math.random() * 10))
    }
    return code;
}

exports.getAllLandlord = async (req, res) => {
    try {
        var page = parseInt(req.params.page)
        var lim = parseInt(req.params.size)
        if (req.params.page === 1) var start = 0
        else start = page * lim - lim;
        var end = start + lim;
        const query = db.collection('users');
        var response = [];
        const snapshot = query.where('type', '==', "landlord");
        await snapshot.get().then(querySnapshot => {
            if (querySnapshot.empty) {
                return res.status(200).send({ status: 0, message: "Landlords not available" });
            } else {
                if (start > querySnapshot.size) {
                    return res.status(200).send({ status: 0, dealers: response });
                } else {
                    let docs = querySnapshot.docs;
                    for (var i = start; i < end && i < querySnapshot.size; i++) {
                        let doc = docs[i];
                        var docdata = doc.data()
                        const tmplandlord = {
                            id: doc.id,
                            username: docdata.username,
                            email: docdata.email,
                            phone: docdata.phone,
                            type: docdata.type,
                            userstatus: docdata.userstatus,
                            photos: docdata.photos,
                            cnic: docdata.cnic,
                            time: docdata.time
                        }
                        response.push(tmplandlord);
                    }
                    return res.status(200).send({ status: 1, total: response.length, landlords: response });
                }
            }
        })
        return null;
    } catch (error) {
        return res.status(500).send({ status: 0, error: error.message });
    }
}

// Get Manager Location
exports.getManagerLocation = async (req, res) => {
    var resource;
    try {
        const query = await db.collection('users').doc(req.params.Managerid).get();
        if (query.exists) {
            resource = query.data().location
        } else {
            return res.status(200).send({ status: 0, message: "Managers do not exist" });
        }
        return res.status(200).send({ status: 1, manager_location: resource });
    } catch (error) {
        return res.status(500).send({ status: 0, error: error.message });
    }
}

exports.getAllDealers = async (req, res) => {
    try {
        var page = parseInt(req.params.page)
        var lim = parseInt(req.params.size)
        if (req.params.page === 1) var start = 0
        else start = page * lim - lim;
        var end = start + lim;
        const query = db.collection('users');
        var response = [];
        const snapshot = query.where('type', '==', "dealer");
        await snapshot.get().then(querySnapshot => {
            if (querySnapshot.empty) {
                return res.status(200).send({ status: 0, response: "Dealers not available" });
            } else {
                if (start > querySnapshot.size) {
                    return res.status(200).send({ status: 0, dealers: response });
                } else {
                    let docs = querySnapshot.docs;
                    for (var i = start; i < end && i < querySnapshot.size; i++) {
                        let doc = docs[i];
                        var docdata = doc.data();
                        const tmpdealer = {
                            id: doc.id,
                            username: docdata.username,
                            email: docdata.email,
                            phone: docdata.phone,
                            type: docdata.type,
                            userstatus: docdata.userstatus,
                            photos: docdata.photos,
                            cnic: docdata.cnic,
                            time: docdata.time
                        }
                        response.push(tmpdealer);
                    }
                    return res.status(200).send({ status: 1, total: response.length, dealer_list: response });
                }
            }
        })
        return null;
    } catch (error) {
        return res.status(500).send({ status: 0, error: error.message });
    }
}


exports.getUserProfile = async (req, res) => {
    try {
        if (req.params.id === null || req.params.id === undefined || !req.params.id)
            return res.status(400).send({ status: 0, message: "User id is null or undefined or empty" });
        const document = db.collection('users').doc(req.params.id);
        let userprofile = await document.get();
        var tmp_user;
        const userdata = userprofile.data();
        if (userprofile.data().type.toLowerCase() === "dealer") {
            tmp_user = {
                id: userprofile.id,
                username: userdata.username,
                email: userdata.email,
                phone: userdata.phone,
                type: userdata.type,
                storageid: userdata.storageid,
                userstatus: userdata.userstatus,
                photos: userdata.photos,
                location: userdata.location,
                cnic: userdata.cnic,
                officeaddress: userdata.officeaddress,
                workinghours: userdata.workinghours,
                time: userdata.time
            }
        }
        else if (userprofile.data().type.toLowerCase() === "manager") {
            tmp_user = {
                id: userprofile.id,
                username: userdata.username,
                email: userdata.email,
                phone: userdata.phone,
                type: userdata.type,
                storageid: userdata.storageid,
                userstatus: userdata.userstatus,
                photos: userdata.photos,
                location: userdata.location,
                officeaddress: userdata.officeaddress,
                workinghours: userdata.workinghours,
                cnic: userdata.cnic,
                dealer: userdata.dealer,
                time: userdata.time
            }
        } else {
            tmp_user = {
                id: userprofile.id,
                username: userdata.username,
                email: userdata.email,
                phone: userdata.phone,
                storageid: userdata.storageid,
                type: userdata.type,
                userstatus: userdata.userstatus,
                photos: userdata.photos,
                cnic: userdata.cnic,
                time: userdata.time
            }
        }
        return res.status(200).send({ status: 1, user_profile: tmp_user });
    } catch (error) {
        return res.status(200).send({ status: 0, message: "User does not exist" });
    }
}

exports.updateUserStatus = (req, res) => {
    try {
        if (req.params.id === null || req.params.id === undefined || !req.params.id)
            return res.status(400).send({ status: 0, message: "User id is null or undefined or empty" });
        if (req.params.status === null || req.params.status === undefined || !req.params.status)
            return res.status(400).send({ status: 0, message: "Status is null or undefined or empty" });
        if (req.params.status !== "active" && req.params.status !== "inactive" && req.params.status !== "suspended") {
            res.status(400).send({ status: 0, message: "Invalid request, status must be active,inactive or suspended" })
        } else {
            const usersRef = db.collection('users').doc(req.params.id)
            usersRef.update({ userstatus: req.params.status })
            res.status(200).send({ status: 1, message: "User status successfully changed to " + req.params.status })
        }
    } catch (error) {
        res.status(200).send({ status: 0, error: error.message })
    }
}
exports.updateUserInformation = async (req, res) => {
    try {

        // if (req.body.userinformation.email !== undefined && req.body.userinformation.email !== null){
        //  if(req.body.userinformation.email){
        //      if(!isEmailValid(req,res, req.body.userinformation.email))
        //     return null;
        //     else
        //     return res.status(400).send({ status: 0, message: "email provided and is empty" });
        //  }
        // }
        // else
        // return res.status(400).send({ status: 0, message: "email not provided" });
        // // if (req.body.phone !== undefined && req.body.phone !== null && !req.body.phone && phonenumberCheck(req, res))
        //     console.log("updateUserInformation Phone Updation")
        // else
        //     return null;
        // if (req.body.type !== null && req.body.type !== undefined && !req.body.type) {
        //     return res.status(400).send({ status: 0, message: "You can not update your account type" });
        // }
        // if (req.body.password !== null && req.body.password !== undefined && req.body.password) {
        //     console.log("updateUserInformation Password Updation")
        // } else {
        //     return res.status(400).send({ status: 0, message: "Please enter the password" });
        // }
        // if (req.body.storageid !== null && req.body.storageid !== undefined && !req.body.storageid) {
        //     return res.status(400).send({ status: 0, message: "You are not allowed to change storage id" });
        // }
        // if (req.body.photos !== null && req.body.photos !== undefined && !req.body.photos) {
        //     console.log("updateUserInformation Photo Updation")
        // } else {
        //     return res.status(400).send({ status: 0, message: "Please select a photo" });
        // }
        // if (req.body.cnic !== null && req.body.cnic !== undefined && !req.body.cnic) {
        //     console.log("updateUserInformation Cnic Updation")
        // } else {
        //     return res.status(400).send({ status: 0, message: "Please select a Cnice" });
        // }
        // if (req.body.workinghours !== null && req.body.workinghours !== undefined && !req.body.workinghours) {
        //     console.log("updateUserInformation Working hours Updation")
        // } else {
        //     return res.status(400).send({ status: 0, message: "Please enter availability time" });
        // }
        // // if (req.body.ipaddress === null && req.body.ipaddress === undefined && !req.body.ipaddress) {
        // //     return res.status(400).send({ status: 0, message: "Please send Ipaddress" });
        // // }
        // if (req.body.username !== null && req.body.username !== undefined && !req.body.username) {
        //     console.log("updateUserInformation Username Updation")
        // } else {
        //     return res.status(400).send({ status: 0, message: "Please enter availability time" });
        // }
        // if (req.body.officeaddress !== null && req.body.officeaddress !== undefined && !req.body.officeaddress) {
        //     console.log("updateUserInformation Office address Updation")
        // }else {
        //     return res.status(400).send({ status: 0, message: "Please enter office address" });
        // }

        const userRef = await db.collection('users').doc(req.user.userid).get()
        if (userRef.exists) {
            if (req.body.userinformation.password !== undefined) {
                const hashpassword = await bcrypt.hash(req.body.userinformation.password, 10)
                req.body.userinformation.password = hashpassword;
            }
            db.collection('users').doc(req.user.userid).update(req.body.userinformation);
            if (req.body.userinformation.email !== undefined) {
                db.collection('users').doc(req.user.userid).update({ emailverification: false });
            }

            if (req.body.userinformation.photos !== undefined) {
                ChangeProfilePictureInAllRecords(req.user.userid, req.body.userinformation.photos, req.user.usertype) // db.collection('users').doc(req.user.userid).update({ emailverification: false });
            }
            if (req.body.userinformation.phone !== undefined) {
                db.collection('users').doc(req.user.userid).update({ phoneverification: false });
                var newusrphone = {
                    userid: req.user.userid,
                    username: req.body.userinformation.phone
                }
                changePhoneNumberInAllRecords(newusrphone);
            }
            if (req.body.userinformation.username !== undefined) {
                var newusr = {
                    userid: req.user.userid,
                    usertype: req.user.usertype,
                    username: req.body.userinformation.username
                }
                res.status(200).send({ status: 1, message: "Profile has been updated", accessToken: generateAccessToken(newusr) })
                changeUserNameInAllRecords(newusr);
            } else
                res.status(200).send({ status: 1, message: "Profile has been updated" })
        } else {
            res.status(200).send({ status: 0, message: "User does not exist" })
        }
    } catch (error) {
        res.status(200).send({ status: 0, error: error.message })
    }
}
async function changeUserNameInAllRecords(newusr) {
    var id = newusr.userid;
    var name = newusr.username;
    try {
        if (newusr.usertype === "landlord") {
            try {
                var query11 = db.collection("properties").where("landlord", "==", id)
                var promise1 = query11.get().then(snapshot => {
                    snapshot.forEach(doc => {
                        db.collection('properties').doc(doc.id).update({ landlordname: name });
                    })
                    return null;
                })
            } catch (error) {
                console.log(error.message)
            }
            try {
                var query10 = db.collection('inspections').where("landlord", "==", id)
                var promise2 = query10.get().then(snapshot => {
                    snapshot.forEach(doc => {
                        db.collection('inspections').doc(doc.id).update({ landlordname: name });
                    })
                    return null;
                })
            } catch (error) {
                console.log(error.message)
            }
            try {
                var query9 = db.collection('requests').where("landlord", "==", id)
                var promise3 = query9.get().then(snapshot => {
                    snapshot.forEach(doc => {
                        db.collection('requests').doc(doc.id).update({ landlordname: name });
                    })
                    return null;
                })
            } catch (error) {
                console.log(error.message)
            }
        } else if (newusr.usertype === "dealer") {
            try {
                var query13 = db.collection('subinspections').where('inspectiondoneby', "==", id)
                var promise13 = query13.get().then(snapshot => {
                    snapshot.forEach(doc => {
                        db.collection('subinspections').doc(doc.id).update({ name: name });
                    })
                    return null;
                })
            } catch (error) {
                console.log(error.message)
            }
            try {
                var query8 = db.collection('properties').where("dealer", "==", id)
                var promise4 = query8.get().then(snapshot => {
                    snapshot.forEach(doc => {
                        db.collection('properties').doc(doc.id).update({ dealername: name });
                    })
                    return null;
                })
            } catch (error) {
                console.log(error.message)
            }
            try {
                var query7 = db.collection('inspections').where('initiatedby', "==", id)
                var promise5 = query7.get().then(snapshot => {
                    snapshot.forEach(doc => {
                        db.collection('inspections').doc(doc.id).update({ initiatedbyname: name });
                    })
                    return null;
                })
            } catch (error) {
                console.log(error.message)
            }
            try {
                var query6 = db.collection('inspections').where('dealer', "==", id)
                var promise6 = query6.get().then(snapshot => {
                    snapshot.forEach(doc => {
                        db.collection('inspections').doc(doc.id).update({ dealername: name });
                    })
                    return null;
                })
            } catch (error) {
                console.log(error.message)
            }
            try {
                var query12 = db.collection('requests').where('dealer', "==", id)
                var promise12 = query12.get().then(snapshot => {
                    snapshot.forEach(doc => {
                        db.collection('requests').doc(doc.id).update({ dealername: name });
                    })
                    return null;
                })
            } catch (error) {
                console.log(error.message)
            }

        } else if (newusr.usertype === "tenant") {
            try {
                var query5 = db.collection('properties').where('tenant', "==", id)
                var promise7 = query5.get().then(snapshot => {
                    snapshot.forEach(doc => {
                        db.collection('properties').doc(doc.id).update({ tenantname: name });
                    })
                    return null;
                })
            } catch (error) {
                console.log(error.message)
            }
            try {
                var query4 = db.collection('requests').where('tenant', "==", id)
                var promise8 = query4.get().then(snapshot => {
                    snapshot.forEach(doc => {
                        db.collection('requests').doc(doc.id).update({ tenantname: name });
                    })
                    return null;
                })
            } catch (error) {
                console.log(error.message)
            }


        } else if (newusr.usertype === "manager") {
            try {
                var query3 = db.collection('subinspections').where('inspectiondoneby', "==", id)
                var promise9 = query3.get().then(snapshot => {
                    snapshot.forEach(doc => {
                        db.collection('subinspections').doc(doc.id).update({ name: name });
                    })
                    return null;
                })
            } catch (error) {
                console.log(error.message)
            }
            try {
                var query2 = db.collection('inspections').where('initiatedby', "==", id)
                var promise10 = query2.get().then(snapshot => {
                    snapshot.forEach(doc => {
                        db.collection('inspections').doc(doc.id).update({ initiatedbyname: name });
                    })
                    return null;
                })
            } catch (error) {
                console.log(error.message)
            }
            try {
                var query1 = db.collection('inspections').where('assignto', "==", id)
                var promise11 = query1.get().then(snapshot => {
                    snapshot.forEach(doc => {
                        db.collection('inspections').doc(doc.id).update({ assignto: name });
                    })
                    return null;
                })
            } catch (error) {
                console.log(error.message)
            }
        }
    }
    catch (error) {
        console.log(error.message)
    }
}
// Access Token Creation For Refresh Token
exports.generateRefreshToken = async (req, res) => {
    const refreshToken = req.body.token;
    if (refreshToken === null)
        return res.sendStatus(401).send({ status: 0, message: "Forbidden" })
    else {
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, user) => {
            if (err) return res.sendStatus(200).send({ status: 403, message: "Invalid token" })
            else {
                req.user = user
                {
                    try {
                        const document = db.collection('userstoken').doc(user.userid);
                        let tokendata = await document.get();
                        if (!tokendata.exists) {
                            return res.sendStatus(200).send({ status: 403, message: "Invalid token" })
                        } else {
                            let verify = tokendata.data();
                            if (refreshToken === verify.refreshToken) {
                                //    const accessToken = generateAccessToken({ userid: user.userid })
                                //    return res.send({ accessToken: accessToken })
                                try {
                                    var retuserdata;
                                    const usr = db.collection('users');
                                    const snapshot = await usr.doc(user.userid).get();
                                    if (!snapshot.exists) {
                                        return res.status(404).send({ status: 0, message: "Invalid username or password" });
                                    } else {
                                        var userdata;
                                        var temp_userdata = snapshot.data();
                                        emailver = temp_userdata.emailverification;
                                        phonever = temp_userdata.phoneverification;
                                        if (temp_userdata.type === 'manager') {
                                            userdata = {
                                                userid: snapshot.id,
                                                email: temp_userdata.email,
                                                password: temp_userdata.password,
                                                username: temp_userdata.username,
                                                type: temp_userdata.type,
                                                storageid: temp_userdata.storageid,
                                                phone: temp_userdata.phone,
                                                photos: temp_userdata.photos,
                                                cnic: temp_userdata.cnic,
                                                userstatus: temp_userdata.userstatus,
                                                dealer: temp_userdata.dealer
                                            }
                                            retuserdata = {
                                                userid: userdata.userid,
                                                email: userdata.email,
                                                username: userdata.username,
                                                type: userdata.type,
                                                storageid: userdata.storageid,
                                                phone: userdata.phone,
                                                photos: userdata.photos,
                                                cnic: userdata.cnic,
                                                userstatus: userdata.userstatus,
                                                dealer: userdata.dealer
                                            }
                                        } else {
                                            userdata = {
                                                userid: snapshot.id,
                                                email: temp_userdata.email,
                                                password: temp_userdata.password,
                                                username: temp_userdata.username,
                                                type: temp_userdata.type,
                                                storageid: temp_userdata.storageid,
                                                phone: temp_userdata.phone,
                                                photos: temp_userdata.photos,
                                                cnic: temp_userdata.cnic,
                                                userstatus: temp_userdata.userstatus
                                            }
                                            retuserdata = {
                                                userid: userdata.userid,
                                                email: userdata.email,
                                                username: userdata.username,
                                                type: userdata.type,
                                                storageid: userdata.storageid,
                                                phone: userdata.phone,
                                                photos: userdata.photos,
                                                cnic: userdata.cnic,
                                                userstatus: userdata.userstatus
                                            }
                                        }
                                        if (!(userdata.userstatus === 'active'))
                                            return res.status(404).send({ status: 0, message: "your account status is " + userdata.userstatus });
                                        else {
                                            const newusr = {
                                                userid: userdata.userid,
                                                usertype: userdata.type,
                                                username: userdata.username,
                                                userphone: userdata.phone
                                            }
                                            const accessToken = generateAccessToken(newusr)
                                            const refreshToken = jwt.sign(newusr, process.env.REFRESH_TOKEN_SECRET)
                                            try {
                                                db.collection('userstoken').doc('/' + userdata.userid + '/').set({
                                                    refreshToken: refreshToken
                                                });
                                            } catch (error) {
                                                return res.status(404).send({ status: 0, message: error.message });
                                            }
                                            return res.status(200).json({ status: 1, accessToken: accessToken, refreshToken: refreshToken, userdata: retuserdata });
                                        }
                                    }
                                } catch (error) {
                                    return res.status(500).send({ status: 0, error: error.message });
                                }
                                ///////
                            } else {
                                return res.sendStatus(200).send({ status: 403, message: "Invalid token" })
                            }
                        }
                    } catch (error) {
                        return res.sendStatus(403).send({ status: 0, message: "Forbidden" })
                    }

                }
            }
        })
        return null;
    }
}

async function changePhoneNumberInAllRecords(newusr) {
    var id = newusr.userid;
    var phone = newusr.phone;
    try {
        if (newusr.usertype === "landlord") {
            try {
                var query11 = db.collection("properties").where("landlord", "==", id)
                var promise1 = query11.get().then(snapshot => {
                    snapshot.forEach(doc => {
                        db.collection('properties').doc(doc.id).update({ landlordphone: phone });
                    })
                    return null;
                })
            } catch (error) {
                console.log(error.message)
            }
            try {
                var query10 = db.collection('inspections').where("landlord", "==", id)
                var promise2 = query10.get().then(snapshot => {
                    snapshot.forEach(doc => {
                        db.collection('inspections').doc(doc.id).update({ landlordphone: phone });
                    })
                    return null;
                })
            } catch (error) {
                console.log(error.message)
            }
            try {
                var query9 = db.collection('requests').where("landlord", "==", id)
                var promise3 = query9.get().then(snapshot => {
                    snapshot.forEach(doc => {
                        db.collection('requests').doc(doc.id).update({ landlordphone: phone });
                    })
                    return null;
                })
            } catch (error) {
                console.log(error.message)
            }
        } else if (newusr.usertype === "dealer") {
            try {
                var query13 = db.collection('subinspections').where('inspectiondoneby', "==", id)
                var promise13 = query13.get().then(snapshot => {
                    snapshot.forEach(doc => {
                        db.collection('subinspections').doc(doc.id).update({ phone: phone });
                    })
                    return null;
                })
            } catch (error) {
                console.log(error.message)
            }
            try {
                var query8 = db.collection('properties').where("dealer", "==", id)
                var promise4 = query8.get().then(snapshot => {
                    snapshot.forEach(doc => {
                        db.collection('properties').doc(doc.id).update({ dealerphone: phone });
                    })
                    return null;
                })
            } catch (error) {
                console.log(error.message)
            }
            try {
                var query7 = db.collection('inspections').where('initiatedby', "==", id)
                var promise5 = query7.get().then(snapshot => {
                    snapshot.forEach(doc => {
                        db.collection('inspections').doc(doc.id).update({ initiatedbyphone: phone });
                    })
                    return null;
                })
            } catch (error) {
                console.log(error.message)
            }
            try {
                var query6 = db.collection('inspections').where('dealer', "==", id)
                var promise6 = query6.get().then(snapshot => {
                    snapshot.forEach(doc => {
                        db.collection('inspections').doc(doc.id).update({ dealerphone: phone });
                    })
                    return null;
                })
            } catch (error) {
                console.log(error.message)
            }
            try {
                var query12 = db.collection('requests').where('dealer', "==", id)
                var promise12 = query12.get().then(snapshot => {
                    snapshot.forEach(doc => {
                        db.collection('requests').doc(doc.id).update({ dealerphone: phone });
                    })
                    return null;
                })
            } catch (error) {
                console.log(error.message)
            }

        } else if (newusr.usertype === "tenant") {
            try {
                var query5 = db.collection('properties').where('tenant', "==", id)
                var promise7 = query5.get().then(snapshot => {
                    snapshot.forEach(doc => {
                        db.collection('properties').doc(doc.id).update({ tenantphone: phone });
                    })
                    return null;
                })
            } catch (error) {
                console.log(error.message)
            }
            try {
                var query4 = db.collection('requests').where('tenant', "==", id)
                var promise8 = query4.get().then(snapshot => {
                    snapshot.forEach(doc => {
                        db.collection('requests').doc(doc.id).update({ tenantphone: phone });
                    })
                    return null;
                })
            } catch (error) {
                console.log(error.message)
            }


        } else if (newusr.usertype === "manager") {
            try {
                var query3 = db.collection('subinspections').where('inspectiondoneby', "==", id)
                var promise9 = query3.get().then(snapshot => {
                    snapshot.forEach(doc => {
                        db.collection('subinspections').doc(doc.id).update({ phone: phone });
                    })
                    return null;
                })
            } catch (error) {
                console.log(error.message)
            }
            try {
                var query2 = db.collection('inspections').where('initiatedby', "==", id)
                var promise10 = query2.get().then(snapshot => {
                    snapshot.forEach(doc => {
                        db.collection('inspections').doc(doc.id).update({ initiatedbyphone: phone });
                    })
                    return null;
                })
            } catch (error) {
                console.log(error.message)
            }
            try {
                var query1 = db.collection('inspections').where('assignto', "==", id)
                var promise11 = query1.get().then(snapshot => {
                    snapshot.forEach(doc => {
                        db.collection('inspections').doc(doc.id).update({ assigntophone: phone });
                    })
                    return null;
                })
            } catch (error) {
                console.log(error.message)
            }
        }
    }
    catch (error) {
        console.log(error.message)
    }
}
// get all manager of a specific dealers (Current User- Dealer) 
exports.getManagersOfDealer = async (req, res) => {
    try {
        const query = db.collection('users');
        const snapshot = await query.where('dealer', '==', req.user.userid).get();
        let managerlist = [];
        let response = [];
        var flag;
        if (snapshot.empty) {
            return res.status(200).send({ status: 0, message: "Managers do not exist" });
        } else {
            snapshot.forEach(doc => {
                var manager = doc.id;
                var managerdata = doc.data()
                flag = true;
                for (var i = 0; i < managerlist.length; i++) {
                    if (manager === managerlist[i]) {
                        flag = false;
                        break;
                    }
                }
                if (flag) {
                    managerlist.push(manager);
                    response.push(
                        {
                            manager: {
                                id: doc.id,
                                name: managerdata.username,
                            },
                            email: managerdata.email,
                            phone: managerdata.phone,
                            type: managerdata.type,
                            userstatus: managerdata.userstatus,
                            photos: managerdata.photos,
                            location: managerdata.location,
                            cnic: managerdata.cnic,
                            time: managerdata.time
                        }
                    )
                }
            });
            var tmpdealer = {
                id: req.user.userid,
                name: req.user.username
            }
            return res.status(200).send({ status: 1, dealer: tmpdealer, total: response.length, manager_list: response });
        }
    } catch (error) {
        return res.status(500).send({ status: 0, error: error.message });
    }
}
/*
exports.sendNormalMail = async (req, res) => {
    var nodemailer = require('nodemailer');
 //   var transporter = nodemailer.createTransport('smtps://@smtp.gmail.com');
 
    var transporter = nodemailer.createTransport({
        service: 'smtp.gmail.com',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        ignoreTLS: true,
        auth: {
            user: '',
            pass: ''
        }
    });
    
 
    var mailOptions = {
        from: 'muhammadumerswati@gmail.com',
        to: 'muhammadumerswati@hotmail.com',
        subject: 'Sending Email using Node.js Node Mailer For project-h',
        text: 'That was easy!'
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            return res.status(200).send(error.message)
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
 
}
 
*/
//  For deleting token from datatbase
exports.deleteToken = (req, res) => {
    return res.status(200).send({ status: 0, message: "pending" })
}
exports.forgetpassword = async (req, res) => {
    var email = req.body.email;
    const ref = await db.collection('users').where('email', '==', email).get();
    if (ref.empty) {
        return res.status(200).send({ status: 0, message: "Invalid Email" })
    } else {
        var user;
        ref.forEach(doc => {
            user = doc.data()
        })
        const msg = {
            to: email,
            from: "info@f3timetracker.com",
            subject: "Password For Project-h",
            text: "Request for forgetting your password for " + email + ", Below is your password",
            html: "<strong>" + user.password + "</strong>"
        };
        sgMial.send(msg);
        return res.status(200).send({ status: 0, message: "Password sent to email" })
    }

}

exports.resetpasswordemail = async (req, res) => {
    var email = req.body.email;
    const ref = await db.collection('users').where('email', '==', email).get();
    if (ref.empty) {
        return res.status(200).send({ status: 0, message: "Invalid Email" })
    } else {
        resetpasswordviaemail(email);
        return res.status(200).send({ status: 1, message: "6 digit Code Sent to email" })
    }
}
exports.resetpasswordphone = async (req, res) => {
    var email = req.body.email;
    const ref = await db.collection('users').where('email', '==', email).get();
    if (ref.empty) {
        return res.status(200).send({ status: 0, message: "Invalid Email" })
    } else {
        var data;
        ref.forEach(doc => {
            data = doc.data()
        })
        resetpasswordviaphone(data.email, data.phone);
        return res.status(200).send({ status: 1, message: "6 digit Code Sent to phone" })
    }
}
async function resetpasswordviaphone(email, phone) {
    var array = new Uint32Array(6);
    array[0] = Math.floor(Math.random() * 10);
    array[1] = Math.floor(Math.random() * 10);
    array[2] = Math.floor(Math.random() * 10);
    array[3] = Math.floor(Math.random() * 10);
    array[4] = Math.floor(Math.random() * 10);
    array[5] = Math.floor(Math.random() * 10);
    //    this.window.crypto.getRandomValues(array);
    var code = String(array[0]) + String(array[1]) + String(array[2]) + String(array[3]) + String(array[4]) + String(array[5])
    db.collection('resetpassword').doc(email).set({
        rcode: code,
        attempt: 3
    })
    const accountSid = process.env.twilio_accountSid;
    const authToken = process.env.twilio_authToken;
    const client = require('twilio')(accountSid, authToken);
    try {
        var promise = client.messages
            .create({
                body: 'Phone Verification Code for Project-h is ' + code,
                from: '+15875078524',
                to: phone
            })
            .then(message => console.log(message.sid))
            .done();
    } catch (error) {
        console.log(error.message)
    }

}
exports.resetpasswordverifycode = async (req, res) => {
    var code = req.body.code;
    var email = req.body.email;
    var user = {
        useremail: email,
        verify: "resetpass"
    }
    const ref = await db.collection('resetpassword').doc(email).get();
    if (ref.exists) {
        if (code === ref.data().rcode) {
            const accessToken = generateAccessToken(user);
            return res.status(200).send({ status: 1, message: "Use this token for resetting password", token_for_resetting_password: accessToken })
        } else {
            var temp = ref.data().attempt
            if (temp === 0) {
                db.collection('resetpassword').doc(email).delete();
                return res.status(200).send({ status: 0, message: "You do not have access to change password" })
            } else {
                db.collection('resetpassword').doc(email).update({
                    attempt: temp - 1
                })
                return res.status(200).send({ status: 0, message: "Invalid Code, Attempts left: " + temp })
            }

        }
    } else {
        return res.status(200).send({ status: 0, message: "Email does not exist" })
    }
}
exports.resetPasswordWithToken = async (req, res) => {
    var token = req.body.token;
    var newpass = req.body.newpassword;
    const hashpassword = await bcrypt.hash(newpass, 10)
    var user;
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, tuser) => {
        if (err) res.sendStatus(403)
        else {
            user = tuser
        }
    })
    if (user.useremail !== undefined && user.verify === "resetpass") {
        const ref = await db.collection('users').where('email', '==', user.useremail).get();
        if (ref.empty) {
            return res.status(200).send({ status: 0, message: "Invalid Token" })
        } else {
            var id;
            ref.forEach(doc => {
                id = doc.id;
            })
            db.collection('users').doc(id).update({
                password: hashpassword
            })
            db.collection('resetpassword').doc(user.useremail).delete();
            return res.status(200).send({ status: 1, message: "Password Updated Successfully" })
        }
    } else {
        return res.status(401).send({ status: 0, message: "Invalid Request" })
    }
}
async function resetpasswordviaemail(email) {
    var array = new Uint32Array(6);
    array[0] = Math.floor(Math.random() * 10);
    array[1] = Math.floor(Math.random() * 10);
    array[2] = Math.floor(Math.random() * 10);
    array[3] = Math.floor(Math.random() * 10);
    array[4] = Math.floor(Math.random() * 10);
    array[5] = Math.floor(Math.random() * 10);
    //    this.window.crypto.getRandomValues(array);
    var code = String(array[0]) + String(array[1]) + String(array[2]) + String(array[3]) + String(array[4]) + String(array[5])
    db.collection('resetpassword').doc(email).set({
        rcode: code,
        attempt: 3
    })

    const msg = {
        to: email,
        from: "info@f3timetracker.com",
        subject: "Reset Password For Project-h",
        text: "Request for resetting your password for " + email + ", Below is code to reset your password",
        html: "Request for resetting your password for " + email + ", Below is code to reset your password<br>" + "<strong>" + array[0] + " " + array[1] + " " + array[2] + " " + array[3] + " " + array[4] + " " + array[5] + " " + "</strong>"
    };
    sgMial.send(msg);

}
exports.apiCallVerifyPhone = async (req, res) => {
    const ref = await db.collection('users').where('phone', '==', req.body.phone).get();
    if (ref.empty) {
        return res.status(200).send({ status: 0, message: "Phone Number do not exist" })
    } else {
        var data;
        ref.forEach(doc => {
            data = doc.data();
        })
        sendVericationSms(data.phone);
        return res.status(200).send({ status: 1, message: "Code sent successfully to phone" })
    }

}
exports.apiCallVerifyEmail = async (req, res) => {
    try {
        const ref = await db.collection('users').where('email', '==', req.body.email).get();
        if (ref.empty) {
            return res.status(200).send({ status: 0, message: "Invalid Email Address" })
        } else {
            var data;
            ref.forEach(doc => {
                data = doc.data();
            })
            verifyEmailAddress(req.body.email);
            return res.status(200).send({ status: 0, message: "Code sent successfully to phone" })
        }
    } catch (error) {
        return res.status(200).send({ status: 0, message: error.message })
    }

}
exports.sendNormalMail = (req, res) => {
    var sgMial = require('@sendgrid/mail');
    sgMial.setApiKey("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")
    const msg = {
        to: "muhammadumerswati@gmail.com",
        from: "info@f3timetracker.com",
        subject: "Password for Project-h",
        html: "Your Account has been registered with project-h for " + "muhammadumerswati@gmail.com" + ", Below is your password<br><strong>" + "123232" + "</strong></br> Change your password when you login for security purpose."
    };
    sgMial.send(msg);
    return res.sendStatus(201);
}
exports.verifyPhoneWithCode = async (req, res) => {

    var phone = req.body.phone
    var code = req.body.code
    if (phone === null || phone === undefined || !phone) {
        return res.status(400).send({ status: 0, message: "Phone Number is null or undefine or empty" })
    }
    if (code === null || code === undefined) {
        return res.status(400).send({ status: 0, message: "Code is null or undefine or empty or invalid" })
    }
    if (!code) {
        return res.status(400).send({ status: 0, message: "Verification code is empty" })
    }
    if (code.length !== 6) {
        return res.status(400).send({ status: 0, message: "Invalid Verification code" })
    }
    const ref = await db.collection('phoneverification').doc(phone).get()
    if (ref.exists) {
        if (code === ref.data().rcode) {
            afterPhoneVerification(phone)
            return res.status(200).send({ status: 1, message: "Phone Verified Succcessfully" })
        } else {
            var temp = ref.data().attempt
            if (temp === 0) {
                db.collection('phoneverification').doc(phone).delete();
                return res.status(200).send({ status: 0, message: "Too many attemps" })
            } else {
                db.collection('phoneverification').doc(phone).update({
                    attempt: temp - 1
                })
                return res.status(200).send({ status: 0, message: "Invalid Code, Attempts left: " + temp })
            }

        }
    } else {
        return res.status(400).send({ status: 0, message: "Invalid Request, Phone Number does not exist" })
    }
}
async function afterPhoneVerification(phone) {
    const ref = await db.collection("users").where('phone', '==', phone).get();
    if (ref.empty) {
        console.log("invalid phone number")
    } else {
        var id;
        ref.forEach(doc => {
            id = doc.id
        })
        db.collection("users").doc(id).update({
            phoneverification: true
        })
        //   db.collection("users").doc(id).delete();
    }
}
async function sendVericationSms(phone) {
    var array = new Uint32Array(6);
    array[0] = Math.floor(Math.random() * 10);
    array[1] = Math.floor(Math.random() * 10);
    array[2] = Math.floor(Math.random() * 10);
    array[3] = Math.floor(Math.random() * 10);
    array[4] = Math.floor(Math.random() * 10);
    array[5] = Math.floor(Math.random() * 10);
    var code = String(array[0]) + String(array[1]) + String(array[2]) + String(array[3]) + String(array[4]) + String(array[5])
    db.collection('phoneverification').doc(phone).set({
        rcode: code,
        attempt: 3
    })
    const accountSid = process.env.twilio_accountSid;
    const authToken = process.env.twilio_authToken;
    const client = require('twilio')(accountSid, authToken);
    try {
        var promise = client.messages
            .create({
                body: 'Phone Verification Code for Project-h is ' + code,
                from: '+15875078524',
                to: phone
            })
            .then(message => console.log(message.sid))
            .done();
    } catch (error) {
        console.log(error.message)
    }

}