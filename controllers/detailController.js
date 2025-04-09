const invModel = require("../models/inventory-model")
const utilities = require("../utilities/");

const detailController = {};

/* ***************************
 * Render detail view
 * ************************** */
detailController.buildDetail = async function (req, res, next) {
  try {
    const carId = req.params.carId;
    const data = await invModel.getCarById(carId);

    if (!data || !data.rows || data.rows.length === 0) {
      return res.status(404).render("errors/404", { title: "Page Not Found" });
    }


    const carDetails = await utilities.buildDetailPage(data.rows[0]);
    let nav = await utilities.getNav(req.originalUrl);

    res.render("./detail", {
      title: "Detail Page",
      carDetails,
      nav,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = detailController;
