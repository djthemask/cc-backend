"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../database/connection"); // Archivo de configuración de la conexión a MySQL



const Incidencia = sequelize.define(
  "Incidencia",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    imagen: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    video: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    fecha_resolucion: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // Despues de V2.0 ya no es una foreign key de la tabla de ciudadanos. (Antiguamente "ciudadano_id")
    // Hemos hecho este cambio para que un operario también puede crear una incidencia
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    departamento_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "departamento",
        key: "id",
      },
    },
    estado_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "estado",
        key: "id",
      },
    },
    // Quitando la foreign key controlamos a nivel backend si la incidencia pertenece a un ciudadano o a un operario.
    tipo_usuario: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "incidencia",
    timestamps: false,
  }
);

const Departamento = require("./departamento");
const Estado = require("./estado_incidencia");
const ComentarioOperario = require("./comentario_operario");


Incidencia.belongsTo(Departamento, {
  foreignKey: "departamento_id",
  as: "departamento",
});
Incidencia.belongsTo(Estado, { foreignKey: "estado_id", as: "estado" });
Incidencia.hasMany(ComentarioOperario, { foreignKey: "incidencia_id", as: "comentarios" });

module.exports = Incidencia;
