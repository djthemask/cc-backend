"use strict";

// Validador de información (EJ. Comprobar si está vacío.)
const validator = require("validator");
// Importamos los modelos que vamos a utilizar.
const Ciudadano = require("../models/ciudadano");
const Operario = require("../models/operario");
const Departamento = require("../models/departamento");
const Incidencia = require("../models/incidencia");
const Estado = require("../models/estado_incidencia");

// Imports para File Upload ( File Sistem y Path )
const fs = require("fs");
const path = require("path");
// Carga las variables de entorno desde .env
require("dotenv").config({ path: "confidential.env" });
// Import Jason Web Token
const jwt = require("jsonwebtoken");

const incidenciaController = {
  // Método para crear incidencias ( Más adelante reutilizaremos para la creación de incidencias por operarios )
  crearIncidencia: async (req, res) => {
    // Guardado de información de los parametros recibidos por el formulario.
    const params = req.body;

    // Aun que en el frontend nos aseguramos que un usuario no podrá acceder a las rutas hacemos una segunda comprobación
    // En el backend para realizar un doble check.
    // Obtener y decodificar el token JWT desde la cabecera con nombre "jwt"
    const token = req.headers.jwt;
    // Si no obtenemos ningún token.
    if (!token) {
      return res.status(401).send({
        status: "error",
        mensaje: "No se encontró el token de autenticación.",
      });
    }

    // Variable para el JWT decodificado. Contiene los datos ID, Nombre y Apellidos como hemos configurado en el metodo login en controller
    // Ciudadano.js
    let tokenDescifrado;
    try {
      // Verificamos la validez del token verificando el token obtenido con el generador establecido en variable de entorno
      tokenDescifrado = jwt.verify(token, process.env.JWT_SECRET);
      // Token inválido
    } catch (error) {
      return res.status(401).send({
        status: "error",
        mensaje: "Token inválido.",
      });
    }

    // Preparativo variable para un usuario y el tipo de usuario.
    let usuario;
    let tipoUsuario;

    // Si el token decodificado tiene el campo "rol" = operario.
    if (tokenDescifrado.rol !== undefined && tokenDescifrado.rol !== null) {
      tipoUsuario = "operario";
      usuario = await Operario.findOne({ where: { id: tokenDescifrado.id } });
    } else {
      // Si no tiene el campo "rol", es un ciudadano.
      tipoUsuario = "ciudadano";
      usuario = await Ciudadano.findOne({ where: { id: tokenDescifrado.id } });
    }

    // Si no encontramos un usuario en la base de datos -> error.
    if (!usuario) {
      return res.status(404).send({
        status: "error",
        mensaje: "Usuario no encontrado.",
      });
    }

    // Variables y validación de la descripción y el departamento introducido por el ciudadano.
    let validateDescripcion, validateDepartamento;
    try {
      validateDescripcion = !validator.isEmpty(params.descripcion);
      // El desplegable devuelve un string que identifica el departamento.
      validateDepartamento = !validator.isEmpty(params.departamento);

      // En caso de que uno de las variables vienen vacías
    } catch (err) {
      return res.status(400).send({
        status: "error",
        mensaje: "No se han proporcionado todos los campos requeridos.",
      });
    }

    // Segunda comprobación variables vacías
    if (!validateDescripcion || !validateDepartamento) {
      return res.status(400).send({
        status: "error",
        mensaje: "Faltan campos requeridos.",
      });
    }

    // Buscamos en la base de datos el departamento que corresponde al string enviado.
    let departamento;
    try {
      // Buscamos el departamento a partir del nombre recibido
      departamento = await Departamento.findOne({
        where: { nombre: params.departamento },
      });
      if (!departamento) {
        return res.status(400).send({
          status: "error",
          mensaje: "El departamento seleccionado no existe.",
        });
      }
      // Server error (No se puede establecer conexión con el servidor)
    } catch (err) {
      return res.status(500).send({
        status: "error",
        mensaje: "Error al buscar el departamento.",
      });
    }

    // Empezamos con la carga del archivo
    // Si el formulario envía un archivo, se procesa y se guarda en /upload/archivos. (Puede estar vacío)

    // Rutas de imagen y vídeo por defecto null.
    let rutaImagen = null;
    let rutaVideo = null;

    // Verificamos si existe un archivo en la solicitud y si se intenta subir un archivo con la propiedad file0
    if (req.files && req.files.file0) {
      // Obtenemos path completo de subida del archivo
      const rutaArchivo = req.files.file0.path;
      // Separamos la ruta completa por directorios. (Funciona para Mac/Linux & Windows)
      let archivoSplit = rutaArchivo.split(path.sep);
      // Se obtiene el nombre del archivo
      let nombreArchivo = archivoSplit[archivoSplit.length - 1];
      //  Guardamos un array separando el nombre de la extensión utilizando el . como separador.
      let archivoSeparado = nombreArchivo.split(".");
      // Guardamos la ultima posición de archivoSeparado para tener la extensión y la convertimos a minusculas para comprobaciones.
      let extensionArchivo =
        archivoSeparado[archivoSeparado.length - 1].toLowerCase();

      // Comprobar si la extensión es válida y está permitida. (OJO Aquí agregamos en el futuro extensiones adicionales que queramos aceptar)
      // Array con extensiones válidas para imagen y video.
      const extensionesImagen = ["png", "jpg", "jpeg", "gif"];
      const extensionesVideo = ["mp4"];

      // Verificamos el tipo de archivo (Imagen o Vídeo) y asignar la ruta correspondiente.
      if (extensionesImagen.includes(extensionArchivo)) {
        // Generamos un identificador único para el archivo. (milisegundos desde 1/1/1970)
        const uniqueId = Date.now();
        // Establecemos el nuevo nombre que tendrá nuestro archivo
        const nuevoNombre = uniqueId + "-" + nombreArchivo;
        // Definimos la rutaDestino. path.join unión a directorio actual (__dirname) ruta de destino + el nuevo nombre del archivo.
        const rutaDestino = path.join(
          __dirname,
          "../upload/archivos",
          nuevoNombre
        );

        // Intentamos renombrar el archivo subido desde (rutaArchivo) a la (rutaDestino)
        try {
          fs.renameSync(rutaArchivo, rutaDestino);
          rutaImagen = "/upload/archivos/" + nuevoNombre;
          // Error servidor
        } catch (err) {
          console.error(err);
          return res.status(500).send({
            status: "error",
            mensaje: "Error al guardar la imagen.",
          });
        }
        // En caso de que sea un vídeo
      } else if (extensionesVideo.includes(extensionArchivo)) {
        // Generamos un identificador único para el archivo. (milisegundos desde 1/1/1970)
        const uniqueId = Date.now();
        // Establecemos el nuevo nombre que tendrá nuestro archivo
        const nuevoNombre = uniqueId + "-" + nombreArchivo;
        // Definimos la rutaDestino. path.join unión a directorio actual (__dirname) ruta de destino + el nuevo nombre del archivo.
        const rutaDestino = path.join(
          __dirname,
          "../upload/archivos",
          nuevoNombre
        );
        // Intentamos renombrar el archivo subido desde (rutaArchivo) a la (rutaDestino)

        try {
          fs.renameSync(rutaArchivo, rutaDestino);
          rutaVideo = "/upload/archivos/" + nuevoNombre;
          // Error servidor
        } catch (err) {
          console.error(err);
          return res.status(500).send({
            status: "error",
            mensaje: "Error al guardar el video.",
          });
        }
      } else {
        // Si la extensión no es válida para imagen ni video, se borra el archivo y se retorna error.
        fs.unlink(rutaArchivo, (err) => {
          return res.status(400).send({
            status: "error",
            mensaje: "La extensión del archivo no es válida.",
          });
        });
        return;
      }
    }

    // Definimos el estado de la incidencia por defecto (1 = pendiente) y la fecha de creación.
    const estado_id = 1; // Estado "pendiente"
    const fecha_creacion = new Date(); // Fecha actual (Según servidor)

    // Crearmos la incidencia en la base de datos.
    try {
      const incidencia = await Incidencia.create({
        descripcion: params.descripcion,
        imagen: rutaImagen, // Se guarda la ruta de la imagen si se subió, o null.
        video: rutaVideo, // Se guarda la ruta del video si se subió, o null.
        fecha_creacion: fecha_creacion,
        fecha_resolucion: null, // Nunca será resuelta al instante. Siempre será null a la hora de creación.
        usuario_id: usuario.id, // Desde V3.0 ya no se filtra por ciudadano_id
        departamento_id: departamento.id,
        estado_id: estado_id,
        tipo_usuario: tipoUsuario, // Desde V3.0 se agrega tipoUsuario a la bbdd para permitir creación de incidencias del operario
      });

      // Ser guarda la incidencia en la BBDD
      return res.status(200).send({
        status: "success",
        mensaje:
          "La incidencia se ha guardado correctamente en la base de datos.",
        incidencia,
      });
      // Error de servidor
    } catch (err) {
      console.error(err);
      return res.status(500).send({
        status: "error",
        mensaje:
          "La incidencia no se ha podido guardar debido a un error en el servidor.",
      });
    }
  },

  // Método para obtener incidencias creadas por el usuario autenticado
  userIncidencias: async (req, res) => {
    // Extrae el ID del usuario autenticado ("user" proviene del middleware)
    const userId = req.user.id;

    // Comprobamos si el usuario es un operario o un ciudadano
    let tipoUsuario;
    //Si el usuario tiene un rol
    if (req.user.rol !== undefined && req.user.rol !== null) {
      tipoUsuario = "operario";
      // Si el usuario no tiene un rol
    } else {
      tipoUsuario = "ciudadano";
    }

    try {
      // Consulta a la base de datos para obtener todas las incidencias
      // Se incluyen en la consulta los modelos relacionados:

      const incidenciasUsuario = await Incidencia.findAll({
        where: { usuario_id: userId, tipo_usuario: tipoUsuario },
        // Incluimos también el departamento y el estado de la incidencia.
        include: [
          // Del departamento utilizando el alias definido en el modelo solicitamos el Nombre del departamento.
          { model: Departamento, attributes: ["nombre"], as: "departamento" },
          // Del estado utilizando el alias definido en el modelo solicitamos el Nombre del estado.
          { model: Estado, attributes: ["nombre"], as: "estado" },
        ],
        // Ordenamos las incidencias de forma descendente por la fecha_creación.
        order: [["fecha_creacion", "DESC"]],
      });

      // En caso de que el incidenciasUsuario esté vacío.
      if (!incidenciasUsuario.length) {
        return res.status(404).send({
          status: "error",
          mensaje: "Actualmente no has creado ninguna incidencia.",
        });
      }

      // Devolvemos succes y las incidencias creadas por el usuario.
      return res
        .status(200)
        .send({ status: "success", incidencias: incidenciasUsuario });
    } catch (err) {
      // En caso de error devolvemos un error
      console.error(err);
      return res.status(500).send({
        status: "error",
        mensaje: "Error en el servidor al obtener tus incidencias.",
      });
    }
  },
  // Método para obtener incidencias de un departamento en concreto
  getDepIncidencias: async (req, res) => {
    // Obtenemos el id del usuario y, para operarios, su rol. ("user" proviene del middleware)
    const { id, rol } = req.user;
    try {
      let incidencias;
      // Si el usuario es administrador (rol 2), devolvemos todas las incidencias.
      if (Number(rol) === 2) {
        incidencias = await Incidencia.findAll({
          include: [
            { model: Departamento, attributes: ["nombre"], as: "departamento" },
            { model: Estado, attributes: ["nombre"], as: "estado" },
          ],
          order: [["fecha_creacion", "DESC"]],
        });
      } else {
        // Operarios: primero buscamos en el modelo Operario para obtener su departamento.
        const operario = await Operario.findOne({
          where: { id: id },
        });
        if (!operario) {
          return res.status(404).send({
            status: "error",
            mensaje: "Operario no encontrado.",
          });
        }
        // Usamos el departamento_id del operario para filtrar las incidencias para devolver las incidencias de su departamento.
        incidencias = await Incidencia.findAll({
          where: { departamento_id: operario.departamento_id },
          include: [
            { model: Departamento, attributes: ["nombre"], as: "departamento" },
            { model: Estado, attributes: ["nombre"], as: "estado" },
          ],
          order: [["fecha_creacion", "DESC"]],
        });
      }

      // Si no se han encontrado incidencias, devolvemos error.
      if (!incidencias.length) {
        return res.status(404).send({
          status: "error",
          mensaje: "No se encontraron incidencias para este departamento.",
        });
      }

      // Si encontramos incidencias -> success -> devolvemos  las incidencias obtenidas.
      return res.status(200).send({
        status: "success",
        mensaje: "Incidencias obtenidas correctamente.",
        incidencias,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).send({
        status: "error",
        mensaje: "Error en el servidor al obtener incidencias.",
      });
    }
  },

  // Método para obtener una incidencia en concreto
  getIncidencia: async (req, res) => {
    // Obtenemos el id de la incidencia desde los parámetros de la URL
    const { id } = req.params;
    try {
      // Buscamos la incidencia en la base de datos utilizando los métodos del ORM
      const incidencia = await Incidencia.findOne({
        where: { id },
        include: [
          {
            model: Departamento,
            attributes: ["id", "nombre"],
            as: "departamento",
          },
          { model: Estado, attributes: ["id", "nombre"], as: "estado" },
        ],
      });

      // Verificamos el campo tipo_usuario para saber de dónde obtener el usuario autor
      let usuario;
      // Si es operario
      if (incidencia.tipo_usuario === "operario") {
        usuario = await Operario.findOne({
          where: { id: incidencia.usuario_id },
          attributes: ["id", "nombre", "apellidos"], // selecciona los campos que te interesen
        });
      } else {
        // Si es ciudadano
        usuario = await Ciudadano.findOne({
          where: { id: incidencia.usuario_id },
          attributes: ["id", "nombre", "apellidos"],
        });
      }

      // Agregamos la información del usuario a la incidencia para que el frontend la muestre
      incidencia.dataValues.usuario = usuario;

      // Si no se encuentra la incidencia, devolvemos un error 404
      if (!incidencia) {
        return res.status(404).send({
          status: "error",
          mensaje: "Incidencia no encontrada.",
        });
      }

      // Si la incidencia es encontrada, devolvemos la incidencia con un success
      return res.status(200).send({
        status: "success",
        mensaje: "Incidencia obtenida correctamente.",
        incidencia,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).send({
        status: "error",
        mensaje: "Error en el servidor al obtener la incidencia.",
      });
    }
  },

  // Método para actualizar una incidencia
  updateIncidencia: async (req, res) => {
    // Obtenemos el id de la incidencia desde los parámetros y los datos actualizados del body
    const { id } = req.params;
    const { departamento_id, estado_id } = req.body;
    try {
      // Actualizamos la incidencia en la base de datos utilizando el método update del ORM.
      const resultado = await Incidencia.update(
        { departamento_id, estado_id },
        { where: { id } }
      );

      // Comprobamos si se ha actualizado al menos un registro.
      if (resultado[0] === 0) {
        // Si no se actualizó ningún registro, devolvemos un mensaje de éxito indicando que no hubo cambios.
        return res.status(200).send({
          status: "success",
          mensaje: "No se realizaron cambios en la incidencia.",
        });
      }

      // Devolvemos success si la actualización se realizó correctamente
      return res.status(200).send({
        status: "success",
        mensaje: "Incidencia actualizada correctamente.",
      });
    } catch (err) {
      console.error(err);
      return res.status(500).send({
        status: "error",
        mensaje: "Error en el servidor al actualizar la incidencia.",
      });
    }
  },
};

module.exports = incidenciaController;
