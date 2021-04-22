require("dotenv").config()
const functions = require('firebase-functions');
var admin = require("firebase-admin");
var serviceAccount = require("./permission_fb.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://project-h-de8a7.firebaseio.com"
});

const express = require('express');
const cors = require('cors');
const app = express();
app.use(express.json(true))

//swagger documention
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");


const jwt = require("jsonwebtoken");

app.use(cors({ origin: true }));



//Swagger Options
const swaggerOptions = {
    swaggerDefinition: {
        info: {
            version: "1.0.0",
            title: "Project H",
            description: "Real Estate API. API Authorization is must in order to continue using this API. To Authorize user, Hit the Login API call, you will get the Bearer Access Token. Click on Authorize button and copy paste the Access Token to Authorize.",
            contact: {
                name: "F3 Technolgies Pakistan"
            },
            servers: ["http://us-central1-project-h-de8a7.cloudfunctions.net/app"]
        },
        "host": "us-central1-project-h-de8a7.cloudfunctions.net/app",
        securityDefinitions: {
            Bearer: {
                type: "apiKey",
                name: "Authorization",
                in: "header "
            }
        },
        "tags": [
            {
                "name": "users",
                "description": "Everything about your User Startup Session"
            },
            {
                "name": "properties",
                "description": "Everything related to your property management"
            },
            {
                "name": "inspections",
                "description": "Everything related to your property inspections"
            },
            {
                "name": "images",
                "description": "Everything related to uploading images"
            },
            {
                "name": "verification",
                "description": "Everything related to user verification"
            }
            ,
            {
                "name": "reset password",
                "description": "Everything related to resetting password"
            },
            {
                "name": "manager",
                "description": "Everything related specifically to manager"
            },
            {
                "name": "tenant",
                "description": "Everything related specifically to tenant"
            },
            {
                "name": "landlord",
                "description": "Everything related specifically to landlord"
            }
        ],
    },

    apis: ['./routes/*.js']
    //apis: ["index.js"]
};


const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));


require("./routes/user.routes")(app)
require("./routes/anonymous.routes")(app)
require("./routes/properties.routes")(app)
require("./routes/inspection.routes")(app)
require("./routes/favouriteproperties.routes")(app)
require("./routes/pushnotifications.routes")(app)
require("./routes/datasets.routes")(app)
require("./routes/requests.routes")(app)
require("./routes/leaseagreement.routes")(app)
require("./routes/notificationslog.routes")(app)
require("./routes/counter.routes")(app)
require("./image/imageoptimization")

// // Read all past/inactive inspection realted to a specific property  do not work
// app.get('/api/ginactiveinspec/:id', authenticateToken, (req, res) => {
//     (async () => {
//         try { // inspectionstatus propertyid
//             const query = db.collection('inspections');
//             var response = [];
//             const snapshot1 = await query.where('propertyid', '==', req.params.id);
//             const snapshot = await snapshot1.where('inspectionstatus', '==', "inactive").get();
//             if (snapshot.empty) {
//                 return res.status(200).send('No matching documents.');
//             }
//             snapshot.forEach(doc => {
//                 const tmplandlord = {
//                     id: doc.id,
//                     propertyid: doc.data().propertyid,
//                     description: doc.data().description,
//                     inspectiontype: doc.data().inspectiontype,
//                     inspectionstatus: doc.data().inspectionstatus,
//                 }
//                 response.push(tmplandlord);
//             });

//             return res.status(200).send(response);
//         } catch (error) {
//             console.log(error);
//             return res.status(500).send(error);
//         }
//     })();
// });



// //Update property status
// app.put('/api/updatepropertystatus', authenticateToken, (req, res) => {
//     try {
//         const usersRef = db.collection('properties').doc(req.body.propertyid)
//         usersRef.update({ status: req.body.status })
//         res.status(200).send({ message: "success" })
//     } catch (error) {
//         res.status(200).send({ message: error })
//     }
// })

// //delete - delete

// // For deleting token from datatbase
// app.delete('/api/deletetoken', authenticateToken, (req, res) => {
//     // pending
// })
// //Delete Property
// app.delete('/api/deleteproperty', authenticateToken, async (req, res) => {
//     try {
//         const usersRef = await db.collection('properties').doc(req.body.propertyid).delete()
//         res.status(200).send({ message: "success" })
//     } catch (error) {
//         res.status(200).send({ message: error })
//     }
// })


















// const functions = require('firebase-functions');
//const gcs = require('@google-cloud/storage');
const spawn = require('child-process-promise').spawn;
const mkdirp = require('mkdirp-promise');
const path = require('path');
const os = require('os');
const fs = require('fs');
const { Storage } = require('@google-cloud/storage');
const mime = require('mime');
const projectId = "project-h-de8a7" //
const bucketName = `${projectId}.appspot.com`;

///
const storageforurl = new Storage();
const gcs = new Storage({
    projectId: projectId,
    keyFilename: "./permission_fb.json"
});
// const runtimeOpts = {
//     timeoutSeconds: 300,
//     memory: '1GB'
// } .runWith(runtimeOpts)
exports.optimizeImages = functions.storage.object().onFinalize(async (data) => {
    // File and directory paths.
    // console.log({error:"Reference IO? "+data.bucket.toString())
    const filePath = data.name;
    const tempLocalFile = path.join(os.tmpdir(), filePath);
    const tempLocalDir = path.dirname(tempLocalFile);


    // Exit if this is triggered on a file that is not an image.
    if (!data.contentType.startsWith('image/')) {
        console.log('This is not an image.');
        return null;
    }

    // Exit if this is a move or deletion event.
    if (data.resourceState === 'not_exists') {
        console.log('This is a deletion event.');
        return null;
    }

    // Exit if file exists but is not new and is only being triggered
    // because of a metadata change.
    if (data.resourceState === 'exists' && data.metageneration > 1) {
        console.log('This is a metadata change event.');
        return null;
    }

    // Cloud Storage files.
    const bucket = gcs.bucket(data.bucket);
    const file = bucket.file(filePath);

    return file.getMetadata()
        .then(([metadata]) => {
            if (metadata.metadata && metadata.metadata.optimized) {
                return Promise.reject(new Error("Image has been already optimized"));
            }
            return Promise.resolve();
        })
        .then(() => mkdirp(tempLocalDir))
        .then(() => file.download({ destination: tempLocalFile }))
        .then(() => {
            console.log('The file has been downloaded to', tempLocalFile);
            // Generate a thumbnail using ImageMagick.
            return spawn('convert', [tempLocalFile, '-strip', '-interlace', 'Plane', '-quality', '20', tempLocalFile]);
        })
        .then(() => {
            console.log('Optimized image created at', tempLocalFile);
            // Uploading the Optimized image.
            return bucket.upload(tempLocalFile, {
                destination: file,
                metadata: {
                    metadata: {
                        optimized: true
                    }
                }
            });
        })
        .then(() => {
            console.log('Optimized image uploaded to Storage at', file);
            // Once the image has been uploaded delete the local files to free up disk space.
            fs.unlinkSync(tempLocalFile);

            // Get the Signed URLs for optimized image.
            const config = {
                action: 'read',
                expires: '03-01-2500'
            };
            return file.getSignedUrl(config);
        });
});


























//Export the apit to firebase cloud function
exports.app = functions.https.onRequest(app);