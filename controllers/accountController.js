// controllers/accountController.js
const jwt = require("jsonwebtoken");
const accountModel = require('../models/account-model');
const utilities = require('../utilities/');
const bcrypt = require("bcryptjs");
require("dotenv").config();

/* ****************************************
 *  Build Login View
 * *************************************** */
async function buildLogin(req, res) {
    let nav = await utilities.getNav();
    res.render("account/login", {title: "Login", nav});
}

/* ****************************************
 *  Build Register View
 * *************************************** */
async function buildRegister(req, res) {
    let nav = await utilities.getNav();
    res.render("account/register", {title: "Register", nav});
}

/* ****************************************
 *  Build Management View
 * *************************************** */
async function buildManagement(req, res) {
    let nav = await utilities.getNav();
    res.render("account/management", {
        title: "Management",
        nav,
        res
    });
}

async function registerAccount(req, res) {
    let nav = await utilities.getNav();
    const {account_firstname, account_lastname, account_email, account_password} = req.body;

    try {
        // Generar hash de la contraseña antes de guardarla
        const hashedPassword = await bcrypt.hash(account_password, 10); // 10 es el número de salt rounds

        // Guardar en la base de datos con la contraseña hasheada
        const regResult = await accountModel.registerAccount(
            account_firstname,
            account_lastname,
            account_email,
            hashedPassword
        );

        if (regResult) {
            req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`);
            return res.status(201).render("account/login", {title: "Login", nav});
        } else {
            req.flash("notice", "Sorry, the registration failed.");
            return res.status(501).render("account/register", {title: "Registration", nav});
        }
    } catch (error) {
        console.error("Error during registration:", error);
        req.flash("notice", "An error occurred during registration. Please try again.");
        return res.status(500).render("account/register", {title: "Registration", nav});
    }
}

async function accountLogin(req, res) {
    let nav = await utilities.getNav()

    const {account_email, account_password} = req.body
    const accountData = await accountModel.getAccountByEmail(account_email)
    if (!accountData) {
        req.flash("notice", "Please check your credentials and try again.")
        res.status(400).render("account/login", {
            title: "Login",
            nav,
            errors: null,
            account_email,
        })
        return
    }
    try {
        if (await bcrypt.compare(account_password, accountData.account_password)) {
            delete accountData.account_password
            const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, {expiresIn: 3600 * 1000})
            if (process.env.NODE_ENV === 'development') {
                res.cookie("jwt", accessToken, {httpOnly: true, maxAge: 3600 * 1000})
            } else {
                res.cookie("jwt", accessToken, {httpOnly: true, secure: true, maxAge: 3600 * 1000})
            }
            return res.redirect("/account/")
        } else {
            req.flash("message notice", "Please check your credentials and try again.")
            res.status(400).render("account/login", {
                title: "Login",
                nav,
                errors: null,
                account_email,
            })
        }
    } catch (error) {
        console.log('Error: ', error);
        throw new Error('Access Forbidden')
    }
}

async function logout(req, res) {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        res.clearCookie("sessionId");
        res.clearCookie("jwt");
        res.locals.accountData = null;
        res.redirect("/account/login");
    });
}

async function buildUpdateAccountView(req, res) {
    let nav = await utilities.getNav();
    const foundAccount = await accountModel.getAccountByEmail(res.locals.accountData.account_email);

    res.render("account/update", {
        title: "Update Account",
        nav,
        account: foundAccount,
        passwordPlaceholder: 'Enter new password (leave blank to keep current)'
    });
}

async function updateAccount(req, res) {
    let nav = await utilities.getNav();

    const account_id = res.locals.accountData.account_id;
    const { account_firstname, account_lastname, account_email, account_password_new, account_type } = req.body;

    try {
        let hashedPassword;
        if (account_password_new) {
            hashedPassword = await bcrypt.hash(account_password_new, 10);
        } else {
            const accountData = await accountModel.getAccountByEmail(account_email);
            hashedPassword = accountData.account_password;
        }

        const updateResult = await accountModel.updateAccount(account_id, account_firstname, account_lastname, account_email, hashedPassword, account_type);

        if (updateResult.rowCount === 1) {
            req.flash("notice", "Account updated successfully.");
            return res.status(200).render("account/login", {
                title: "Login",
                nav
            });
        } else {
            req.flash("notice", "Sorry, the update failed.");
            return res.status(500).render("account/update", {
                title: "Update Account",
                nav,
                errors: null,
                account: {
                    account_id,
                    account_firstname,
                    account_lastname,
                    account_email,
                    account_type
                }
            });
        }
    } catch (error) {
        console.error("Error during account update:", error);
        req.flash("notice", "An error occurred during account update. Please try again.");
        return res.status(500).render("account/update", {
            title: "Update Account",
            nav,
            errors: null,
            account: {
                account_id,
                account_firstname,
                account_lastname,
                account_email,
                account_type
            }
        });
    }
}



module.exports = {
    buildLogin,
    buildRegister,
    registerAccount,
    accountLogin,
    buildManagement,
    logout,
    buildUpdateAccountView,
    updateAccount
};