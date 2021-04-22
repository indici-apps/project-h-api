module.exports = leasemodule => {
    const leaseagreement = require('../controllers/leaseagreement.controller');
    const { authenticateToken } = require("../auth/TokenAuth");


    leasemodule.get("/v1/leaseagreementinformation/:leaseagreementid", authenticateToken, leaseagreement.getLeaseAgreementInformation)
    leasemodule.put("/v1/request/leasesignature/:leaseagreementid", authenticateToken, leaseagreement.requestSignatureByDealer)

    leasemodule.post("/v1/landlord/leaseagreementsignature/", authenticateToken, leaseagreement.updateLandlordLeaseAgreement)
    //leasemodule.post("/v1/tenant/leaseagreementsignature/", authenticateToken, leaseagreement.updateTenantLeaseAgreement)

    // Get My Requests (Landlord) (status : active for requests which are not responded by
    // landlord else it will return accepted,rejected or any other request)
    /**
* @swagger
* /v1/landlord/leaseagreement/{status}:
*  get:
*    tags:
*      - landlord
*    security:
*      - Bearer: []
*    description: Get Active and Responded Request for landlord
*    parameters:
*      - in: path
*        name: status
*        required: true
*        type: string
*        enum: [active,completed]
*        description: Request Status whether it is active or accepted or rejected
*    responses:
*      '200':
*        description: A successful response
*/
    leasemodule.get("/v1/landlord/leaseagreement/:status", authenticateToken, leaseagreement.getMyLeaseAgreementLandlord)

    // Get My Requests (Tenant) (status : active for requests which are not responded by
    // landlord else it will return accepted,rejected or any other request)
    /**
    * @swagger
    * /v1/tenant/leaseagreement/{status}:
    *  get:
    *    tags:
    *      - tenant
    *    security:
    *      - Bearer: []
    *    description: Get Active and Responded Request made by Tenant
    *    parameters:
    *      - in: path
    *        name: status
    *        required: true
    *        type: string
    *        enum: [active,completed]
    *        description: Request Status whether it is active or accepted or rejected
    *    responses:
    *      '200':
    *        description: A successful response
    */
    leasemodule.get("/v1/tenant/leaseagreement/:status", authenticateToken, leaseagreement.getMyLeaseAgreementTenant)

    // Get Dealer Requests
    /**
    * @swagger
    * /v1/dealer/leaseagreement/{status}:
    *  get:
    *    tags:
    *      - properties
    *    security:
    *      - Bearer: []
    *    description: Get Active and Responded Request for Dealer
    *    parameters:
    *      - in: path
    *        name: status
    *        required: true
    *        type: string
    *        enum: [active,completed]
    *        description: Request Status whether it is active or accepted or rejected
    *    responses:
    *      '200':
    *        description: A successful response
    */
    leasemodule.get("/v1/dealer/leaseagreement/:status", authenticateToken, leaseagreement.getMyLeaseAgreementDealer)


}