"use strict";

const { DataTypes } = require("sequelize");
const sequelize = require("../database/connection"); // Archivo de configuración de la conexión a MySQL

const Comentario_Operario = sequelize.define(
  "Comentario_Operario",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    contenido: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    operario_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "operario",
        key: "id",
      },
    },
    incidencia_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "incidencia",
        key: "id",
      },
    },
  },
  {
    tableName: "comentario_operario",
    timestamps: false,
  }
  
);

// Importar el modelo Operario 
const Operario = require("../models/operario");

Comentario_Operario.belongsTo(Operario, {
  foreignKey: "operario_id",
  as: "operario",
});


module.exports = Comentario_Operario;
