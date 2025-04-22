"use strict";

const express = require("express");
const ciudadanoController = require("../controllers/ciudadano");
const router = express.Router();


// Rutas para registro / login
router.post("/register", ciudadanoController.registro);
router.post("/login", ciudadanoController.login);


module.exports = router;