"use strict";

var app = require("./app");
var port = 3000;
var sequelize = require("./database/connection"); // Asegúrate de que esta ruta es correcta

// Conectar a la base de datos y sincronizar los modelos
sequelize.authenticate()
  .then(() => {
   console.log("La conexión a la base de datos se ha realizado correctamente!");

    // Opcional: sincronizar modelos con la base de datos
    
  })
  .then(() => {
    // Crear servidor y escuchar peticiones HTTP
    app.listen(port, '0.0.0.0', () => {
      console.log(`Servidor corriendo en http://0.0.0.0:${port}`);
    });
  })
  .catch(err => {
    console.error("Error al conectar con la base de datos:", err);
  });