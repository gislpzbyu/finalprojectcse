/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
require("dotenv").config();
/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const dotenv = require("dotenv").config();
const session = require("express-session");
const cookieParser = require("cookie-parser");
const pool = require("./database/");
const accountRoute = require("./routes/accountRoute");
const utilities = require("./utilities/index");

// Importar rutas y controladores
const staticRoutes = require("./routes/static");
const baseController = require("./controllers/baseController");
const inventoryRoute = require("./routes/inventoryRoute");
const detailRoute = require("./routes/detailRoute");
const errorController = require("./controllers/errorController");

const app = express();

/* ***********************
 * Middleware
 *************************/
app.use(express.json()); // Procesar JSON
app.use(express.urlencoded({ extended: true })); // Formularios
app.use(express.static("public")); // Archivos estáticos (CSS, JS, imágenes)
app.use(cookieParser());
app.use(utilities.checkJWTToken);
app.use((req, res, next) => {
    if (res.locals.accountData === undefined) {
        res.locals.accountData = null
    }
    next();
});

// Configuración de sesión
app.use(
  session({
    store: new (require("connect-pg-simple")(session))({
      createTableIfMissing: true,
      pool,
    }),
    secret: process.env.SESSION_SECRET || "defaultSecretKey",
    resave: false,
    saveUninitialized: false,
    name: "sessionId",
    cookie: {
      secure: false, // Cambiar a true en producción con HTTPS
      maxAge: 1000 * 60 * 60 * 24, // 1 día en milisegundos
    },
  })
);

// Express Messages Middleware
app.use(require("connect-flash")());
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

/* ***********************
 * Motor de vistas y plantillas
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout");

/* ***********************
 * Rutas
 *************************/
app.use(staticRoutes);
app.get("/", baseController.buildHome);
app.use("/inv", inventoryRoute);
app.use("/detail", detailRoute);
app.use("/account", accountRoute);

// Ruta para probar un error 500
app.get("/trigger-error", (req, res, next) => {
  next(new Error("Intentional Server Error"));
});

/* ***********************
 * Manejadores de errores
 *************************/
app.use(errorController.handle404); // Error 404
app.use(errorController.handle500); // Error 500

/* ***********************
 * Información del servidor local
 *************************/
const port = process.env.PORT || 3000;
const host = process.env.HOST || "localhost";

/* ***********************
 * Iniciar servidor
 *************************/
app.listen(port, () => {
  console.log(`App listening on ${host}:${port}`);
});