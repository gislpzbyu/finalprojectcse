const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id);

    let nav = await utilities.getNav(req.originalUrl);

    let grid;

    let className = "Unknown";

    if (Array.isArray(data) && data.length > 0) {
      grid = await utilities.buildClassificationGrid(data);
      className = data[0].classification_name;
    } else {
      grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>';
    }

    res.render("./inventory/classification", {
      title: `${className} vehicles`,
      nav,
      grid,
    });
  } catch (error) {
    console.log("error 😏", error);
    next(error);
  }
};


invCont.buildInventory = async function (req, res, next) {
  try {
    let nav = await utilities.getNav(req.originalUrl)
    const classificationSelect = await utilities.buildClassificationList();
    res.render("./inventory/index", {
      title: "Inventory",
      nav,
      classificationSelect,
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)

  const invData = await invModel.getInventoryByClassificationId(classification_id)

  if (invData.length === 0) {
    return res.json([]);
  }

  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

invCont.buildAddNewClassification = async function (req, res, next) {
  try {
    let nav = await utilities.getNav(req.originalUrl)

    res.render("./inventory/add-classification", { title: "Add New Classification", nav })
  } catch (error) {
    next(error)
  }
}

invCont.buildAddNewInventory = async function (req, res, next) {
  try {
    let nav = await utilities.getNav(req.originalUrl)
    const classifications = await invModel.getClassifications(); // Obtén las clasificaciones
    res.render("./inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      classifications: classifications.rows, // Envía las clasificaciones a la vista
    })
  } catch (error) {
    next(error)
  }
}

invCont.addNewClassification = async function (req, res, next) {
  try {
    const { classification_name } = req.body;

    // Validamos que classification_name no esté vacío y sea un string válido
    if (!classification_name || typeof classification_name !== "string" || classification_name.trim() === "") {
      req.flash("notice", "Error: Classification cannot be empty and must be a valid text.");
      return res.redirect("/inv/add-classification"); // Ajusta la ruta según tu aplicación
    }

    // Insertar la nueva clasificación en la base de datos
    await invModel.addNewClassification(classification_name);

    // Mensaje de éxito y redirección
    req.flash("notice", "¡Clasificación agregada exitosamente!");
    res.redirect("/inv");
  } catch (error) {
    console.error("Error al agregar clasificación:", error);
    req.flash("notice", "Error inesperado al agregar la clasificación.");
    next(error);
  }
};


invCont.addNewInventory = async function (req, res, next) {
  try {
    const { classification_ } = req.body;

    await invModel.addNewInventory({ ...req.body, classification_: classification_.toString() });

    res.redirect(`/inv/type/${classification_}`)
  } catch (error) {
    console.log('Error while adding new inventory',error);
    next(error)
  }
}

invCont.deleteInventory = async function (req, res, next) {
  try {
    const result = await invModel.deleteCarById(req.params.inv_id);

    if (result) {
      res.status(200).json({ message: "Item deleted successfully" });
    } else {
      res.status(404).json({ message: "Item not found" });
    }
  } catch (error) {
    next(error);
  }
};

invCont.buildUpdateInventory = async function (req, res, next) {
  try {
    const invId = req.params.inv_id;
    const inventoryItem = await invModel.getCarById(invId);

    if (!inventoryItem) {
      return res.status(404).render("errors/404", { title: "Item Not Found" });
    }

    let nav = await utilities.getNav(req.originalUrl);
    const classifications = await invModel.getClassifications(); // Obtén las clasificaciones

    res.render("inventory/update-inventory", {
      title: "Update Inventory",
      nav,
      inventoryItem: inventoryItem.rows[0],
      classifications: classifications.rows, // Envía las clasificaciones a la vista
    });
  } catch (error) {
    next(error);
  }
};

invCont.updateInventory = async function (req, res, next) {
  try {
    const invId = req.params.inv_id;
    const updatedData = req.body;

    const result = await invModel.updateCarById(invId, updatedData);

    if (result) {
      req.flash("notice", "Item updated successfully!");
      res.redirect(`/inv`);
      // res.redirect(`/inv/detail/${invId}`);
    } else {
      res.status(404).json({ message: "Item not found" });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = invCont
