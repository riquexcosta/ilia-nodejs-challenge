const express = require('express');
const cors = require('cors');
const internalRoutes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

// Internal routes (service-to-service communication)
app.use('/', internalRoutes);

// Centralized error handler
app.use(errorHandler);

module.exports = app;

