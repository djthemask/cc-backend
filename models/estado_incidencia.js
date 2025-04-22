"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../database/connection"); // Archivo de configuración de la conexión a MySQL

const Estado_Incidencia = sequelize.define("Estado_Incidencia", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  tableName: 'estado_incidencia',
  timestamps: false, 
});

module.exports = Estado_Incidencia;