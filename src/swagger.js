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
        },
        Reservacion: {
          type: 'object',
          properties: {
            nombre_completo: { type: 'string' },
            correo_electronico: { type: 'string' },
            fecha_visita: { type: 'string', format: 'date' },
            hora_visita: { type: 'string' },
            numero_personas: { type: 'integer' },
            notas_adicionales: { type: 'string' },
            telefono: { type: 'string', minLength: 10, maxLength: 10, description: 'Teléfono a 10 dígitos' }
          },
          required: [
            'nombre_completo',
            'correo_electronico',
            'fecha_visita',
            'hora_visita',
            'numero_personas',
            'telefono'
          ]
        }
      }
    },
    paths: {
      '/api/reservaciones': {
        post: {
          tags: ['Reservaciones'],
          summary: 'Crear una nueva reservación',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Reservacion' }
              }
            }
          },
          responses: {
            201: {
              description: 'Reservación creada exitosamente'
            },
            500: {
              description: 'Error interno del servidor'
            }
          }
        },
        get: {
          tags: ['Reservaciones'],
          summary: 'Obtener todas las reservaciones',
          responses: {
            200: {
              description: 'Lista de reservaciones',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Reservacion' }
                  }
                }
              }
            },
            500: {
              description: 'Error interno del servidor'
            }
          }
        }
      },
      '/api/reservaciones/{id}': {
        get: {
          tags: ['Reservaciones'],
          summary: 'Obtener una reservación por ID',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' },
              description: 'ID de la reservación'
            }
          ],
          responses: {
            200: {
              description: 'Reservación encontrada',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Reservacion' }
                }
              }
            },
            404: {
              description: 'Reservación no encontrada'
            },
            500: {
              description: 'Error interno del servidor'
            }
          }
        },
        put: {
          tags: ['Reservaciones'],
          summary: 'Actualizar una reservación por ID',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' },
              description: 'ID de la reservación'
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Reservacion' }
              }
            }
          },
          responses: {
            200: {
              description: 'Reservación actualizada exitosamente'
            },
            404: {
              description: 'Reservación no encontrada'
            },
            500: {
              description: 'Error interno del servidor'
            }
          }
        },
        delete: {
          tags: ['Reservaciones'],
          summary: 'Eliminar una reservación por ID',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' },
              description: 'ID de la reservación'
            }
          ],
          responses: {
            200: {
              description: 'Reservación eliminada exitosamente'
            },
            404: {
              description: 'Reservación no encontrada'
            },
            500: {
              description: 'Error interno del servidor'
            }
          }
        }
      },
    },
    security: [
      { bearerAuth: [] }
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = { swaggerUi, swaggerSpec };
