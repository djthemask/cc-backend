"use strict";

// Importamos los modelos que vamos a utilizar.
const Operario = require("../models/operario");
const ComentarioOperario = require("../models/comentario_operario");

const comentarioController = {
  // Método para crear un nuevo comentario en una incidencia.
  addComentario: async (req, res) => {
    // Obtenemos el id de la incidencia desde los parámetros de la URL.
    const incidenciaId = req.params.id;

    // Extraemos el comentario del body (se espera que en el body venga "comentario")
    const { comentario } = req.body;

    // Validamos que se haya enviado un comentario (no vacío)
    if (!comentario || comentario.trim() === "") {
      return res.status(400).send({
        status: "error",
        mensaje: "El comentario es obligatorio.",
      });
    }

    // Utilizamos req.user que ya ha sido asignado por el middleware de verificación.
    const usuario = req.user;
    if (!usuario) {
      return res.status(404).send({
        status: "error",
        mensaje: "Usuario no encontrado.",
      });
    }

    try {
      // Creamos el comentario en la base de datos.
      // Se usa 'contenido' en lugar de 'comentario' para que coincida con el nombre del campo en el modelo,
      // y se asigna la fecha actual a 'fecha_creacion'.
      const nuevoComentario = await ComentarioOperario.create({
        incidencia_id: incidenciaId,
        contenido: comentario, // Asignamos el comentario enviado
        fecha_creacion: new Date(), // Asignamos la fecha actual
        operario_id: usuario.id,
      });

      // Agregamos la información del operario al comentario antes de responder.
      nuevoComentario.dataValues.operario = {
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
      };

      return res.status(200).send({
        status: "success",
        mensaje:
          "El comentario se ha guardado correctamente en la base de datos.",
        comentario: nuevoComentario,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).send({
        status: "error",
        mensaje:
          "El comentario no se ha podido guardar debido a un error en el servidor.",
      });
    }
  },

  // Método para obtener todos los comentarios de una incidencia en concreto.
  getComentarios: async (req, res) => {
    // Obtenemos el id de la incidencia desde los parámetros de la URL.
    const incidenciaId = req.params.id;
    try {
      // Buscamos en la base de datos todos los comentarios asociados a la incidencia utilizando los métodos del ORM.
      const comentarios = await ComentarioOperario.findAll({
        where: { incidencia_id: incidenciaId },
        include: [
          {
            model: Operario,
            attributes: ["nombre", "apellidos"],
            as: "operario",
          },
        ],
        order: [["fecha_creacion", "DESC"]],
      });

      // Si no se encuentran comentarios, devolvemos un success en la petición pero un mensaje que indica que no hay incidencias..
      if (!comentarios.length) {
        return res.status(200).send({
          status: "success",
          mensaje: "Todavía no hay comentarios para esta incidencia.",
          comentarios: [],
        });
      }

      // Si se encuentran comentarios -> success -> devolvemos los comentarios obtenidos.
      return res.status(200).send({
        status: "success",
        mensaje: "Comentarios obtenidos correctamente.",
        comentarios,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).send({
        status: "error",
        mensaje: "Error en el servidor al obtener los comentarios.",
      });
    }
  },
};

module.exports = comentarioController;
