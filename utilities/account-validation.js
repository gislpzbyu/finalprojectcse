const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}

/*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
validate.registrationRules = () => {
  return [
    // First name validation
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty().withMessage("Please provide a first name.")
      .isLength({ min: 1 }).withMessage("First name must be at least 1 character long."),

    // Last name validation
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty().withMessage("Please provide a last name.")
      .isLength({ min: 2 }).withMessage("Last name must be at least 2 characters long."),

    // Email validation
    body("account_email")
      .trim()
      .normalizeEmail()
      .isEmail().withMessage("A valid email is required."),

    // Password validation
    body("account_password")
      .trim()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
      }).withMessage("Password must be at least 12 characters long and include lowercase, uppercase, numbers, and symbols.")
  ]
}

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav() // Adjust this line if needed
    res.render("account/register", {
      errors: errors.array(),
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email
    })
    return
  }
  next()
}

module.exports = validate