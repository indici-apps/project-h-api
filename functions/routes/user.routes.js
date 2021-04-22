const { app, auth } = require('firebase-admin');
const TokenAuth = require('../auth/TokenAuth');
const { addSubInspection } = require('../controllers/inspections.controller.js');
module.exports = app => {
  const users = require('../controllers/users.controller.js');
  const { authenticateToken } = require("../auth/TokenAuth")

  app.get("/v1/hi", authenticateToken, users.hellotesting)

  /**
   * @swagger
   * /v1/login:
   *    post:
   *      tags:
   *          - users
   *      description: Use to return all customers
   *      responses:
   *         '200':
   *          description: A successful response
   *         '401':
   *          description: Invalid user or password
   *    consumes:
   *      - application/json
   *    parameters:
   *      - name: login
   *        in: body
   *        description: Login of user
   *        required: true
   *        schema:
   *          type: object
   *          properties:
   *              email:
   *                type: string
   *              password:
   *                type: string
   *              ipaddress:
   *                type: string
   */
  app.post("/v1/login", users.clientLogin)

  // Create User
  /**
   * @swagger
   * /v1/register:
   *    post:
   *      tags:
   *          - users
   *      description: Use to Register a New User
   *      responses:
   *         '200':
   *            description: A successful response
   *         '409':
   *            description: Duplicate Data
   *    consumes:
   *      - application/json
   *    parameters:
   *      - name: Registration
   *        in: body
   *        description: Registration of new user.
   *        required: true
   *        schema:
   *          type: object
   *          properties:
   *             username:
   *              type: string
   *              example: Haseeb Ahmed Khan
   *             email:
   *               type: string
   *               example: hahmed412@gmail.com
   *             phone:
   *              type: string
   *              example: "+923236116360"
   *             password:
   *               type: string
   *               example: mypassword
   *             type:
   *               type: string
   *               enum: [landlord, dealer, tenant, manager]
   *               example: landlord
   *             userstatus:
   *               type: string
   *               enum: [active, inactive, suspended]
   *               example: active
   *             ipaddress:
   *               type: string
   *               example: 192.168.1.1
   *             storageid:
   *               type: string
   *               example: A5CF5BD4
   *             photos:
   *               type: array
   *               items: {}
   *               example:
   *                 - my-image-base-64-encoded-string
   *                 - another-my-image-base-64-encoded-string
   *             cnic:
   *               type: array
   *               items: {}
   *               example:
   *                 - my-base64-string
   *                 - my-another-base64-string 
   *             officeaddress:
   *               type: object
   *               items: {
   *                "city": "islamabad",
   *                 "country": "pakistan",
   *                 "street": "Street 1 , I-14",
   *                 "house": "101A",
   *                 "postal code": "44000"
   *                }
   *               example:
   *                 "city": "islamabad"
   *                 "country": "pakistan"
   *                 "street": "Street 1 , I-14"
   *                 "house": "101A"
   *                 "postal code": "44000"
   *             workinghours:
   *               type: object
   *               items: {
   *                 "timing": "9am-6pm",
   *                 "daysoff": "Saturday-Sunday"
   *                }
   *               example:
   *                 "timing": "9am-6pm"
   *                 "daysoff": "Saturday-Sunday"
   *                
   */
  app.post("/v1/register", users.clientRegistration)


  //List All Dealers
  /**
  * @swagger
  * /v1/list/landlords/{page}/{size}:
  *  get:
  *    tags:
  *      - users
  *    security:
  *      - Bearer: []
  *    description: Get List of all the registered Landlords. Used for Landlords searcing
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
  *      '401':
  *        description: Forbidden
  */
  app.get("/v1/list/landlords/:page/:size", authenticateToken, users.getAllLandlord)

  //List All Dealers
  /**
  * @swagger
  * /v1/list/dealers/{page}/{size}:
  *  get:
  *    tags:
  *      - users
  *    security:
  *      - Bearer: []
  *    description: Get List of all the registered Dealers. Used for Dealer searcing and Adding
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
  app.get("/v1/list/dealers/:page/:size", authenticateToken, users.getAllDealers)

  //Get User Profile
  /**
  * @swagger
  * /v1/user/profile/{id}:
  *  get:
  *    tags:
  *      - users
  *    security:
  *      - Bearer: []
  *    description: Get User Profile
  *    parameters:
  *      - in: path
  *        name: id
  *        required: true
  *        type: string
  *        description: The ID of User
  *    responses:
  *      '200':
  *        description: A successful response
  */
  app.get("/v1/user/profile/:id", authenticateToken, users.getUserProfile)

  // Get Manager Location
    /**
  * @swagger
  * /v1/user/getManagerLocation/{Managerid}:
  *  get:
  *    tags:
  *      - manager
  *    security:
  *      - Bearer: []
  *    description: Get Manager Location
  *    parameters:
  *      - in: path
  *        name: id
  *        required: true
  *        type: string
  *        description: The ID of Manager
  *    responses:
  *      '200':
  *        description: A successful response
  *      '401':
  *        description: Forbidden
  */
  app.get("/v1/user/getManagerLocation/:Managerid", authenticateToken, users.getManagerLocation)
  
  // Get List of managers for a dealer
      /**
  * @swagger
  * /v1/user/getManagersOfDealer:
  *  get:
  *    tags:
  *      - manager
  *    security:
  *      - Bearer: []
  *    description: Get List of Managers working for Dealer
  *    responses:
  *      '200':
  *        description: A successful response
  *      '401':
  *        description: Forbidden
  */
  app.get("/v1/user/getManagersOfDealer", authenticateToken, users.getManagersOfDealer)

  // Manager Registration
    /**
   * @swagger
   * /v1/registerManager:
   *    post:
   *      tags:
   *          - manager
   *      description: Use to Register Manager
   *      responses:
   *         '200':
   *            description: A successful response
   *         '409':
   *            description: Duplicate Data
   *    consumes:
   *      - application/json
   *    parameters:
   *      - name: Registration
   *        in: body
   *        description: Registration of new Manager.
   *        required: true
   *        schema:
   *          type: object
   *          properties:
   *             username:
   *              type: string
   *              example: Muhammad Umer
   *             email:
   *               type: string
   *               example: muhammadumer@gmail.com
   *             phone:
   *              type: string
   *              example: "+923311208060"
   *             password:
   *               type: string
   *               example: mypassword
   *             type:
   *               type: string
   *               example: manager
   *             userstatus:
   *               type: string
   *               enum: [active, inactive, suspended]
   *               example: active
   *             ipaddress:
   *               type: string
   *               example: 192.168.1.1
   *             storageid:
   *               type: string
   *               example: A5CF5BD4
   *             photos:
   *               type: array
   *               items: {}
   *               example:
   *                 - my-image-base-64-encoded-string
   *                 - another-my-image-base-64-encoded-string
   *             cnic:
   *               type: array
   *               items: {}
   *               example:
   *                 - my-base64-string
   *                 - my-another-base64-string 
   *             officeaddress:
   *               type: object
   *               items: {
   *                "city": "islamabad",
   *                 "country": "pakistan",
   *                 "street": "Street 1 , I-14",
   *                 "house": "101A",
   *                 "postal code": "44000"
   *                }
   *               example:
   *                 "city": "islamabad"
   *                 "country": "pakistan"
   *                 "street": "Street 1 , I-14"
   *                 "house": "101A"
   *                 "postal code": "44000"
   *             workinghours:
   *               type: object
   *               items: {
   *                 "timing": "9am-6pm",
   *                 "daysoff": "Saturday-Sunday"
   *                }
   *               example:
   *                 "timing": "9am-6pm"
   *                 "daysoff": "Saturday-Sunday"
   *                
   */
  app.post("/v1/registerManager", authenticateToken, users.managerRegistration)

  // Update User Status
      /**
  * @swagger
  * /v1/user/updateUserStatus/{id}/{status}:
  *  put:
  *    tags:
  *      - users
  *    security:
  *      - Bearer: []
  *    description: Update Status of User
  *    parameters:
  *      - in: path
  *        name: id
  *        required: true
  *        type: string
  *        description: The ID of User
  *      - in: path
  *        name: status
  *        required: true
  *        type: string
  *        enum: [active, inactive, suspended]
  *        description: Status for User
  *    responses:
  *      '200':
  *        description: A successful response
  *      '401':
  *        description: Forbidden
  */
  app.put("/v1/user/updateUserStatus/:id/:status", authenticateToken, users.updateUserStatus)

  // Update User Information
    /**
   * @swagger
   * /v1/user/updateUserInformation:
   *    put:
   *      tags:
   *          - users
   *      description: Use to Update User Information
   *      responses:
   *         '200':
   *            description: A successful response
   *         '409':
   *            description: Duplicate Data
   *    consumes:
   *      - application/json
   *    parameters:
   *      - name: userinformation
   *        in: body
   *        description: Information that has to be update.
   *        required: true
   *        schema:
   *          type: object
   *          properties:
   *             username:
   *              type: string
   *              example: Ahmed Aziz
   *             email:
   *               type: string
   *               example: hahmed412@gmail.com
   *             phone:
   *              type: string
   *              example: "+923237116360"
   *             password:
   *               type: string
   *               example: mypassword
   *             userstatus:
   *               type: string
   *               enum: [active, inactive, suspended]
   *               example: active
   *             ipaddress:
   *               type: string
   *               example: 192.168.1.1
   *             storageid:
   *               type: string
   *               example: A5CF5BD4
   *             photos:
   *               type: array
   *               items: {}
   *               example:
   *                 - my-image-base-64-encoded-string
   *                 - another-my-image-base-64-encoded-string
   *             cnic:
   *               type: array
   *               items: {}
   *               example:
   *                 - my-base64-string
   *                 - my-another-base64-string 
   *             officeaddress:
   *               type: object
   *               items: {
   *                "city": "islamabad",
   *                 "country": "pakistan",
   *                 "street": "Street 1 , I-14",
   *                 "house": "101A",
   *                 "postal code": "44000"
   *                }
   *               example:
   *                 "city": "islamabad"
   *                 "country": "pakistan"
   *                 "street": "Street 1 , I-14"
   *                 "house": "101A"
   *                 "postal code": "44000"
   *             workinghours:
   *               type: object
   *               items: {
   *                 "timing": "9am-6pm",
   *                 "daysoff": "Saturday-Sunday"
   *                }
   *               example:
   *                 "timing": "9am-6pm"
   *                 "daysoff": "Saturday-Sunday"
   *                
   */
  app.put("/v1/user/updateUserInformation", authenticateToken, users.updateUserInformation)

  // Update User Information
  //  app.put("/v1/user/deleteToken/:id", authenticateToken,users.deleteToken)

  // Generate Refresh Token on Call
     /**
   * @swagger
   * /v1/user/generateRefreshToken:
   *    post:
   *      tags:
   *          - users
   *      description: Use to Update User Information
   *      responses:
   *         '200':
   *            description: A successful response
   *         '409':
   *            description: Duplicate Data
   *    consumes:
   *      - application/json
   *    parameters:
   *      - name: Access Token
   *        in: body
   *        description: Information that has to be update.
   *        required: true
   *        schema:
   *          type: object
   *          properties:
   *             token:
   *               type: string
   *               example:
   *                 "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOiIySlc2T0lEaGJVS0tPWjhzTGF5OCIsInVzZXJ0eXBlIjoiZGVhbGVyIiwidXNlcm5hbWUiOiJVbWVyIFN3YXRpIiwidXNlcnBob25lIjoiKzkyMzMxMTIwODA2MCIsImlhdCI6MTYwNjM0MjY4OX0.Rpc5yQ5R9B5f8P-DjG52GgDgQIDJ4pWKBj3hfE7nbLo"
   *                
   */
  app.post("/v1/user/generateRefreshToken", authenticateToken, users.generateRefreshToken)

  //Uploading files-- any type
  app.post("/v1/images/upload", authenticateToken, users.uploadfiles)

  // Login History of current user
  app.get("/v1/user/getLoginHistory", authenticateToken, users.getLoginHistory)

  // Login History of current user
  app.post("/v1/user/sendmail", users.sendNormalMail)

  // Login History of current user

  app.post("/v1/user/forgetPassword", users.forgetpassword)

  // to send code on email to reset password 
   /**
   * @swagger
   * /v1/user/resetPasswordViaEmail:
   *    post:
   *      tags:
   *          - reset password
   *      description: Use to Reset Password of User through Email
   *      responses:
   *         '200':
   *            description: A successful response
   *         '409':
   *            description: Duplicate Data
   *    consumes:
   *      - application/json
   *    parameters:
   *      - name: Email
   *        in: body
   *        description: Reset Password through Email
   *        required: true
   *        schema:
   *          type: object
   *          properties:
   *             email:
   *               type: string
   *               example: hahmed412@gmail.com
   *                
   */
  app.post("/v1/user/resetPasswordViaEmail", users.resetpasswordemail)

  // to send code on phone to reset password 
   /**
   * @swagger
   * /v1/user/resetPasswordViaPhone:
   *    post:
   *      tags:
   *          - reset password
   *      description: Use to Reset Password of User through Phone
   *      responses:
   *         '200':
   *            description: A successful response
   *         '409':
   *            description: Duplicate Data
   *    consumes:
   *      - application/json
   *    parameters:
   *      - name: Email
   *        in: body
   *        description: Send Text to Phone attached to Email
   *        required: true
   *        schema:
   *          type: object
   *          properties:
   *             email:
   *               type: string
   *               example: hahmed412@gmail.com
   *                
   */
  app.post("/v1/user/resetPasswordViaPhone", users.resetpasswordphone)

  // to reset code password verification token
   /**
   * @swagger
   * /v1/user/resetPasswordWithToken:
   *    post:
   *      tags:
   *          - reset password
   *      description: Use to Reset Password of User by Providing authenticated Token
   *      responses:
   *         '200':
   *            description: A successful response
   *         '409':
   *            description: Duplicate Data
   *    consumes:
   *      - application/json
   *    parameters:
   *      - name: Password Reset
   *        in: body
   *        description: Token and New password of user
   *        required: true
   *        schema:
   *          type: object
   *          properties:
   *             newpassword:
   *               type: string
   *               example: somepassword
   *             token:
   *               type: string
   *               example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyZW1haWwiOiJtdWhhbW1hZHVtZXJzd2F0aUBnbWFpbC5jb2
   *                
   */
  app.post("/v1/user/resetPasswordWithToken", users.resetPasswordWithToken)

  // to verify code and send temporary access token
   /**
   * @swagger
   * /v1/user/resetPasswordVerifyCode:
   *    post:
   *      tags:
   *          - reset password
   *      description: Use to Verify Email and Code send on Phone to reset Password
   *      responses:
   *         '200':
   *            description: A successful response
   *         '409':
   *            description: Duplicate Data
   *    consumes:
   *      - application/json
   *    parameters:
   *      - name: User Verification Information
   *        in: body
   *        description: Email and Code for user verification for changing password
   *        required: true
   *        schema:
   *          type: object
   *          properties:
   *             email:
   *               type: string
   *               example: hahmed412@gmail.com
   *             code:
   *               type: string
   *               example: 456765
   *                
   */
  app.post("/v1/user/resetPasswordVerifyCode", users.resetpasswordverifycode)

  //to verify email with code
   /**
   * @swagger
   * /v1/user/verifyEmail:
   *    post:
   *      tags:
   *          - verification
   *      description: Use to Verify Email Address of new User
   *      responses:
   *         '200':
   *            description: A successful response
   *         '409':
   *            description: Duplicate Data
   *    consumes:
   *      - application/json
   *    parameters:
   *      - name: Email Verification
   *        in: body
   *        description: Email and Code sent on email
   *        required: true
   *        schema:
   *          type: object
   *          properties:
   *             email:
   *               type: string
   *               example: hahmed412@gmail.com
   *             code:
   *               type: string
   *               example: 476567
   *                
   */
  app.post("/v1/user/verifyEmail", users.emailVerificationCode)

  //to verify phone with code
   /**
   * @swagger
   * /v1/user/verifyPhone:
   *    post:
   *      tags:
   *          - verification
   *      description: Use to Verify Phone Number of new User
   *      responses:
   *         '200':
   *            description: A successful response
   *         '409':
   *            description: Duplicate Data
   *    consumes:
   *      - application/json
   *    parameters:
   *      - name: Phone Verification
   *        in: body
   *        description: Phone Number and Code sent on phone
   *        required: true
   *        schema:
   *          type: object
   *          properties:
   *             phone:
   *               type: string
   *               example: "+923311208060"
   *             code:
   *               type: string
   *               example: 476567
   *                
   */
  app.post("/v1/user/verifyPhone", users.verifyPhoneWithCode)

  //to upload base64 file
   /**
   * @swagger
   * /v1/image/uploadBase64:
   *    post:
   *      tags:
   *          - images
   *      description: Use to Upload Single Base64 Encoded Image
   *      responses:
   *         '200':
   *            description: A successful response
   *    consumes:
   *      - application/json
   *    parameters:
   *      - name: Single Base64 Image
   *        in: body
   *        description: Base64 Encoded Image to Upload on a specific Path
   *        required: true
   *        schema:
   *          type: object
   *          properties:
   *             folder:
   *               type: string
   *               enum: [users,properties,inspections]
   *               example: "users"
   *             id:
   *               type: string
   *               example: AFTTF65
   *             base64Image:
   *               type: string
   *               example: Base64 Encoded Image
   *                
   */
  app.post("/v1/image/uploadBase64", users.uploadBase64Images)

    //to upload base64 file
   /**
   * @swagger
   * /v1/image/changeProfilePictureBase64:
   *    post:
   *      tags:
   *          - images
   *      description: Use to Change Profile Image (Base64 Image)
   *      responses:
   *         '200':
   *            description: A successful response
   *    consumes:
   *      - application/json
   *    parameters:
   *      - name: Change Profile Picture
   *        in: body
   *        description: Base64 Encoded Image to replace with profile
   *        required: true
   *        schema:
   *          type: object
   *          properties:
   *             userid:
   *               type: string
   *               example: AFTTF65
   *             base64Image:
   *               type: string
   *               example: Base64 Encoded Image
   *                
   */
  app.post("/v1/image/changeProfilePictureBase64", users.changeProfilePictureBase64)

  //to upload base64 Multiple file
  /**
   * @swagger
   * /v1/image/uploadBase64MultipleImages:
   *    post:
   *      tags:
   *          - images
   *      description: Use to Upload Multiple Base64 Encoded Images
   *      responses:
   *         '200':
   *            description: A successful response
   *    consumes:
   *      - application/json
   *    parameters:
   *      - name: Upload Base64 Images
   *        in: body
   *        description: Base64 Encoded Images to Upload on specific path
   *        required: true
   *        schema:
   *          type: object
   *          properties:
   *             folder:
   *               type: string
   *               enum: [users,properties,inspections]
   *               example: "users"
   *             id:
   *               type: string
   *               example: AFTTF65
   *             base64Image:
   *               type: array
   *               items: {}
   *               example: 
   *                - Some Base64 Encoded Image
   *                - Another Base64 Encoded Image
   *                
   */
  app.post("/v1/image/uploadBase64MultipleImages", users.uploadBase64MultipleImages)

  //to send verification email with code
   /**
   * @swagger
   * /v1/user/sendverificationEmail:
   *    post:
   *      tags:
   *          - verification
   *      description: Use to Send Code on Registered Email for verification
   *      responses:
   *         '200':
   *            description: A successful response
   *    consumes:
   *      - application/json
   *    parameters:
   *      - name: Email for Verification
   *        in: body
   *        description: Email Address on which code will be sent
   *        required: true
   *        schema:
   *          type: object
   *          properties:
   *             email:
   *               type: string
   *               example: muhammadumerswati@gmail.com
   *                
   */
  app.post("/v1/user/sendverificationEmail", users.apiCallVerifyEmail)

  //to send verification code on phone
   /**
   * @swagger
   * /v1/user/sendverificationPhone:
   *    post:
   *      tags:
   *          - verification
   *      description: Use to Send Code on Registered Phone Number for verification
   *      responses:
   *         '200':
   *            description: A successful response
   *         '409':
   *            description: Duplicate Data
   *    consumes:
   *      - application/json
   *    parameters:
   *      - name: Phone number for Verification
   *        in: body
   *        description: Phone Number on which code will be sent
   *        required: true
   *        schema:
   *          type: object
   *          properties:
   *             phone:
   *               type: string
   *               example: "+923311208060"
   *                
   */
  app.post("/v1/user/sendverificationPhone", users.apiCallVerifyPhone)



}


