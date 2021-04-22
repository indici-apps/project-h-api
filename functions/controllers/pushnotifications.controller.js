const { Expo } = require('expo-server-sdk')
var admin = require("firebase-admin");
let expo = new Expo(); // { accessToken: process.env.EXPO_ACCESS_TOKEN }
const db = admin.firestore();

exports.addOrUpdateExpoToken = async (req, res) => {
    try {
        db.collection('users').doc(req.user.userid).update({
            userexpotoken: req.params.expotoken
        })
        res.status(200).send({ status: 1, message: "Expo Token has been updated" })
    } catch (error) {
        res.status(501).send({ status: 0, message: error.message })
    }
}

exports.removeExpoToken = async (req, res) => {
    try {
        db.collection('users').doc(req.user.userid).update({
            userexpotoken: "notlogined"
        })
        res.status(200).send({ status: 1, message: "Expo Token has been deleted" })
    } catch (error) {
        res.status(501).send({ status: 0, message: error.message })
    }
}
exports.sendNotificationToSpecificUser = async (req, res) => {

    const userref = await db.collection('users').doc(req.body.userid).get()
    if (userref.exists) {
        const pushToken = userref.data().userexpotoken
        let messages = []
        if (pushToken !== "notlogined") {
            console.log(pushToken);
            messages.push({
                to: pushToken,
                sound: 'default',
                body: req.body.message,
                //     data: { withSome: 'data' },
            })
            let chunks = expo.chunkPushNotifications(messages);
            (async () => {
                try {
                    let ticketChunk = await expo.sendPushNotificationsAsync(chunks[0]);
                    console.log(ticketChunk);
                } catch (error) {
                    console.error(error.message);
                }
            })();
        } else {
            console.log("working")
        }
    }
}

exports.sendNotificationbyUserId = async (userid, message) => {
    try {
        const userref = await db.collection('users').doc(userid).get()
        if (userref.exists) {
            const pushToken = userref.data().userexpotoken
            let messages = []
            if (pushToken !== "notlogined") {
                console.log(pushToken);
                messages.push({
                    to: pushToken,
                    sound: 'default',
                    body: message,
                    //     data: { withSome: 'data' },
                })
                let chunks = expo.chunkPushNotifications(messages);
                (async () => {
                    try {
                        let ticketChunk = await expo.sendPushNotificationsAsync(chunks[0]);
                        console.log(ticketChunk);
                    } catch (error) {
                        console.error(error.message);
                    }
                })();
            } else {
                console.log("working")
            }
        }
    } catch (error) {
        console.log(error)
    }
}

exports.sendNotificationByExpoToken = async (ExpoToken, message) => {
    try {
        const pushToken = ExpoToken
        let messages = []
        if (pushToken !== "notlogined") {
            console.log(pushToken);
            messages.push({
                to: pushToken,
                sound: 'default',
                body: message,
                //     data: { withSome: 'data' },
            })
            let chunks = expo.chunkPushNotifications(messages);
            (async () => {
                try {
                    let ticketChunk = await expo.sendPushNotificationsAsync(chunks[0]);
                    console.log(ticketChunk);
                } catch (error) {
                    console.error(error.message);
                }
            })();
        } else {
            console.log("working")
        }

    } catch (error) {
        console.log(error)
    }
}
