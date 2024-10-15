const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities/")
const regValidate = require('../utilities/account-validation')

router.get("/login", utilities.handleErrors(accountController.buildLogin))
router.get("/register", utilities.handleErrors(accountController.buildRegister))
router.post(
    '/register', regValidate.registrationRules(),
    regValidate.checkRegData, utilities.handleErrors(accountController.registerAccount))

// Process the login attempt
router.post(
    "/login", regValidate.loginRules(),
    regValidate.checkLoginRegData, utilities.handleErrors(accountController.loginAccount))

router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildLoginDashboard))
router.get('/logout', utilities.handleErrors(accountController.logoutAccount));

module.exports = router