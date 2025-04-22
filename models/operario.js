"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../database/connection"); // Archivo de configuración de la conexión a MySQL

const Operario = sequelize.define("Operario", {
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
  },
  verificado: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  rol_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
        model: 'rol', 
        key: 'id'
      }
  },
  departamento_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
        model: 'departamento',
        key: 'id'
      }
  }


}, {
  tableName: 'operario',
  timestamps: false, 
});

const Departamento = require("./departamento");
const Rol = require("./rol");

Operario.belongsTo(Departamento, {
  foreignKey: "departamento_id",
  as: "departamento",
});
Operario.belongsTo(Rol, { foreignKey: "rol_id", as: "rol" });



module.exports = Operario;