"use strict";

const Estado = require("../models/estado_incidencia");

const estadoController = {
  // Método para obtener todos los estados existentes
  getEstados: async (req, res) => {
    try {
      // Pedimos que nos devuelva todos los estados con id y nombre
      const estados = await Estado.findAll({
        attributes: ["id", "nombre"],
      });

      // Creamos un array con map para guardar los estados.
      const resultado = estados.map((estado) => ({
        id: estado.id,
        nombre: estado.nombre,
      }));

      // Obtenemos estados -> devolvemos success.
      return res.status(200).send({
        status: "success",
        mensaje: "Estados obtenidos correctamente.",
        estados: resultado,
      });
    } catch (err) {
      console.error(err);
      // Error devolvemos una respuesta de error del servidor.
      return res.status(500).send({
        status: "error",
        mensaje: "Error en el servidor al obtener los estados.",
      });
    }
  },
};

module.exports = estadoController;