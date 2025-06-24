const express = require('express'); 
const router = express.Router();
const swaggerUi = require('swagger-ui-express'); // Import Swagger UI middleware
const fs = require('fs'); 
const path = require('path');

// Read and parse OpenAPI JSON file
const swaggerDocument = JSON.parse(fs.readFileSync(path.join(__dirname, '../docs/openapi.json'), 'utf8'));

// Setup Swagger UI middleware
router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerDocument));

module.exports = router; 