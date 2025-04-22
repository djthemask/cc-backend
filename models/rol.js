"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../database/connection"); // Archivo de configuración de la conexión a MySQL

const Rol = sequelize.define("Rol", {
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
  tableName: 'rol',
  timestamps: false, 
});

module.exports = Rol;