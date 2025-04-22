"use strict";

const jwt = require("jsonwebtoken");

// Middleware encargado de proteger rutas verificando que la solicitud contenga un token valido.

module.exports = (req, res, next) => {
  // Leer el header (authorization) de la petición HTTP
  const authHeader = req.headers.authorization;
  // Si no existe el header, error 401 (no autorizado). Indicamos que el token es obligatorio
  if (!authHeader)
    return res
      .status(401)
      .send({ status: "error", mensaje: "Token requerido" });

  //Extraemos el token del header. Se espera el formato "Bearer <token>"
  const token = authHeader.split(" ")[1];
  // Verificamos el token con jwt.verify
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    // Si nos devuelve un error devolvemos un mensaje de error. (401 no autorizado)
    if (err)
      return res
        .status(401)
        .send({ status: "error", mensaje: "Token inválido o expirado" });
    // Si el token es válido, guardar el payload decodificado en req.user
    req.user = decoded;
    // Llamar next() para continuar -> middleware o controlador
    next();
  });
};
