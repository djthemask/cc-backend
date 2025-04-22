"use strict";

// Validador de información (EJ. Comprobar si está vacío.)
const validator = require("validator");
const Ciudadano = require("../models/ciudadano");
// Encriptación de Password
const bcrypt = require("bcrypt");
// Carga las variables de entorno desde .env
require("dotenv").config({ path: "confidential.env" });
// Import Jason Web Token
const jwt = require("jsonwebtoken");

//Capitaliza todas las primeras letras de un string utilizando el separador de un espacio(Para por ejemplo el apellido)
function capitalize(str) {
  if (!str) return "";
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

const ciudadanoController = {
  // METODO PARA EL REGISTRO DE UN CIUDADANO
  registro: async (req, res) => {
    // Guardado de información de los parametros recibidos por el formulario.
    const params = req.body;

    // Declaramos todos los valores del modelo de un ciudadano.
    let validateNombre,
      validateApellidos,
      validateDni,
      validateFnacimiento,
      validateTelefono,
      validateEmail,
      validatePassword,
      validateSecondPassword;

    // Comprobación de que no hay datos vacíos
    try {
      validateNombre = !validator.isEmpty(params.nombre);
      validateApellidos = !validator.isEmpty(params.apellidos);
      validateDni = !validator.isEmpty(params.dni);
      validateFnacimiento = !validator.isEmpty(params.f_nacimiento);
      validateTelefono = !validator.isEmpty(params.telefono);
      validateEmail =
        !validator.isEmpty(params.email) && validator.isEmail(params.email);
      validatePassword = !validator.isEmpty(params.password);
      validateSecondPassword = !validator.isEmpty(params.secondPassword);

      // Mensaje de error si se han encontrado datos vacíos en el formulario.
    } catch (err) {
      return res.status(400).send({
        status: "error",
        mensaje: "No se han rellenado todos los campos requeridos.",
      });
    }

    // Si todos los campos tienen un valor asignado después de la comprobación
    if (
      validateNombre &&
      validateApellidos &&
      validateDni &&
      validateFnacimiento &&
      validateTelefono &&
      validateEmail &&
      validatePassword
    ) {
      try {
        // Comprobamos si ya existe un ciudadano con el mismo email, Telefono o DNI en BBDD
        const existingEmail = await Ciudadano.findOne({
          where: { email: params.email },
        });

        if (existingEmail) {
          return res.status(400).send({
            status: "error",
            mensaje: "Ya existe un usuario con el email introducido.",
          });
        }
        const existingPhone = await Ciudadano.findOne({
          where: { telefono: params.telefono },
        });

        if (existingPhone) {
          return res.status(400).send({
            status: "error",
            mensaje: "Ya existe un usuario con el teléfono introducido.",
          });
        }
        const existingDni = await Ciudadano.findOne({
          where: { dni: params.dni },
        });

        if (existingDni) {
          return res.status(400).send({
            status: "error",
            mensaje: "Ya existe un usuario con el DNI introducido.",
          });
        }

        // Comprobamos si el usuario tiene una contraseña de al menos 6 caracteres
        if (params.password.length < 6) {
          return res.status(400).send({
            status: "error",
            mensaje: "Tu contraseña debe tener al menos 6 caracteres",
          });
        }

        // Comprobamos que la contraseña y la confirmación coinciden
        if (params.password !== params.secondPassword) {
          return res.status(400).send({
            status: "error",
            mensaje: "Las contraseñas introducidas no coinciden.",
          });
        }

        // Encriptar la contraseña antes de guardarla en BBDD
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(params.password, saltRounds);

        // Asignamos los datos a los campos correctos definidos en BBDD
        const ciudadano = await Ciudadano.create({
          // Utilizamos la función capitalize para que las primeras letras sean mayúsculas para y guardarlas en BBDD con formato.
          nombre: capitalize(params.nombre),
          apellidos: capitalize(params.apellidos),
          dni: params.dni,
          f_nacimiento: params.f_nacimiento,
          telefono: params.telefono,
          email: params.email,
          // OJO hashedPassword no params.password!!!!
          password: hashedPassword,
        });
        return res.status(200).send({
          status: "success",
          mensaje:
            "El usuario se ha guardado correctamente en la base de datos.",
          ciudadano,
        });
      } catch (err) {
        console.error(err);
        return res.status(500).send({
          status: "error",
          mensaje:
            "El usuario no se ha podido guardar debido a un error en el servidor",
        });
      }
    }
  },
  // Método para manejar el login
  login: async (req, res) => {
    // Guardado de información de los parametros recibidos por el formulario.
    const params = req.body;
    // Variables email & contraseña
    let validateEmail, validatePassword;
    // Validar que se hayan enviado email y contraseña y que no estén vacíos
    try {
      validateEmail = !validator.isEmpty(params.email);
      validatePassword = !validator.isEmpty(params.password);
      // Se ha detectado campos vacíos? ->
    } catch (err) {
      return res.status(400).send({
        status: "error",
        mensaje: "Por favor introduce un email y una contraseña.",
      });
    }

    // Validar que el email tenga un formato correcto
    if (!validator.isEmail(params.email)) {
      return res.status(400).send({
        status: "error",
        mensaje: "El email introducido és invalido.",
      });
    }

    try {
      // Buscar el usuario por email
      const ciudadano = await Ciudadano.findOne({
        where: { email: params.email },
      });
      // Comprobamos que el usuario con el email introducido existe en BBDD
      if (!ciudadano) {
        return res.status(400).send({
          status: "error",
          mensaje: "Usuario o contraseña incorrecta.",
        });
      }

      // Validamos contraseña. En BCRYPT no desencriptamos sino comparamos para ver si coinciden.
      const validPassword = await bcrypt.compare(
        params.password,
        ciudadano.password
      );
      // Si no existe el ciudadano o la contraseña no coincide -> ( Solo se ejecuta si se rellenan todos los campos. )
      if (!ciudadano || !validPassword) {
        return res.status(400).send({
          status: "error",
          mensaje: "La contraseña introducida es incorrecta.",
        });
      }

      // En caso de que todo lo anterior sea correcto procedemos a crear la sesión.
      // Generamos un token JWT utilizando la clave secreta almacenada en variable de entorno (JWT_SECRET)
      const token = jwt.sign(
        // Guardamos en el token el ID, nombre y apellidos.
        // Lo hacemos para no tener que consultar a BBDD cada vez el nombre cuando lo enseñamos en el header.
        // Se restringe solo a estos datos en caso de robo de JWT por motivos de seguridad a solo información estrictamente necesaria.
        {
          id: ciudadano.id,
          nombre: ciudadano.nombre,
          apellidos: ciudadano.apellidos,
        },
        process.env.JWT_SECRET,
        // Si se detecta un token inválido eliminar automaticamente el token cerrando la sesión del usuario.
        // Agregado en alfa v2
        { expiresIn: "24h" } // El token tendrá una validez de 24 horas
      );

      // Realizamos el Login
      return res.status(200).send({
        status: "success",
        mensaje: "Login exitoso.",
        token,
        ciudadano,
      });

      // Control error servidor
    } catch (err) {
      console.error(err);
      return res.status(500).send({
        status: "error",
        mensaje: "Error en el login, inténtalo de nuevo.",
      });
    }
  },
};

module.exports = ciudadanoController;
