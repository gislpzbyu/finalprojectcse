const utilies = require("../utilities/");

/* ****************************************
 *  Build Admin View
 * *************************************** */

async function buildAdmin(req, res) {
  let nav = await utilies.getNav();
  res.render("admin/index", { title: "Admin Test", nav });
}

module.exports = {
  buildAdmin
}