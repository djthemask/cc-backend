'use strict'

// Cargamos Modulos de node para crear servidor
var express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Ejecutamos Express (http)
var app = express();
app.set('trust proxy', 1);

// Cargamos ficheros Rutas
var userRoutes = require('./routes/ciudadano');
var incidenciaRoutes = require('./routes/incidencia');
var opsRoutes = require('./routes/operario');
var dptRoutes = require('./routes/departamento');
var cmtRoutes = require('./routes/comentario');
var estRoutes = require('./routes/estado');


// Middlewares
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// CORS - security diff dominios
// app.use(cors()); (Inecesario manejamos por proxy NGINX en TEST-PROD)


// Añadir prefijos a rutas / Cargar rutas
app.use('/api', userRoutes)
app.use('/api', incidenciaRoutes)
app.use('/api', opsRoutes)
app.use('/api', dptRoutes)
app.use('/api', cmtRoutes)
app.use('/api', estRoutes)
app.use('/upload', express.static('upload'));

// Exportamos el modulo (Fichero actual-)
module.exports = app;