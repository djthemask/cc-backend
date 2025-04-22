"use strict";

// Validador de información (Ej. Comprobar si esta vacio.)
const validator = require("validator");
// Importamos el modelo a utilizar
const Departamento = require("../models/departamento");

const departamentoController = {
  // Método para agregar un departamento
  agregarDepartamento: async (req, res) => {
    // Guardado de información de los parametros recibidos por el formulario.
    const params = req.body;

    // Declaramos todos los valores del modelo de un ciudadano.
    let validateNombre, validateDescripcion;

    try {
      validateNombre = !validator.isEmpty(params.nombre);
      validateDescripcion = !validator.isEmpty(params.descripcion);
    } catch (err) {
      return res.status(400).send({
        status: "error",
        mensaje: "No se han rellenado todos los campos requeridos.",
      });
    }

    // Validación adicional en caso de que alguno de los campos no cumpla la condición
    if (!validateNombre || !validateDescripcion) {
      return res.status(400).send({
        status: "error",
        mensaje: "No se han rellenado todos los campos requeridos.",
      });
    }

    try {
      // Comprobamos si ya existe un departamento con el mismo nombre
      const existingDepartamento = await Departamento.findOne({
        where: { nombre: params.nombre },
      });
      if (existingDepartamento) {
        return res.status(400).send({
          status: "error",
          mensaje: "Ya existe un departamento con ese nombre.",
        });
      }

      // Asignamos los datos a los campos correctos definidos en BBDD
      const nuevoDepartamento = await Departamento.create({
        nombre: params.nombre,
        descripcion: params.descripcion,
      });

      // success: Creamos el departamento nuevo
      return res.status(200).send({
        status: "success",
        mensaje: "Departamento creado correctamente.",
        departamento: nuevoDepartamento,
      });
    } catch (err) {
      console.error(err);
      // error: server error MSG
      return res.status(500).send({
        status: "error",
        mensaje:
          "El departamento no se ha podido guardar debido a un error en el servidor",
      });
    }
  },

  // Método para eliminar un departamento existente
  eliminarDepartamento: async (req, res) => {
    // Se extrae el id desde la url
    const { id } = req.params;

    try {
      // Buscamos el departamento por su ID.
      const departamento = await Departamento.findByPk(id);
      if (!departamento) {
        return res.status(404).send({
          status: "error",
          mensaje: "Departamento no encontrado.",
        });
      }

      // Eliminamos el departamento de la base de datos.
      await Departamento.destroy({ where: { id } });

      // success: departamento eliminado MSG
      return res.status(200).send({
        status: "success",
        mensaje: "Departamento eliminado correctamente.",
      });
    } catch (err) {
      console.error(err);
      // error: server error MSG
      return res.status(500).send({
        status: "error",
        mensaje: "Error en el servidor al eliminar el departamento. No se puede eliminar un departamento con incidencias asignadas.",
      });
    }
  },
  // Método para obtener todos los departamentos existente
  getDepartamentos: async (req, res) => {
    try {
      // Pedimos que nos devuelva todos los departamentos con id, nombre y descripcion.
      const departamentos = await Departamento.findAll({
        attributes: ["id", "nombre", "descripcion"],
      });
  
      // Creamos un array con map para guardar los operarios.
      const resultado = departamentos.map((departamento) => ({
        id: departamento.id,
        nombre: departamento.nombre,
        descripcion: departamento.descripcion,
      }));
  
      // Si hemos obtenido los departamentos correctamente devolvemos una respuesta exitosa. Devolvemos los operarios obtenidos
      return res.status(200).send({
        status: "success",
        mensaje: "Departamentos obtenidos correctamente.",
        departamentos: resultado,
      });
    } catch (err) {
      console.error(err);
      // En caso de que no, devolvemos un error al obtener los operarios.
      return res.status(500).send({
        status: "error",
        mensaje: "Error en el servidor al obtener los departamentos.",
      });
    }
  }
};

module.exports = departamentoController;
