const express = require("express");
const router = new express.Router();
const utilities = require("../utilities/");
const accountController = require("../controllers/accountController");

router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildManagement))
router.get("/login", accountController.buildLogin);
router.post("/login", utilities.handleErrors(accountController.accountLogin));
router.get("/register", accountController.buildRegister);
router.post("/register", utilities.handleErrors(accountController.registerAccount));
// Logout Path
router.get("/logout", accountController.logout);
router.get("/update", utilities.checkLogin, accountController.buildUpdateAccountView);
router.post("/update", utilities.handleErrors(accountController.updateAccount));

// Enhanced error handling middleware
router.use((err, req, res, next) => {
  console.error("Error occurred:", err.message);
  res.status(500).json({ error: "Internal Server Error", message: err.message });
});

module.exports = router;