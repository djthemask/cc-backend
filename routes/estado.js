"use strict";

const express = require("express");
const estadoController = require("../controllers/estado");
const router = express.Router();

// Rutas para Estados
router.get("/estado/getEstados", estadoController.getEstados);

module.exports = router;