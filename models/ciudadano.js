"use strict";

const { DataTypes } = require("sequelize");
const sequelize = require("../database/connection"); // Archivo de configuración de la conexión a MySQL

const Ciudadano = sequelize.define("Ciudadano", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  apellidos: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dni: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  f_nacimiento: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  telefono: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  tableName: 'ciudadano',
  timestamps: false, 
});

module.exports = Ciudadano;