require("dotenv").config()
const jwt = require("jsonwebtoken");
var admin = require("firebase-admin");
const Sync = require("twilio/lib/rest/preview/Sync");
const db = admin.firestore();


//generate token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]
    if (token === null) return res.status(401).send({ status: 401, message: "Token is not sent" })
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(401).send({ status: 401, message: "Invalid token" })
        }
            req.user = user
            next()
            return null
    })
    return null
}


// Function for Generating Access Token
function generateAccessToken(newusr) {
    // Setting token for 200 days for testing
    return jwt.sign(newusr, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "3000000min" })
}

async function checkMailSubscription(userid) {
    const ref = await db.collection('users').doc(userid).get()
    return ref.data().sendmeemail
}

module.exports = {
    authenticateToken,
    generateAccessToken,
    checkMailSubscription,
}