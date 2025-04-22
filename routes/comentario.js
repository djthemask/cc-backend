"use strict";

const express = require("express");
const comentarioController = require("../controllers/comentario");
const router = express.Router();
const verificacionToken = require("../middleware/verificacionToken");

router.post("/addComentario/:id", verificacionToken, comentarioController.addComentario);
router.get("/getComentarios/:id", verificacionToken, comentarioController.getComentarios);

module.exports = router;