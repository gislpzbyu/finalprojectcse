const utilities = require("../utilities/") // Asegura que tienes utilities configurado

const errorController = {}

/* ***************************
 *  Renderizar la página 404 con `nav`
 * ************************** */
errorController.handle404 = async (req, res) => {
  let nav = await utilities.getNav(req.originalUrl) // Obtener la navegación
  res.status(404).render("errors/404", { 
    title: "Page Not Found", 
    nav 
  })
}

/* ***************************
 *  Renderizar la página 500 con `nav`
 * ************************** */
errorController.handle500 = async (err, req, res, next) => {
  console.error(err.stack)
  let nav = await utilities.getNav(req.originalUrl) // Obtener la navegación
  res.status(500).render("errors/500", { 
    title: "Server Error", 
    nav 
  })
}

module.exports = errorController
