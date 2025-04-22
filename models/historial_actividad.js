"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../database/connection"); // Archivo de configuración de la conexión a MySQL

const Historial_Actividad = sequelize.define("Historial_Actividad", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  accion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  imagen: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  incidencia_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
        model: 'incidencia', 
        key: 'id'
      }
  },
  operario_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
        model: 'operario', 
        key: 'id'
      }
  }
}, {
  tableName: 'historial_actividad',
  timestamps: false, 
});

module.exports = Historial_Actividad;