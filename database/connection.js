"use strict";

require('dotenv').config({ path: 'confidential.env' }); // Carga las variables de entorno desde .env

const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: "mysql", // o el dialecto que estés usando
  logging: false,
  // Otras opciones que necesites...
  
});

  module.exports = sequelize;