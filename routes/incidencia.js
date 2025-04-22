"use strict";

const express = require("express");
const incidenciaController = require("../controllers/incidencia");
const router = express.Router();
const multipart = require("connect-multiparty")
const md_upload = multipart({ uploadDir: "./upload/archivos" }); // Preparativo para subir archivos con multipart.
const verificacionToken = require("../middleware/verificacionToken");

// Rutas para incidencia
// Utiliza middleware connect-multiparty para procesar el archivo subido. Añade información en objeto req.files.
router.post("/incidencia/crear", md_upload, incidenciaController.crearIncidencia);
router.get("/incidencia/userIncidencias", verificacionToken, incidenciaController.userIncidencias);
// Incidencias del departamento
router.get("/incidencia/getDepIncidencias", verificacionToken, incidenciaController.getDepIncidencias);
router.get("/incidencia/getIncidencia/:id", verificacionToken, incidenciaController.getIncidencia);
router.put("/incidencia/updateIncidencia/:id", verificacionToken, incidenciaController.updateIncidencia);






module.exports = router;