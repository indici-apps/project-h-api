module.exports = props => {
    const properties = require('../controllers/properties.controller.js');
    const { authenticateToken } = require("../auth/TokenAuth");

    props.get("/v1/hiprops", authenticateToken, properties.helloProperties);

    props.put("/v1/property/updateDraftedStatus/:propertyid", authenticateToken, properties.insertPropertyPhotosAndLocation)
    

    // get Request Data
    props.get("/v1/request/information/:requestid", authenticateToken, properties.getRequestInformation);

    //update request status by manager
    //props.put("/v1/visitrequest/updatestatus/:requestid", authenticateToken, properties.changeManagerStatusInVisitRequest);

    //get Landlord Properties Drafted
    props.get("/v1/property/getdraftedproperties/:page/:size", authenticateToken, properties.getLandlordPropertiesDrafted);

    //accept or reject dealer request to add in property
    props.post("/v1/request/dealerforproperty/:requestid/:status", authenticateToken, properties.acceptdealerrequestforproperty);

    // Cancel Request
    props.post("/v1/request/accept/manager/:requestid", authenticateToken, properties.managerAcceptVisitRequest);

    // Cancel Request
    props.delete("/v1/request/cancel/:requestid", authenticateToken, properties.cancelRequestTenant);

    // add Manager to Visit Request
    props.post("/v1/request/visit/addmanager/:requestid/:managerid", authenticateToken, properties.addManagerToVisitRequest);

    // get available properties only
    props.get("/v1/property/getallavailable/:page/:size", authenticateToken, properties.getAllAvailablePropertiesOnly);

    // delete request
    props.delete("/v1/request/delete/:requestid", authenticateToken, properties.cancelRequestTenant);

    // Create property by landlord
    /**
     * @swagger
     * /v1/property/create:
     *    post:
     *      tags:
     *         - landlord
     *      security:
     *         - Bearer: []
     *      description: Add new Property by Landlord
     *      responses:
     *         '200':
     *            description: A successful response
     *    consumes:
     *      - application/json
     *    parameters:
     *      - name: Property Creation
     *        in: body
     *        description: Registration of new property.
     *        required: true
     *        schema:
     *          type: object
     *          properties:
     *             title:
     *               type: string
     *               example: Amazing 3 bedroom home near Bahria
     *             ipaddress:
     *               type: string
     *               example: 192.155.78.56
     *             storageid:
     *               type: string
     *               example: ASHFGF65FG6
     *             size:
     *               type: string
     *               example: 13250
     *             bedrooms:
     *               type: string
     *               example: 3
     *             bathrooms:
     *               type: string
     *               example: 5
     *             type:
     *               type: string
     *               enum: [commercial, appartment, house, shop, office]
     *               example: commercial
     *             description:
     *               type: string
     *               example: This is a beautiful Property
     *             location:
     *               type: object
     *               items: {
     *                      "latitude": 37.3043,
     *                      "longitude": 34.5012
     *                       }
     *               example:
     *                  "latitude": 37.3043
     *                  "longitude": 34.5012
     *             address:
     *               type: object
     *               items: {
     *                      "city": "islamabad",
     *                      "country": "pakistan",
     *                      "street": "Street 1 , I-14",
     *                      "house": "101A",
     *                      "postal code": "44000"
     *                       }
     *               example:
     *                  "city": "islamabad"
     *                  "country": "pakistan"
     *                  "street": "Street 1 , I-14"
     *                  "house": "101A"
     *                  "postal code": "44000"
     *             rental:
     *               type: string
     *               example: PKR 10,500
     *             dealer:
     *               type: string
     *               example: not Available
     *             dealername:
     *               type: string
     *               example: not Available
     *             tenant:
     *               type: string
     *               example: not Available
     *             tenantname:
     *               type: string
     *               example: not Available
     *             status:
     *               type: string
     *               enum: [available, leased, not available]
     *               example: available
     *             photos:
     *               type: array
     *               items: {}
     *               example:
     *                 - my-base64-string
     *                 - my-another-base64-string              
     */
    props.post("/v1/property/create", authenticateToken, properties.createProperty)

    //Get List Of All Properties
    /**
     * @swagger
     * /v1/property/all/{page}/{size}:
     *  get:
     *    tags:
     *      - properties
     *    security:
     *      - Bearer: []
     *    description: Get List of all the properties available
     *    parameters:
     *      - in: path
     *        name: page
     *        required: true
     *        type: integer
     *        description: Page Number
     *      - in: path
     *        name: size
     *        required: true
     *        type: integer
     *        description: Size of data
     *    responses:
     *      '200':
     *        description: A successful response
     */
    props.get("/v1/property/all/:page/:size", authenticateToken, properties.getAllProperties)

    //Get List Of All Properties in which dealer is not available
    /**
     * @swagger
     * /v1/property/all/withoutDealer/{page}/{size}:
     *  get:
     *    tags:
     *      - properties
     *    security:
     *      - Bearer: []
     *    description: Get List of all the properties with dealer not available
     *    parameters:
     *      - in: path
     *        name: page
     *        required: true
     *        type: integer
     *        description: Page Number
     *      - in: path
     *        name: size
     *        required: true
     *        type: integer
     *        description: Size of data
     *    responses:
     *      '200':
     *        description: A successful response
     */
    props.get("/v1/property/all/withoutDealer/:page/:size", authenticateToken, properties.getPropertiesWithoutDealer)

    //Get Landlord By ID
    /**
     * @swagger
     * /v1/property/landlord/{id}/{page}/{size}:
     *  get:
     *    tags:
     *      - properties
     *    security:
     *      - Bearer: []
     *    description: Get List of all the properties for a landlord based on Landlord ID
     *    parameters:
     *      - in: path
     *        name: id
     *        required: true
     *        type: integer
     *        description: The ID of Landlord
     *      - in: path
     *        name: page
     *        required: true
     *        type: integer
     *        description: Page Number
     *      - in: path
     *        name: size
     *        required: true
     *        type: integer
     *        description: Size of data
     *    responses:
     *      '200':
     *        description: A successful response
     */
    props.get("/v1/property/landlord/:id/:page/:size", authenticateToken, properties.getLandlordProperties)

    //Get Landlord properties specific for dealer
    /**
     * @swagger
     * /v1/property/landlord/fordealer/{id}/{page}/{size}:
     *  get:
     *    tags:
     *      - properties
     *    security:
     *      - Bearer: []
     *    description: Get List of all the properties for a landlord based on Landlord ID
     *    parameters:
     *      - in: path
     *        name: id
     *        required: true
     *        type: integer
     *        description: The ID of Landlord
     *      - in: path
     *        name: page
     *        required: true
     *        type: integer
     *        description: Page Number
     *      - in: path
     *        name: size
     *        required: true
     *        type: integer
     *        description: Size of data
     *    responses:
     *      '200':
     *        description: A successful response
     */
    props.get("/v1/property/landlord/fordealer/:id/:page/:size", authenticateToken, properties.getLandlordPropertiesForSpecificDealer)

    //Get Properties of Dealers
    /**
     * @swagger
     * /v1/property/dealer/{id}/{page}/{size}:
     *  get:
     *    tags:
     *      - properties
     *    security:
     *      - Bearer: []
     *    description: Get List of all the properties for a Dealer based on dealer ID
     *    parameters:
     *      - in: path
     *        name: id
     *        required: true
     *        type: integer
     *        description: The ID of Dealer
     *      - in: path
     *        name: page
     *        required: true
     *        type: integer
     *        description: Page Number
     *      - in: path
     *        name: size
     *        required: true
     *        type: integer
     *        description: Size of data
     *    responses:
     *      '200':
     *        description: A successful response
     */
    props.get("/v1/property/dealer/:id/:page/:size", authenticateToken, properties.getDealerProperties)

    // link dealer to a specific Property 


    props.post("/v1/property/addDealerToProperty", authenticateToken, properties.addDealerToProperty);

    // Get list of Dealer of a specific landlord (Dealers managing landlord properties) 
    /**
     * @swagger
     * /v1/property/getLandlordOfDealer:
     *  get:
     *    tags:
     *      - properties
     *    security:
     *      - Bearer: []
     *    description: List of Landlords based on Dealer attached to their properties
     *    responses:
     *      '200':
     *        description: A successful response
     */
    props.get("/v1/property/getLandlordOfDealer", authenticateToken, properties.getLandlordOfDealer)

    // Get list of Dealer of a specific landlord (Dealers managing landlord properties)
    // Get list of Dealer of a specific landlord (Dealers managing landlord properties) 
    /**
     * @swagger
     * /v1/property/getDealerOfLandlord:
     *  get:
     *    tags:
     *      - landlord
     *    security:
     *      - Bearer: []
     *    description: List of Dealers who are Managing a Landlord Properties
     *    responses:
     *      '200':
     *        description: A successful response
     */
    props.get("/v1/property/getDealerOfLandlord", authenticateToken, properties.getDealerOfLandlord)

    // Remove Dealer From Specific Property 
    /**
 * @swagger
 * /v1/property/removeDealerFromProperty/{propertyid}:
 *  put:
 *    tags:
 *      - properties
 *    security:
 *      - Bearer: []
 *    description: Remove Dealer from a Property Based on Property Id
 *    parameters:
 *      - in: path
 *        name: propertyid
 *        required: true
 *        type: string
 *        description: The ID of Property
 *    responses:
 *      '200':
 *        description: A successful response
 */
    props.put("/v1/property/removeDealerFromProperty/:propertyid", authenticateToken, properties.removeDealerFromProperty)

    // Get Property Information
    /**
    * @swagger
    * /v1/property/getPropertyInformation/{id}:
    *  get:
    *    tags:
    *      - properties
    *    security:
    *      - Bearer: []
    *    description: Use to Get A Specific Property Information Based On Property ID
    *    parameters:
    *      - in: path
    *        name: id
    *        required: true
    *        type: string
    *        description: The ID of Property
    *    responses:
    *      '200':
    *        description: A successful response
    */
    props.get("/v1/property/getPropertyInformation/:id", authenticateToken, properties.getPropertyInformation)

    // Get Manager who is near to a property
    /**
    * @swagger
    * /v1/property/getManagerPropertiesList:
    *  get:
    *    tags:
    *      - manager
    *    security:
    *      - Bearer: []
    *    description: Use to Get A Specific Manager who is Near to Property
    *    responses:
    *      '200':
    *        description: A successful response
    */
    props.get("/v1/property/getManagerPropertiesList", authenticateToken, properties.getManagerPropertiesList);

    // Get Manager who is near to a property
    /**
    * @swagger
    * /v1/property/getNearestManagertoProperty/{propertyid}:
    *  get:
    *    tags:
    *      - properties
    *    security:
    *      - Bearer: []
    *    description: Use to Get A Specific Manager who is Near to Property
    *    parameters:
    *      - in: path
    *        name: propertyid
    *        required: true
    *        type: string
    *        description: The ID of Property
    *    responses:
    *      '200':
    *        description: A successful response
    */
    props.get("/v1/property/getNearestManagertoProperty/:propertyid", authenticateToken, properties.getNearestManager);

    // Update Property Information
    /**
     * @swagger
     * /v1/property/updatePropertyInformation:
     *    put:
     *      tags:
     *         - landlord
     *      security:
     *         - Bearer: []
     *      description: Update Property Information
     *      responses:
     *         '200':
     *            description: A successful response
     *    consumes:
     *      - application/json
     *    parameters:
     *      - name: Update Property Information
     *        in: body
     *        description: Update Information of existing property.
     *        required: true
     *        schema:
     *          type: object
     *          properties:
     *             title:
     *               type: string
     *               example: Amazing 3 bedroom home near Bahria
     *             ipaddress:
     *               type: string
     *               example: 192.155.78.56
     *             storageid:
     *               type: string
     *               example: ASHFGF65FG6
     *             size:
     *               type: string
     *               example: 13250
     *             bedrooms:
     *               type: string
     *               example: 3
     *             bathrooms:
     *               type: string
     *               example: 5
     *             type:
     *               type: string
     *               enum: [commercial, appartment, house, shop, office]
     *               example: commercial
     *             description:
     *               type: string
     *               example: This is a beautiful Property
     *             location:
     *               type: object
     *               items: {
     *                      "latitude": 37.3043,
     *                      "longitude": 34.5012
     *                       }
     *               example:
     *                  "latitude": 37.3043
     *                  "longitude": 34.5012
     *             address:
     *               type: object
     *               items: {
     *                      "city": "islamabad",
     *                      "country": "pakistan",
     *                      "street": "Street 1 , I-14",
     *                      "house": "101A",
     *                      "postal code": "44000"
     *                       }
     *               example:
     *                  "city": "islamabad"
     *                  "country": "pakistan"
     *                  "street": "Street 1 , I-14"
     *                  "house": "101A"
     *                  "postal code": "44000"
     *             rental:
     *               type: string
     *               example: PKR 10,500
     *             dealer:
     *               type: string
     *               example: not Available
     *             dealername:
     *               type: string
     *               example: not Available
     *             tenant:
     *               type: string
     *               example: not Available
     *             tenantname:
     *               type: string
     *               example: not Available
     *             status:
     *               type: string
     *               enum: [available, leased, not available]
     *               example: available
     *             photos:
     *               type: array
     *               items: {}
     *               example:
     *                 - my-base64-string
     *                 - my-another-base64-string              
     */
    props.put("/v1/property/updatePropertyInformation", authenticateToken, properties.updatePropertyInformation)

    // Update Property Status
    /**
  * @swagger
  * /v1/property/updatePropertyStatus:
  *    put:
  *      tags:
  *          - properties
  *      description: Use to Update Property Status
  *      responses:
  *         '200':
  *            description: A successful response
  *    consumes:
  *      - application/json
  *    parameters:
  *      - name: Property Status
  *        in: body
  *        description: Property Id And Status
  *        required: true
  *        schema:
  *          type: object
  *          properties:
  *             propertyid:
  *               type: string
  *               example: A3SDFGS68g
  *             status:
  *               type: string
  *               enum: [available, not available]
  *               example: available
  *                
  */
    props.put("/v1/property/updatePropertyStatus", authenticateToken, properties.updatePropertyStatus)

    // Delete Property 
    /**
    * @swagger
    * /v1/property/deleteProperty/{id}:
    *  delete:
    *    tags:
    *      - landlord
    *    security:
    *      - Bearer: []
    *    description: Use to Delete a Specific Property and its related Data Based On Property ID
    *    parameters:
    *      - in: path
    *        name: id
    *        required: true
    *        type: string
    *        description: The ID of Property
    *    responses:
    *      '200':
    *        description: A successful response
    */
    props.delete("/v1/property/deleteProperty/:id", authenticateToken, properties.deleteProperty)

    // Get Properties by location
    /**
* @swagger
* /v1/property/nearestProperties/{latitude}/{longitude}/{distance}:
*  get:
*    tags:
*      - properties
*    security:
*      - Bearer: []
*    description: Use to Search all Properties near to Specific Location based on Distance
*    parameters:
*      - in: path
*        name: latitude
*        required: true
*        type: string
*        description: The latitude of a location
*      - in: path
*        name: longitude
*        required: true
*        type: string
*        description: The longitude of a location
*      - in: path
*        name: distance
*        required: true
*        type: string
*        description: The distance(meters) for radius
*    responses:
*      '200':
*        description: A successful response
*/
    props.get("/v1/property/nearestProperties/:latitude/:longitude/:distance", authenticateToken, properties.getAllPropertiesByLocation)

    //Get properties by city
    /**
* @swagger
* /v1/property/city/{city}/{page}/{size}:
*  get:
*    tags:
*      - properties
*    security:
*      - Bearer: []
*    description: Use to Search all Properties near to Specific Location based on Distance
*    parameters:
*      - in: path
*        name: city
*        required: true
*        type: string
*        description: Name of City
*      - in: path
*        name: page
*        required: true
*        type: string
*        description: Page Number
*      - in: path
*        name: size
*        required: true
*        type: string
*        description: Total Number of Records to return
*    responses:
*      '200':
*        description: A successful response
*/
    props.get("/v1/property/city/:city/:page/:size", authenticateToken, properties.getAllPropertiesByCity)

    //Get All Available Properties by interest
    /**
* @swagger
* /v1/property/available/{page}/{size}:
*  get:
*    tags:
*      - properties
*    security:
*      - Bearer: []
*    description: Use to Search all Available Properties Based on Interest of User
*    responses:
*      '200':
*        description: A successful response
*    consumes:
*      - application/json
*    parameters:
*      - in: path
*        name: page
*        required: true
*        type: string
*        description: Page Number
*      - in: path
*        name: size
*        required: true
*        type: string
*        description: Total Number of Records to return
*      - name: userinformation
*        in: body
*        description: Information that has to be update.
*        required: true
*        schema:
*          type: object
*          properties:
*             type:
*              type: string
*              example: office
*             bedrooms:
*               type: integer
*               example: 4
*             bathrooms:
*              type: integer
*              example: 7
*             city:
*               type: string
*               example: islamabad
*             rental:
*               type: array
*               items: {}
*               example:
*                  - 7000
*                  - 9000
*/


    props.post("/v1/property/search/properties/:page/:size", authenticateToken, properties.getAllAvailablePropertiesByInterest)


    // Request Related Routes

    // Get My Requests (Landlord) (status : active for requests which are not responded by
    // landlord else it will return accepted,rejected or any other request)
    /**
* @swagger
* /v1/property/getMyRequestsManager/{status}:
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
*        enum: [active,accepted,rejected]
*        description: Request Status whether it is active or accepted or rejected
*    responses:
*      '200':
*        description: A successful response
*/
    props.get("/v1/property/getMyRequestsManager/:status", authenticateToken, properties.getMyRequestsManagers)


    // Get My Requests (Landlord) (status : active for requests which are not responded by
    // landlord else it will return accepted,rejected or any other request)
    /**
* @swagger
* /v1/property/getMyRequestsLandlord/{status}:
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
*        enum: [active,accepted,rejected]
*        description: Request Status whether it is active or accepted or rejected
*    responses:
*      '200':
*        description: A successful response
*/
    props.get("/v1/property/getMyRequestsLandlord/:status", authenticateToken, properties.getMyRequestsLandlord)

    // Get My Requests (Tenant) (status : active for requests which are not responded by
    // landlord else it will return accepted,rejected or any other request)
    /**
* @swagger
* /v1/property/getMyRequestsTenant/{status}:
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
*        enum: [active,accepted,rejected]
*        description: Request Status whether it is active or accepted or rejected
*    responses:
*      '200':
*        description: A successful response
*/
    props.get("/v1/property/getMyRequestsTenant/:status", authenticateToken, properties.getMyRequestsTenant)

    // Get Dealer Requests
    /**
* @swagger
* /v1/property/getMyRequestsDealer/{status}:
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
*        enum: [active,accepted,rejected]
*        description: Request Status whether it is active or accepted or rejected
*    responses:
*      '200':
*        description: A successful response
*/
    props.get("/v1/property/getMyRequestsDealer/:status", authenticateToken, properties.getMyRequestsDealer)


    // Generate Request for Property
    /** 
    * @swagger
    * /v1/property/generateRequest:
    *  post:
    *    tags:
    *      - tenant
    *    security:
    *      - Bearer: []
    *    description: Use to Search all Available Properties Based on Interest of User
    *    responses:
    *      '200':
    *        description: A successful response
    *    consumes:
    *      - application/json
    *    parameters:
    *      - name: Request
    *        in: body
    *        description: Request Information
    *        required: true
    *        schema:
    *          type: object
    *          properties:
    *             propertyid:
    *              type: string
    *              example: AFG45Hj6G7k
    *             ipaddress:
    *               type: string
    *               example: 192.168.1.1
    *             description:
    *              type: string
    *              example: "Any thing"
    *             requesttype:
    *               type: string
    *               enum: [leased]
    *               example: 
    *                 leased
    */
    props.post("/v1/property/generateRequest", authenticateToken, properties.generateRequestForProperty)

    // Response of Request for Property
    /** 
    * @swagger
    * /v1/property/requestResponse:
    *  post:
    *    tags:
    *      - landlord
    *    security:
    *      - Bearer: []
    *    description: Use to Search all Available Properties Based on Interest of User
    *    responses:
    *      '200':
    *        description: A successful response
    *    consumes:
    *      - application/json
    *    parameters:
    *      - name: Request
    *        in: body
    *        description: Request Information
    *        required: true
    *        schema:
    *          type: object
    *          properties:
    *             requestid:
    *              type: string
    *              example: AFG45Hj6G7k
    *             ipaddress:
    *               type: string
    *               example: 192.168.1.1
    *             remarks:
    *              type: string
    *              example: "Congrates, i agree lets meet to dicuss details"
    *             requeststatus:
    *               type: string
    *               enum: [accepted,rejected]
    *               example: 
    *                    accepted
    */
    props.post("/v1/property/requestResponse", authenticateToken, properties.requestResponse)

    // Forward Request to landlord by dealer
    /** 
* @swagger
* /v1/property/forwardPropertyRequest/{requestid}:
*  post:
*    tags:
*      - properties
*    security:
*      - Bearer: []
*    description: Dealer can forward request to Landlord
*    responses:
*      '200':
*        description: A successful response
*    consumes:
*      - application/json
*    parameters:
*      - in: path
*        name: requestid
*        required: true
*        type: string
*        description: Id of Request
*/
    props.post("/v1/property/forwardPropertyRequest/:requestid", authenticateToken, properties.forwardRequestDealer)
}