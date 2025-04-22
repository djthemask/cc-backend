"use strict";

const express = require("express");
const operarioController = require("../controllers/operario");
const router = express.Router();
const verificacionToken = require("../middleware/verificacionToken");


// Rutas para operario
router.post("/operario/register", operarioController.registro);
router.post("/operario/login", operarioController.login);
router.get("/operario/getOperarios", verificacionToken, operarioController.getOperarios);
router.get("/operario/getOperario/:id", operarioController.getOperario);
router.put("/operario/editarOperario/:id", operarioController.editarOperario);


module.exports = router;