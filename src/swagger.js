// src/swagger.js
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CasaBlanca API',
      version: '1.0.0',
      description: 'Documentación de la API del Coffee Shop',
    },
    servers: [
      { url: 'http://localhost:5050' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        CartTempItem: {
          type: 'object',
          properties: {
            id_cart_temp: { type: 'string', format: 'uuid', description: 'ID único del producto en el carrito temporal' },
            session_id: { type: 'string', description: 'Identificador de la sesión del visitante' },
            product_id: { type: 'string', format: 'uuid', description: 'ID del producto' },
            product_name: { type: 'string', description: 'Nombre del producto' },
            product_image: { type: 'string', description: 'URL de la imagen del producto' },
            product_price: { type: 'number', format: 'float', description: 'Precio del producto' },
            quantity: { type: 'integer', description: 'Cantidad de productos' },
            added_at: { type: 'string', format: 'date-time', description: 'Fecha de agregado al carrito (UTC)' }
          },
          required: ['id_cart_temp', 'session_id', 'product_id', 'product_name', 'product_price', 'quantity', 'added_at']
        }
      }
    },
    security: [
      { bearerAuth: [] }
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = { swaggerUi, swaggerSpec };
