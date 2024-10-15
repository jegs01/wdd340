const accountModel = require("../models/account-model")
const utilities = require("../utilities/")
const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken');

async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
        title: "Login",
        nav,
        errors: null
    }) 
}

async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
        title: "Register",
        nav,
        errors: null
    }) 
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body

    let hashedPassword
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }
  
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )
  
    if (regResult) {
      req.flash(
        "notice",
        `Congratulations, you\'re registered ${account_firstname}. Please log in.`
      )
      res.status(201).render("account/login", {
        title: "Login",
        nav,
        errors: null
      })
    } else {
      req.flash("notice", "Sorry, the registration failed.")
      res.status(501).render("account/register", {
        title: "Registration",
        nav,
        errors: null
      })
    }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function loginAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body

  const account = await accountModel.getAccountByEmail(account_email)
  if (!account) {
    req.flash("notice", "Please check your credentials and try again.")
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
  }

  try {
    const passwordMatch = await bcrypt.compare(account_password, account.account_password)
    if (passwordMatch) {
      delete account.account_password

      const accessToken = jwt.sign(account, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })

      const cookieOptions = {
        httpOnly: true,
        maxAge: 3600 * 1000,
      }

      if (process.env.NODE_ENV !== 'development') {
        cookieOptions.secure = true
      }

      res.cookie("jwt", accessToken, cookieOptions)

      req.user = account

      return res.redirect("/account/")
    } else {
      req.flash("notice", "Invalid password. Please try again.")
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    console.error(error)
    return res.status(500).send("An error occurred during login.")
  }
}


async function buildLoginDashboard(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/dashboard", {
      title: "Account Management",
      nav,
      errors: null
  }) 
}

async function logoutAccount(req, res) {
  try {
    res.clearCookie('jwt', { httpOnly: true, secure: process.env.NODE_ENV !== 'development' });

    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.redirect('/');
      }
      res.clearCookie('connect.sid');
      res.redirect('/');
    });
  } catch (error) {
    console.error('Unexpected error during logout:', error);
    res.redirect('/');
  }
}

module.exports = { buildLogin, buildRegister, registerAccount, loginAccount, buildLoginDashboard, logoutAccount }