// Needed Resources 
const express = require("express")
const router = new express.Router() 
const detailController = require("../controllers/detailController");

router.get("/:carId", detailController.buildDetail);

module.exports = router;