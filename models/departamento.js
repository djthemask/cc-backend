"use strict";

const { DataTypes } = require("sequelize");
const sequelize = require("../database/connection"); // Archivo de configuración de la conexión a MySQL

const Departamento = sequelize.define("Departamento", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  tableName: 'departamento',
  timestamps: false, 
});

module.exports = Departamento;