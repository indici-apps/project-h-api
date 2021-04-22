module.exports = inspect => {
    const inspections = require('../controllers/inspections.controller.js');
    const { authenticateToken } = require("../auth/TokenAuth")

      /**
     * @swagger
     * /v1/inspection/create:
     *    post:
     *      tags:
     *         - inspections
     *      security:
     *         - Bearer: []
     *      description: Add new Inspection of a Specific Property
     *      responses:
     *         '200':
     *            description: A successful response
     *    consumes:
     *      - application/json
     *    parameters:
     *      - name: Inspection Creation
     *        in: body
     *        description: Addition of new Inspection for a property
     *        required: true
     *        schema:
     *          type: object
     *          properties:
     *             propertyid:
     *              type: string
     *              example: KG4HL7fF2
     *             ipaddress:
     *               type: string
     *               example: 192.156.7.6
     *             assignto:
     *              type: string
     *              example: Ab4Hs7fF9
     *             description:
     *               type: string
     *               example: check condition of house
     *             inspectionstatus:
     *               type: string
     *               example: active
     *             inspectiontype:
     *               type: string
     *               enum: [routine, request]
     *               example: routine     
     */
    inspect.post("/v1/inspection/create", authenticateToken, inspections.createInspection)
            /**
     * @swagger
     * /v1/inspection/create/sub:
     *    post:
     *      tags:
     *         - inspections
     *      security:
     *         - Bearer: []
     *      description: Add new Sub Inspection of an Inspections
     *      responses:
     *         '200':
     *            description: A successful response
     *    consumes:
     *      - application/json
     *    parameters:
     *      - name: Sub-Inspection Creation
     *        in: body
     *        description: Addition of new Sub Inspection for a property
     *        required: true
     *        schema:
     *          type: object
     *          properties:
     *             inspectionid:
     *              type: string
     *              example: KG4HL7fF2
     *             storageid:
     *              type: string
     *              example: KG8787HHHL7fF2
     *             ipaddress:
     *               type: string
     *               example: 192.156.7.6
     *             areatype:
     *              type: string
     *              example: Kitchen
     *             conditions:
     *               type: string
     *               example: Good
     *             observation:
     *               type: string
     *               example: Good
     *             action:
     *               type: string
     *               example: no action required    
     *             photos:
     *               type: array
     *               item: {}
     *               example: 
     *                  - Some Base64 Encoded Image
     *                  - Another Base64 Encoded Image 
     */
    inspect.post("/v1/inspection/create/sub", authenticateToken, inspections.addSubInspection)

    // get sub inspection by id
        /**
     * @swagger
     * /v1/inspection/property/getSubInspectionByID/{id}:
     *  get:
     *    tags:
     *      - inspections
     *    security:
     *      - Bearer: []
     *    description: Get a specific Sub-Inspections by Id
     *    parameters:
     *      - in: path
     *        name: id
     *        required: true
     *        type: string
     *        description: Id of Inspection 
     *    responses:
     *      '200':
     *        description: A successful response
     */
    inspect.get("/v1/inspection/property/getSubInspectionByID/:id", authenticateToken, inspections.getSubInspecByID)
    // status : active or done
            /**
     * @swagger
     * /v1/inspection/property/specific/{id}/{status}:
     *  get:
     *    tags:
     *      - inspections
     *    security:
     *      - Bearer: []
     *    description: Get List of all Inspections of a specific property
     *    parameters:
     *      - in: path
     *        name: id
     *        required: true
     *        type: string
     *        description: Id of Property 
     *      - in: path
     *        name: status
     *        required: true
     *        type: string
     *        enum: [active,done]
     *        description: Status Of Inspections Active or Done
     *    responses:
     *      '200':
     *        description: A successful response
     */
    inspect.get("/v1/inspection/property/specific/:id/:status", authenticateToken, inspections.getPropertyInspections)
    // status : active or done
    /**
     * @swagger
     * /v1/inspection/getAllInspectionsOfLandlord/{userid}/{status}:
     *  get:
     *    tags:
     *      - inspections
     *    security:
     *      - Bearer: []
     *    description: Get List of all Inspections of a specific Landlord
     *    parameters:
     *      - in: path
     *        name: userid
     *        required: true
     *        type: string
     *        description: Id of Landlord 
     *      - in: path
     *        name: status
     *        required: true
     *        type: string
     *        enum: [active,done]
     *        description: Status Of Inspections Active or Done
     *    responses:
     *      '200':
     *        description: A successful response
     */
    inspect.get("/v1/inspection/getAllInspectionsOfLandlord/:userid/:status", authenticateToken, inspections.getAllInspectionsOfLandlord)
    // status : active or done
    /**
     * @swagger
     * /v1/inspection/getAllInspectionsOfDealer/{userid}/{status}:
     *  get:
     *    tags:
     *      - inspections
     *    security:
     *      - Bearer: []
     *    description: Get List of all Inspections of a specific Dealer
     *    parameters:
     *      - in: path
     *        name: userid
     *        required: true
     *        type: string
     *        description: Id of Dealer 
     *      - in: path
     *        name: status
     *        required: true
     *        type: string
     *        enum: [active,done]
     *        description: Status Of Inspections
     *    responses:
     *      '200':
     *        description: A successful response
     */
    inspect.get("/v1/inspection/getAllInspectionsOfDealer/:userid/:status", authenticateToken, inspections.getAllInspectionsOfDealer)
    
    /**
     * @swagger
     * /v1/inspection/property/sub/{id}:
     *  get:
     *    tags:
     *      - inspections
     *    security:
     *      - Bearer: []
     *    description: Get List of all Sub Inspections for a specific Inspections
     *    parameters:
     *      - in: path
     *        name: id
     *        required: true
     *        type: string
     *        description: Id of Inspections 
     *    responses:
     *      '200':
     *        description: A successful response
     */
    inspect.get("/v1/inspection/property/sub/:id", authenticateToken, inspections.getSubInspecProperties)
    
    // status : active or done
    /**
     * @swagger
     * /v1/inspection/getPersonalInspections/{status}:
     *  get:
     *    tags:
     *      - inspections
     *    security:
     *      - Bearer: []
     *    description: Get List of all Inspections of a specific User
     *    parameters:
     *      - in: path
     *        name: status
     *        required: true
     *        type: string
     *        enum: [active,done]
     *        description: Status Of Inspections
     *    responses:
     *      '200':
     *        description: A successful response
     */
    inspect.get("/v1/inspection/getPersonalInspections/:status", authenticateToken, inspections.getPersonalInspection)
    // Get Maagers Job List
    /**
     * @swagger
     * /v1/inspection/getManagerJobs/{userid}/{status}:
     *  get:
     *    tags:
     *      - inspections
     *    security:
     *      - Bearer: []
     *    description: Get List of Jobs Assigned to Manager
     *    parameters:
     *      - in: path
     *        name: userid
     *        required: true
     *        type: string
     *        description: Id of Manager 
     *      - in: path
     *        name: status
     *        required: true
     *        type: string
     *        enum: [active,done]
     *        description: Status Of Inspections
     *    responses:
     *      '200':
     *        description: A successful response
     */
    inspect.get("/v1/inspection/getManagerJobs/:userid/:status", authenticateToken, inspections.getJobAssignManager)
    // Update Inspection Status
    /**
     * @swagger
     * /v1/inspection/updatestatus/{inspecid}/{status}:
     *  put:
     *    tags:
     *      - inspections
     *    security:
     *      - Bearer: []
     *    description: Get List of Jobs Assigned to Manager
     *    parameters:
     *      - in: path
     *        name: inspecid
     *        required: true
     *        type: string
     *        description: Id of Inspection 
     *      - in: path
     *        name: status
     *        required: true
     *        type: string
     *        enum: [active,done]
     *        description: Status Of Inspections
     *    responses:
     *      '200':
     *        description: A successful response
     */
    inspect.put("/v1/inspection/updatestatus/:inspecid/:status", authenticateToken, inspections.updateInspectionStatus)

}