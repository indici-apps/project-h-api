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
const projectId = "project-h-de8a7"
const bucketName = `${projectId}.appspot.com`;
///
const storageforurl = new Storage();
const storage = new Storage({
    projectId: projectId,
    keyFilename: "./permission_fb.json"
});


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
const Busboy = require('busboy');
const { verify } = require("crypto");

exports.removeFavProperty = async (req, res) => {
try {
    db.collection('favoriteproperties').doc(req.params.recordid).delete();
    res.status(200).send({status:1, message:"Property has been unmarked"})
} catch (error) {
    res.status(500).send({status:0, message:error.message})
}

}
exports.addPropertyToFavorite = async (req, res) => {
    try {
        const ref1 = await db.collection('favoriteproperties').where('userid', '==', req.user.userid).where('propertyid', '==', req.body.propertyid).get();
        if (ref1.empty) {
            const document = db.collection('properties').doc(req.body.propertyid);
            let property = await document.get();
            const propertydata = property.data()
            // console.log(propertydata.address)
            // console.log(req.body.propertyid)
            // console.log(propertydata.size)
            // console.log(propertydata.location)
            // console.log(propertydata.bedrooms)
            // console.log(propertydata.photos)
            if (!property.exists) return res.status(200).send({ status: 0, message: "Property does not exist" })
            else {
                if(propertydata.category === "residential"){
                db.collection('favoriteproperties').doc().create({
                    userid: req.user.userid,
                    propertyid: req.body.propertyid,
                    title: propertydata.title,
                    address: propertydata.address,
                    size: propertydata.size,
                    sizeunit: propertydata.sizeunit,
                    //location: propertydata.location,
                    rental: propertydata.rental,
                    //numberoffloors: propertydata.rental,
                    category:  propertydata.category,
                    bedrooms: propertydata.bedrooms,
                    bathrooms: propertydata.bathrooms,
                    photos: propertydata.photos,
                })}
                else{
                db.collection('favoriteproperties').doc().create({
                    userid: req.user.userid,
                    propertyid: req.body.propertyid,
                    address: propertydata.address,
                    size: propertydata.size,
                    sizeunit: propertydata.sizeunit,
                    category:  propertydata.category,
                    title: propertydata.title,
                    //location: propertydata.location,
                    rental: propertydata.rental,
                    numberoffloors: propertydata.numberoffloors,
                    //bedrooms: propertydata.bedrooms,
                    //bathrooms: propertydata.bathrooms,
                    photos: propertydata.photos,
                })}
                return res.status(200).send({ status: 1, message: "property has been marked as favourite" });
            }
        } else {
            return res.status(200).send({ status: 0, message: "Aleady exist in Yours favourite Properties" });

        }
    } catch (error) {
        return res.status(500).send({ status: 0, error: error.message });
    }
}
exports.getFavoriteProperties = async (req, res) => {
    try {
        let response = [];
        const ref = await db.collection('favoriteproperties').where('userid', '==', req.user.userid).get();
        if (ref.empty) {
            return res.status(200).send({ status: 1, message: "You have Zero favorite Properties" });
        } else {
            ref.forEach(doc => {
                var propertydata = doc.data();
                var rec = {
                    recordid: doc.id, 
                    propertyid: propertydata.propertyid,
                    photos: propertydata.photos,
                    address: propertydata.address,
                    size: propertydata.size,
                    title: propertydata.title,
                    location: propertydata.location,
                    rental: propertydata.rental,
                    sizeunit: propertydata.sizeunit,
                    category: propertydata.category,
                    bedrooms: propertydata.bedrooms,
                    bathrooms: propertydata.bathrooms,
                }
                response.push(rec);
            })
            return res.status(200).send({ status: 1, userid: req.user.userid, total: response.length, favoriteproperties: response });
        }

        // const document = db.collection('properties').doc(req.body.propertyid);
        // let property = await document.get();
        // if (!property.exists) return res.status(200).send({ status: 0, message: "Property does not exist" })
        // else{
        // db.collection('favoriteproperties').doc().create({
        //     userid: req.user.userid, 
        //     propertyid: req.body.propertyid     
        //  })

    } catch (error) {
        return res.status(500).send({ status: 0, error: error.message });
    }

}