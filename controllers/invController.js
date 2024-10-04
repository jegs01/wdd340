const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = utilities.handleErrors(async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
})

invCont.getVehicleDetails = utilities.handleErrors(async (req, res) => {
  const vehicleId = req.params.id; 
  const vehicle = await invModel.getVehicleById(vehicleId); 
  const nav = await utilities.getNav();
  const vehicleDetailHTML = utilities.buildVehicleDetail(vehicle, req);

  if (!vehicle) {
      return res.status(404).render('errors/error', {
          title: '404',
          message: 'Vehicle not found.'
      });
  }

  res.render('inventory/vehicle-detail', {
      title: `${vehicle.inv_make} ${vehicle.inv_model}`, 
      vehicle: vehicle,
      nav,
      vehicleDetailHTML,
  });
});

module.exports = invCont