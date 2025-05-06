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
        Review: {
          type: 'object',
          properties: {
            id_reviews: { type: 'string', format: 'uuid', description: 'ID único de la reseña' },
            user_id: { type: 'string', format: 'uuid', description: 'ID del usuario que deja la reseña' },
            product_id: { type: 'string', format: 'uuid', description: 'ID del producto reseñado' },
            comment: { type: 'string', description: 'Comentario del usuario' },
            rating: { type: 'integer', minimum: 1, maximum: 5, description: 'Calificación (1-5 estrellas)' },
            created_at: { type: 'string', format: 'date-time', description: 'Fecha de creación de la reseña' }
          },
          required: ['user_id', 'product_id', 'comment', 'rating']
        },
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
        },
        PaymentIntentRequest: {
          type: 'object',
          properties: {
            amount: {
              type: 'number',
              description: 'Monto en centavos (ej. 1000 = $10.00)'
            },
            currency: {
              type: 'string',
              default: 'mxn',
              description: 'Moneda (por defecto mxn)'
            },
            user_id: {
              type: 'string',
              description: 'ID del usuario autenticado'
            }
          },
          required: ['amount', 'user_id']
        },
        CheckoutRequest: {
          type: 'object',
          properties: {
            cart: {
              type: 'array',
              items: { type: 'object' },
              description: 'Array de productos en el carrito'
            },
            shippingAddress: {
              type: 'string',
              description: 'Dirección de envío'
            },
            paymentMethod: {
              type: 'string',
              description: 'Método de pago (ej. card)'
            },
            stripePaymentId: {
              type: 'string',
              description: 'ID del pago en Stripe'
            },
            amount: {
              type: 'number',
              description: 'Monto total de la orden'
            },
            currency: {
              type: 'string',
              description: 'Moneda'
            },
            receiptUrl: {
              type: 'string',
              description: 'URL del recibo de Stripe'
            },
            stripeEventData: {
              type: 'object',
              description: 'Datos adicionales del evento de Stripe (opcional)'
            }
          },
          required: ['cart', 'shippingAddress', 'paymentMethod', 'stripePaymentId', 'amount', 'currency']
        },
      }
    },
    paths: {
      '/api/reviews': {
        post: {
          tags: ['Reviews'],
          summary: 'Crear una nueva reseña',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user_id: { type: 'string', format: 'uuid' },
                    product_id: { type: 'string', format: 'uuid' },
                    comment: { type: 'string' },
                    rating: { type: 'integer', minimum: 1, maximum: 5 }
                  },
                  required: ['user_id', 'product_id', 'comment', 'rating']
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Reseña creada exitosamente',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Review' }
                }
              }
            },
            400: { description: 'Error de validación o de base de datos' }
          }
        }
      },
      '/api/reviews/product/{productId}': {
        get: {
          tags: ['Reviews'],
          summary: 'Obtener todas las reseñas de un producto',
          parameters: [
            { name: 'productId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'ID del producto' }
          ],
          responses: {
            200: {
              description: 'Lista de reseñas del producto',
              content: {
                'application/json': {
                  schema: { type: 'array', items: { $ref: '#/components/schemas/Review' } }
                }
              }
            },
            400: { description: 'Error al consultar reseñas' }
          }
        }
      },
      '/api/reviews/user/{userId}': {
        get: {
          tags: ['Reviews'],
          summary: 'Obtener todas las reseñas de un usuario',
          parameters: [
            { name: 'userId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'ID del usuario' }
          ],
          responses: {
            200: {
              description: 'Lista de reseñas del usuario',
              content: {
                'application/json': {
                  schema: { type: 'array', items: { $ref: '#/components/schemas/Review' } }
                }
              }
            },
            400: { description: 'Error al consultar reseñas' }
          }
        }
      },
      '/api/reviews/{id_reviews}': {
        put: {
          tags: ['Reviews'],
          summary: 'Actualizar una reseña',
          parameters: [
            { name: 'id_reviews', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'ID de la reseña' }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    comment: { type: 'string' },
                    rating: { type: 'integer', minimum: 1, maximum: 5 }
                  },
                  required: ['comment', 'rating']
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Reseña actualizada exitosamente',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Review' }
                }
              }
            },
            400: { description: 'Error al actualizar reseña' },
            404: { description: 'Reseña no encontrada' }
          }
        },
        delete: {
          tags: ['Reviews'],
          summary: 'Eliminar una reseña',
          parameters: [
            { name: 'id_reviews', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'ID de la reseña' }
          ],
          responses: {
            200: { description: 'Reseña eliminada exitosamente' },
            400: { description: 'Error al eliminar reseña' },
            404: { description: 'Reseña no encontrada' }
          }
        }
      },
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
