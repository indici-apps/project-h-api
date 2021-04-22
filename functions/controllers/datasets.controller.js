const { response } = require("express");
var admin = require("firebase-admin");
const db = admin.firestore();

// create city, create city area
// crud
exports.addAreaAgainstCity = async (req, res) => {
    try {
        if (req.params.cityname === undefined) {
            res.status(200).send({ status: 0, message: "cityname is null or undefined from client side" })
            return null;
        }
        if (req.params.areaname === undefined) {
            res.status(200).send({ status: 0, message: "areaname is null or undefined from client side" })
            return null;
        }
        var city = req.params.cityname.toLowerCase();
        var area = req.params.areaname.toLowerCase();
        const cityref = await db.collection("city").where("cityname", "==", city).get();
        if (!cityref.empty) {
            var citykey;
            cityref.forEach(doc => {
                citykey = doc.id;
            })
            // const citykey = db.collection("city").doc().id;
            console.log(citykey);
            const areaRef = await db.collection("city").doc(citykey).collection("areas").where("areaname", "==", area).get();
            if (areaRef.empty) {
                const citydata = db.collection("city").doc(citykey).set({
                    cityname: city
                }).then(
                    db.collection("city").doc(citykey).collection("areas").doc().set({
                        areaname: area
                    })
                )
                res.status(200).send({ status: 0, message: "Area created successfully" })
                return null;
            }
            else {
                res.status(200).send({ status: 0, message: "Area name already exist" })
                return null;
            }
        } else {
            res.status(200).send({ status: 0, message: "City do not exist" })
            return null;
        }
    } catch (error) {
        res.status(500).send({ status: 0, message: error })
        return null;
    }

}

exports.getAreasOFSpecificCity = async (req, res) => {
    try {
        if (req.params.cityname === undefined) {
            res.status(200).send({ status: 0, message: "cityname is null or undefined from client side" })
            return null;
        }
        var city = req.params.cityname.toLowerCase();
        const cityref = await db.collection("city").where("cityname", "==", city).get();

        if (!cityref.empty) {
            var citydata, citykey;
            cityref.forEach(doc => {
                citykey = doc.id;
                citydata = doc.data();
            })
            const areaRef = await db.collection("city").doc(citykey).collection("areas").get();
            let response = []
            if (!areaRef.empty) {
                areaRef.forEach(doc => {
                    response.push(doc.data().areaname)
                })
            }
            res.status(200).send({
                status: 1, city: {
                    id: citykey,
                    name: citydata.cityname
                }, areas: response
            })
            return null;

        } else {
            res.status(200).send({ status: 0, message: "City do not exist" })
            return null;
        }

        // const areaRef = await db.collection("areas").where("areaname","==",area).get();
        // if(areaRef.empty){
        //     const cityref = await db.collection("city").where("cityname","==",city).get();
        //     if(!cityref.empty){
        //         var citykey;
        //         cityref.forEach(doc=>{
        //             citykey=doc.id;
        //         })
        //       // const citykey = db.collection("city").doc().id;
        //        console.log(citykey);
        //        const citydata = db.collection("city").doc(citykey).set({
        //             cityname: city
        //         }).then(
        //             db.collection("city").doc(citykey).collection("areas").doc().set({
        //                 areaname: area
        //             })
        //         )
        //         res.status(200).send({ status:0, message:"Area created successfully"})
        //         return null;  
        //     }   
        // }else{
        //     res.status(200).send({ status:0, message:"Area name already exist"})
        //     return null;
        // }
    } catch (error) {
        res.status(200).send({ status: 0, message: error })
        return null;
    }

}
exports.getCities = async (req, res) => {
    try {
        let response = []
        const cityref = await db.collection("city").get();
        if (cityref.empty) {
            res.status(200).send({ status: 0, message: "Cities do not exist" })
            return null;
        } else {
            cityref.forEach(doc => {
                var cityid = doc.id;
                var cityname = doc.data().cityname;
                response.push(
                    cityname
                )
            })
            res.status(200).send({ status: 1, cities: response })
            return null;
        }
    } catch (error) {
        res.status(200).send({ status: 0, message: error })
        return null;
    }
}

exports.createCity = async (req, res) => {
    try {
        if (req.params.cityname === undefined) {
            return res.status(200).send({ status: 0, message: "cityname is null or undefined from client side" })

        }
        var city = req.params.cityname.toLowerCase();
        const cityref = await db.collection("city").where("cityname", "==", city).get();
        if (cityref.empty) {
            db.collection("city").doc().create({
                cityname: city
            })
            return res.status(200).send({ status: 0, message: "City created successfully" })

        } else {
            return res.status(200).send({ status: 0, message: "City name already exist" })

        }
    } catch (error) {
        return res.status(200).send({ status: 0, message: error.message })

    }
}

exports.addLeaseAgreementsDuration = async (req, res) => {
    try {
        if (req.params.months === undefined) {
            return res.status(401).send({ status: 0, message: "months is undefined or null" })
        }
        var monthsinnumber = parseInt(req.params.months)
        const ref = await db.collection('leasedurations').where('duration', '==', req.params.months).get()
        if (ref.empty) {
            db.collection('leasedurations').doc().create({
                duration: req.params.months
            })
            return res.status(201).send({ status: 0, message: "Lease duration created successfully" })
        } else {
            return res.status(200).send({ status: 0, message: "Lease duration already exist" })
        }
    } catch (error) {
        return res.status(501).send({ status: 0, message: error.message })
    }
}
exports.getLeaseAgreementsDuration = async (req, res) => {
    try {
        const ref = await db.collection('leasedurations').get()
        if (ref.empty) {
            return res.status(404).send({ status: 0, message: "Please add lease durations" })
        } else {
            let response = []
            ref.forEach(doc => {
                response.push({
                    id: doc.id,
                    months: doc.data().duration
                })
            })
            return res.status(200).send({ status: 0, leasedurations: response })
        }
    } catch (error) {
        return res.status(501).send({ status: 0, message: error.message })
    }
}
exports.getpropertycatagory = async (req, res) => {
    try {
        const ref = await db.collection('propertycatagory').get()
        if (ref.empty) {
            return res.status(404).send({ status: 0, message: "Please add Property Catagory" })
        } else {
            let commercial = []
            let residential = []
            ref.forEach(doc => {
                var cata = doc.data()
                if (cata.catagory === "commercial") {
                    commercial.push(cata.subcatagory)
                } else if (cata.catagory === "residential") {
                    residential.push(cata.subcatagory)
                }
            })
            commercial = commercial.sort();
            commercial.push("other")
            residential = residential.sort()
            residential.push("other")
            return res.status(200).send({ status: 1, commercial: commercial, residential: residential })
        }
    } catch (error) {
        return res.status(501).send({ status: 0, message: error.message })
    }
}
exports.addpropertycatagory = async (req, res) => {
    try {
        if (req.body.catagory === undefined || !req.body.catagory) {
            return res.status(401).send({ status: 0, message: "Property catagory is undefined or null or empty" })
        }
        if (req.body.subcatagory === undefined || !req.body.subcatagory) {
            return res.status(401).send({ status: 0, message: "Property subcatagory is undefined or null or empty" })
        }
        if (req.body.catagory.toLowerCase() !== "residential" && req.body.catagory.toLowerCase() !== "commercial") {
            return res.status(401).send({ status: 0, message: "Property catagory musr be commercial or residential" })
        }
        const ref = await db.collection('propertycatagory').where('subcatagory', '==', req.body.subcatagory.toLowerCase()).get()
        if (ref.empty) {
            db.collection('propertycatagory').doc().create({
                subcatagory: req.body.subcatagory.toLowerCase(),
                catagory: req.body.catagory.toLowerCase()
            })
            return res.status(201).send({ status: 1, message: "Property subcatagory created successfully" })
        } else {
            return res.status(200).send({ status: 0, message: "Property subcatagory already exist" })
        }
    } catch (error) {
        return res.status(501).send({ status: 0, message: error.message })
    }
}


// Property inspections catagories/ area
exports.addPropertyArea = async (req, res) => {
    try {
        if (req.params.area === undefined || !req.params.area) {
            return res.status(401).send({ status: 0, message: "Property area is undefined or null or empty" })
        }
        const ref = await db.collection('propertyareas').where('areaname', '==', req.params.area.toLowerCase()).get()
        if (ref.empty) {
            db.collection('propertyareas').doc().create({
                areaname: req.params.area.toLowerCase()
            })
            return res.status(201).send({ status: 1, message: "Property area created successfully" })
        } else {
            return res.status(200).send({ status: 0, message: "Property area already exist" })
        }
    } catch (error) {
        return res.status(501).send({ status: 0, message: error.message })
    }
}

exports.getpropertyAreas = async (req, res) => {
    try {
        const ref = await db.collection('propertyareas').get()
        if (ref.empty) {
            return res.status(404).send({ status: 0, message: "Please add Property Areas" })
        } else {
            let response = []
            // let residential = []
            ref.forEach(doc => {
                // var cata = doc.data()
                response.push(doc.data().areaname)
            })
            return res.status(200).send({ status: 1, propertyarea: response.sort() })
        }
    } catch (error) {
        console.log(error)
        return res.status(501).send({ status: 0, message: error.message })
    }
}