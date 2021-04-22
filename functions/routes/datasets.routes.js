module.exports = datasets => {
    const dtsets = require('../controllers/datasets.controller.js');
    const { authenticateToken } = require("../auth/TokenAuth")

    datasets.post("/v1/city/add/:cityname", authenticateToken, dtsets.createCity)
    datasets.get("/v1/getareasofcity/:cityname", dtsets.getAreasOFSpecificCity)
    datasets.get("/v1/getcitieslist", dtsets.getCities)
    datasets.post("/v1/area/add/:cityname/:areaname", authenticateToken, dtsets.addAreaAgainstCity)


    datasets.get("/v1/lease/durations", authenticateToken, dtsets.getLeaseAgreementsDuration)
    datasets.post("/v1/lease/durations/:months", authenticateToken, dtsets.addLeaseAgreementsDuration)

    datasets.get("/v1/property/catagory", authenticateToken, dtsets.getpropertycatagory)
    datasets.post("/v1/property/catagory", authenticateToken, dtsets.addpropertycatagory)

    datasets.post("/v1/property/addarea/:area", dtsets.addPropertyArea)
    datasets.get("/v1/property/getareas", dtsets.getpropertyAreas)
}