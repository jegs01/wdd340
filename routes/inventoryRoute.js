// Needed Resources 
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const errorController = require("../controllers/errorController");

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);
router.get('/vehicle/:id', invController.getVehicleDetails);
router.get('/trigger-error', errorController.triggerError);

module.exports = router;