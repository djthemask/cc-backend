"use strict";
// Validador de información (EJ. Comprobar si está vacío.)
const validator = require("validator");
// Importamos modelos
const Operario = require("../models/operario");
const Departamento = require("../models/departamento");
// Encriptación y comparación de Password
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
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

// Objeto controlador que contiene todos los métodos relacionados con "Operario"
const operarioController = {
  // METODO PARA EL REGISTRO DE UN OPERARIO
  registro: async (req, res) => {
    // Guardado de información de los parametros recibidos por el formulario.
    const params = req.body;

    // Declaramos todos los valores del modelo de un operario.
    let validateNombre,
      validateApellidos,
      validateTelefono,
      validateEmail,
      validatePassword,
      validateSecondPassword,
      validateDepartamento;

    try {
      // Comprobación de que no hay datos vacíos y si  mail es válido
      validateNombre = !validator.isEmpty(params.nombre);
      validateApellidos = !validator.isEmpty(params.apellidos);
      validateTelefono = !validator.isEmpty(params.telefono);
      validateEmail =
        !validator.isEmpty(params.email) && validator.isEmail(params.email);
      validatePassword = !validator.isEmpty(params.password);
      validateSecondPassword = !validator.isEmpty(params.secondPassword);
      validateDepartamento = !validator.isEmpty(params.departamento);

      // Mensaje de error si se han encontrado datos vacíos en el formulario.
    } catch (err) {
      return res.status(400).send({
        status: "error",
        mensaje: "No se han rellenado todos los campos requeridos.",
      });
    }

    try {
      const existingEmail = await Operario.findOne({
        where: { email: params.email },
      });
      // Comprobamos si ya existe un operario con el mismo email o telefono
      if (existingEmail) {
        return res.status(400).send({
          status: "error",
          mensaje: "Ya existe un operario con ese email.",
        });
      }
      // Luego, comprobamos si ya existe un operario con el mismo teléfono.
      const existingPhone = await Operario.findOne({
        where: { telefono: params.telefono },
      });
      // Comprobamos si ya existe un operario con el mismo email o telefono
      if (existingPhone) {
        return res.status(400).send({
          status: "error",
          mensaje: "Ya existe un operario con ese email.",
        });
      }

      // Comprobamos si el usuario tiene una contraseña de al menos 6 caracteres
      if (params.password.length < 6) {
        return res.status(400).send({
          status: "error",
          mensaje: "La contraseña debe tener al menos 6 caracteres.",
        });
      }

      // Comprobamos que la contraseña y la confirmación coinciden
      if (params.password !== params.secondPassword) {
        return res.status(400).send({
          status: "error",
          mensaje: "Las contraseñas no coinciden.",
        });
      }

      // Buscamos el departamento en la base de datos.
      const departamento = await Departamento.findOne({
        where: { nombre: params.departamento },
      });
      // Si no se encuentra el departamento, se devuelve un error 400.
      if (!departamento) {
        return res.status(400).send({
          status: "error",
          mensaje: "El departamento seleccionado no existe.",
        });
      }

      // Encriptar la contraseña antes de guardarla en BBDD
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(params.password, saltRounds);

      // Asignamos los datos a los campos correctos definidos en BBDD
      const nuevoOperario = await Operario.create({
        // Utilizamos la función capitalize para que las primeras letras sean mayúsculas para y guardarlas en BBDD con formato.
        nombre: capitalize(params.nombre),
        apellidos: capitalize(params.apellidos),
        email: params.email,
        telefono: params.telefono,
        // OJO hashedPassword no params.password!!!!
        password: hashedPassword,
        departamento_id: departamento.id, // foreign key del departamento
        rol_id: 1, // Se asigna el rol por defecto "operario"
        verificado: 0, // Inicialmente, el operario no está verificado
      });

      // Si todo sale bien, se envía una respuesta exitosa con los datos del operario recién creado.
      return res.status(200).send({
        status: "success",
        mensaje:
          "El operario se ha guardado correctamente en la base de datos.",
        operario: nuevoOperario,
      });
    } catch (err) {
      // Server error, se envía una respuesta 500.
      return res.status(500).send({
        status: "error",
        mensaje:
          "El operario no se ha podido guardar debido a un error en el servidor",
      });
    }
  },

  // Método para manejar el login
  login: async (req, res) => {
    // Guardado de información de los parametros recibidos por el formulario.
    const params = req.body;

    // Variables email & contraseña

    let validarEmail, validarPassword;
    // Validar que se hayan enviado email  y contraseña y que no estén vacíos

    try {
      validarEmail = !validator.isEmpty(params.email);
      validarPassword = !validator.isEmpty(params.password);
      // Se ha detectado campos vacíos? ->
    } catch {
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
      const operario = await Operario.findOne({
        where: { email: params.email },
      });
      // Comprobamos que el usuario con el email introducido existe en BBDD
      if (!operario) {
        return res.status(400).send({
          status: "error",
          mensaje: "Usuario o contraseña incorrecta.",
        });
      }

      // Validamos contraseña. En BCRYPT no desencriptamos sino comparamos para ver si coinciden.
      const passwordCorrecta = await bcrypt.compare(
        params.password,
        operario.password
      );
      // Si no existe el ciudadano o la contraseña no coincide -> ( Solo se ejecuta si se rellenan todos los campos. )

      if (!passwordCorrecta) {
        return res.status(400).send({
          status: "error",
          mensaje: "La contraseña introducida es incorrecta.",
        });
      }

      // En caso de que todo lo anterior sea correcto procedemos a crear la sesión.
      // Generamos un token JWT utilizando la clave secreta almacenada en variable de entorno (JWT_SECRET)
      const token = jwt.sign(
        // Guardamos en el token el ID, nombre, apellidos, rol y verificado.
        // Lo hacemos para no tener que consultar a BBDD cada vez el nombre cuando lo enseñamos en el header.
        // Se restringe solo a estos datos en caso de robo de JWT por motivos de seguridad a solo información estrictamente necesaria.
        {
          id: operario.id,
          nombre: operario.nombre,
          apellidos: operario.apellidos,
          rol: operario.rol_id,
          verificado: operario.verificado,
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
        operario,
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

  // Método para obtener un listado de todos los operarios registrados en el sistema
  getOperarios: async (req, res) => {
    try {
      // Solo selecionamos los campos que nos interesan. Evitamos por ejemplo el teléfono, contraseña etc...
      // Esto lo hacemos para mejorar el rendimiento y gestionar los recursos de forma eficiente.
      // También es un requisito si en la misma consulta queremos hacer una join.
      const operarios = await Operario.findAll({
        attributes: [
          "id",
          "nombre",
          "apellidos",
          "email",
          "rol_id",
          "verificado",
        ],
        // Incluimos también el departamento al que pertenece el operario mediante una Join
        // Esto evita que luego tengamos que hacer otra consulta a la API para obtener el nombre del departamento
        include: {
          // Del departamento...
          model: Departamento,
          // Utilizando el alias definido en el modelo.
          as: "departamento",
          // Solo solicitamos el nombre del departamento.
          attributes: ["nombre"],
        },
      });

      // Creamos un array con map para guardar los operarios.
      const resultado = operarios.map((operario) => ({
        id: operario.id,
        nombre: operario.nombre,
        apellidos: operario.apellidos,
        email: operario.email,
        // En departamento guardamos el nombre del departamento
        departamento: operario.departamento.nombre,
        rol_id: operario.rol_id,
        // Realizamos una conversión a boolean para confirmar si el usuario está o no verificado. (Codigo mas intuitivo)
        verificado: Boolean(operario.verificado),
      }));

      // Si hemos obtenido operarios correctamente devolvemos una respuesta exitosa. Devolvemos los operarios obtenidos
      return res.status(200).send({
        status: "success",
        mensaje: "Operarios obtenidos correctamente.",
        operarios: resultado,
      });
    } catch (err) {
      // En caso de que no, devolvemos un error al obtener los operarios.
      console.error(err);
      return res.status(500).send({
        status: "error",
        mensaje: "Error en el servidor al obtener operarios.",
      });
    }
  },

  // Método para obtener un operario en concreto a partir de su ID.
  getOperario: async (req, res) => {
    // Obtenemos el ID del operario que recibiremos por parámetro a través de la URL
    const { id } = req.params;
    try {
      // Solo selecionamos los campos que nos interesan. Evitamos por ejemplo el teléfono, contraseña etc...
      // Esto lo hacemos para mejorar el rendimiento y gestionar los recursos de forma eficiente.
      const operario = await Operario.findOne({
        attributes: [
          "id",
          "nombre",
          "apellidos",
          "email",
          "rol_id",
          "verificado",
        ],

        // Incluimos también el departamento al que pertenece el operario.
        include: {
          // Del departamento...
          model: Departamento,
          // Utilizando el alias definido en el modelo.
          as: "departamento",
          // Solicitamos el Nombre y el ID del departamento.
          attributes: ["id", "nombre"],
        },
        where: { id },
      });

      // En caso de no encontrar el operario con el id indicado
      if (!operario) {
        return res.status(404).send({
          status: "error",
          mensaje: "Operario no encontrado.",
        });
      }

      // Se formatea el objeto operario para incluir el departamento completo y convertir "verificado" a booleano
      const operarioFormateado = {
        id: operario.id,
        nombre: operario.nombre,
        apellidos: operario.apellidos,
        email: operario.email,
        // Departamento contiene ( id, nombre )
        departamento: operario.departamento,
        rol_id: operario.rol_id,
        // Realizamos una conversión a boolean para confirmar si el usuario está o no verificado. (Codigo mas intuitivo)
        verificado: Boolean(operario.verificado),
      };

      // Si hemos obtenido el operario correctamente devolvemos una respuesta exitosa. Devolvemos el operario obtenido
      return res.status(200).send({
        status: "success",
        operario: operarioFormateado,
      });
    } catch (err) {
      console.error(err);
      // En caso de que no devolvemos un error al obtener los operarios.
      return res.status(500).send({
        status: "error",
        mensaje: "Error en el servidor al obtener operario.",
      });
    }
  },

  // Método para editar la información de un operario a partir de su ID.
  editarOperario: async (req, res) => {
    // Se extrae el id desde la url
    const { id } = req.params;
    // Se extraen los datos enviados en el body.
    const { departamento, rol, verificado } = req.body;
    // Aseguramos que el id del departamento es un int y no un string. Indicamos base10
    const departamentoId = parseInt(departamento, 10);

    try {
      // Verifica que el operario exista usando la clave primaria
      const operario = await Operario.findByPk(id);
      // En caso de no encontrar el operario
      if (!operario) {
        return res.status(404).send({
          status: "error",
          mensaje: "Operario no encontrado.",
        });
      }

      // Busca el departamento por id (id ya parseado a integer )
      const departamentoUd = await Departamento.findByPk(departamentoId);
      // En caso de bad request
      if (!departamentoUd) {
        return res.status(400).send({
          status: "error",
          mensaje: "El departamento seleccionado no existe.",
        });
      }

      // Objeto que asigna un valor numérico a cada rol.
      // Aqui podemos agregar mas roles si en el futuro se crean más
      const roles = {
        administrador: 2,
        operario: 1,
      };
      // Buscamos en el objeto roles el número (ID) del rol o por defecto 1 (operario)
      const rol_id = roles[rol] || 1;

      // Asignamos un valor numérico a cada rol 1 (verificado) o 0 (no-verificado)
      const verificadoVal = verificado === "verificado" ? 1 : 0;

      // Actualizamos el operario con los nuevos valores
      await Operario.update(
        {
          departamento_id: departamentoId,
          rol_id,
          verificado: verificadoVal,
        },
        { where: { id } }
      );

      // Operario actualizado correctamente
      return res.status(200).send({
        status: "success",
        mensaje: "Operario actualizado correctamente.",
      });
    } catch (err) {
      console.error(err);
      // Error al actualizar el operario
      return res.status(500).send({
        status: "error",
        mensaje: "Error actualizando operario.",
      });
    }
  },
};

module.exports = operarioController;
