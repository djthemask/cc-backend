"use strict";

const express = require("express");
const departamentoController = require("../controllers/departamento");
const router = express.Router();

// Rutas para Departamento
router.post("/departamento/crear", departamentoController.agregarDepartamento);
router.delete("/departamento/eliminar/:id", departamentoController.eliminarDepartamento);
router.get("/departamento/getDepartamentos", departamentoController.getDepartamentos);

module.exports = router;