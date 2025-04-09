// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const {handleErrors} = require("../utilities");
const utilities = require("../utilities");
const accountController = require("../controllers/accountController");


router.get("/", utilities.checkLogin, utilities.handleErrors(invController.buildInventory))

// router.get("/", invController.buildInventory);

// Route to build add new classification view
router.get("/add-classification", invController.buildAddNewClassification);

router.get("/type/:classificationId", invController.buildByClassificationId); // Route to build inventory by classification view
router.post("/add-classification", invController.addNewClassification);

router.get("/add-inventory", invController.buildAddNewInventory); // Route to build add new inventory view
router.post("/add-inventory", invController.addNewInventory); // Add New Route post

router.get("/getInventory/:classification_id", handleErrors(invController.getInventoryJSON))
router.delete("/delete/:inv_id", invController.deleteInventory);

router.get("/update-inventory/:inv_id", invController.buildUpdateInventory);
router.post("/update-inventory/:inv_id", invController.updateInventory);


module.exports = router;