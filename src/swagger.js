// src/swagger.js
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "CasaBlanca API",
      version: "1.0.0",
      description: "Documentación de la API del Coffee Shop",
    },
    servers: [{ url: "http://localhost:5050" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        CartTempItem: {
          type: "object",
          properties: {
            id_cart_temp: {
              type: "string",
              format: "uuid",
              description: "ID único del producto en el carrito temporal",
            },
            session_id: {
              type: "string",
              description: "Identificador de la sesión del visitante",
            },
            product_id: {
              type: "string",
              format: "uuid",
              description: "ID del producto",
            },
            product_name: {
              type: "string",
              description: "Nombre del producto",
            },
            product_image: {
              type: "string",
              description: "URL de la imagen del producto",
            },
            product_price: {
              type: "number",
              format: "float",
              description: "Precio del producto",
            },
            quantity: { type: "integer", description: "Cantidad de productos" },
            added_at: {
              type: "string",
              format: "date-time",
              description: "Fecha de agregado al carrito (UTC)",
            },
          },
          required: [
            "id_cart_temp",
            "session_id",
            "product_id",
            "product_name",
            "product_price",
            "quantity",
            "added_at",
          ],
        },
        Reservacion: {
          type: "object",
          properties: {
            nombre_completo: { type: "string" },
            correo_electronico: { type: "string" },
            fecha_visita: { type: "string", format: "date" },
            hora_visita: { type: "string" },
            numero_personas: { type: "integer" },
            notas_adicionales: { type: "string" },
            telefono: {
              type: "string",
              minLength: 10,
              maxLength: 10,
              description: "Teléfono a 10 dígitos",
            },
          },
          required: [
            "nombre_completo",
            "correo_electronico",
            "fecha_visita",
            "hora_visita",
            "numero_personas",
            "telefono",
          ],
        },
        PaymentIntentRequest: {
          type: "object",
          properties: {
            amount: {
              type: "number",
              description: "Monto en centavos (ej. 1000 = $10.00)",
            },
            currency: {
              type: "string",
              default: "mxn",
              description: "Moneda (por defecto mxn)",
            },
            user_id: {
              type: "string",
              description: "ID del usuario autenticado",
            },
          },
          required: ["amount", "user_id"],
        },
        CheckoutRequest: {
          type: "object",
          properties: {
            cart: {
              type: "array",
              items: { type: "object" },
              description: "Array de productos en el carrito",
            },
            shippingAddress: {
              type: "string",
              description: "Dirección de envío",
            },
            paymentMethod: {
              type: "string",
              description: "Método de pago (ej. card)",
            },
            stripePaymentId: {
              type: "string",
              description: "ID del pago en Stripe",
            },
            amount: {
              type: "number",
              description: "Monto total de la orden",
            },
            currency: {
              type: "string",
              description: "Moneda",
            },
            receiptUrl: {
              type: "string",
              description: "URL del recibo de Stripe",
            },
            stripeEventData: {
              type: "object",
              description: "Datos adicionales del evento de Stripe (opcional)",
            },
          },
          required: [
            "cart",
            "shippingAddress",
            "paymentMethod",
            "stripePaymentId",
            "amount",
            "currency",
          ],
        },
        // Nuevos schemas para estadísticas
        SalesSummary: {
          type: "object",
          properties: {
            totalSales: { type: "number", description: "Ventas totales" },
            monthlySales: {
              type: "number",
              description: "Ventas del último mes",
            },
            totalOrders: {
              type: "integer",
              description: "Total de órdenes completadas",
            },
          },
        },
        SalesByPeriod: {
          type: "object",
          properties: {
            period_start: {
              type: "string",
              format: "date-time",
              description: "Inicio del período",
            },
            period_end: {
              type: "string",
              format: "date-time",
              description: "Fin del período",
            },
            total_sales: {
              type: "number",
              description: "Ventas totales en el período",
            },
            order_count: {
              type: "integer",
              description: "Número de órdenes en el período",
            },
          },
        },
        TopProduct: {
          type: "object",
          properties: {
            product_id: {
              type: "string",
              format: "uuid",
              description: "ID del producto",
            },
            total_quantity: {
              type: "integer",
              description: "Cantidad total vendida",
            },
            product: {
              type: "object",
              properties: {
                name: { type: "string", description: "Nombre del producto" },
                image: {
                  type: "string",
                  description: "URL de la imagen del producto",
                },
              },
            },
          },
        },
        CustomerStats: {
          type: "object",
          properties: {
            totalCustomers: {
              type: "integer",
              description: "Total de clientes registrados",
            },
            newCustomers: {
              type: "integer",
              description: "Clientes nuevos este mes",
            },
          },
        },
        ReservationStats: {
          type: "object",
          properties: {
            totalReservations: {
              type: "integer",
              description: "Total de reservaciones",
            },
            monthlyReservations: {
              type: "integer",
              description: "Reservaciones este mes",
            },
          },
        },
        // Esquemas para facturas
        Invoice: {
          type: "object",
          properties: {
            invoiceNumber: {
              type: "string",
              description: "Número único de la factura",
            },
            orderId: {
              type: "string",
              format: "uuid",
              description: "ID de la orden asociada a la factura",
            },
            customerName: {
              type: "string",
              description: "Nombre del cliente",
            },
            customerRfc: {
              type: "string",
              description: "RFC del cliente",
            },
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  productName: {
                    type: "string",
                    description: "Nombre del producto",
                  },
                  quantity: {
                    type: "integer",
                    description: "Cantidad de productos",
                  },
                  unitPrice: {
                    type: "number",
                    description: "Precio unitario",
                  },
                  subtotal: {
                    type: "number",
                    description: "Subtotal (precio * cantidad)",
                  },
                },
              },
              description: "Productos incluidos en la factura",
            },
            subtotal: {
              type: "number",
              description: "Subtotal antes de impuestos",
            },
            tax: {
              type: "number",
              description: "Impuestos (IVA 16%)",
            },
            total: {
              type: "number",
              description: "Total a pagar (subtotal + impuestos)",
            },
            issueDate: {
              type: "string",
              format: "date-time",
              description: "Fecha de emisión de la factura",
            },
            shippingAddress: {
              type: "object",
              properties: {
                line1: { type: "string" },
                line2: { type: "string" },
                city: { type: "string" },
                state: { type: "string" },
                postalCode: { type: "string" },
                country: { type: "string" },
              },
              description: "Dirección de envío",
            },
          },
        },
        EmailRequest: {
          type: "object",
          properties: {
            email: {
              type: "string",
              format: "email",
              description: "Correo electrónico donde enviar la factura (opcional)",
            },
          },
        },
      },
    },
    paths: {
      "/api/reservaciones": {
        post: {
          tags: ["Reservaciones"],
          summary: "Crear una nueva reservación",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Reservacion" },
              },
            },
          },
          responses: {
            201: {
              description: "Reservación creada exitosamente",
            },
            500: {
              description: "Error interno del servidor",
            },
          },
        },
        get: {
          tags: ["Reservaciones"],
          summary: "Obtener todas las reservaciones",
          responses: {
            200: {
              description: "Lista de reservaciones",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Reservacion" },
                  },
                },
              },
            },
            500: {
              description: "Error interno del servidor",
            },
          },
        },
      },
      "/api/reservaciones/{id}": {
        get: {
          tags: ["Reservaciones"],
          summary: "Obtener una reservación por ID",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
              description: "ID de la reservación",
            },
          ],
          responses: {
            200: {
              description: "Reservación encontrada",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Reservacion" },
                },
              },
            },
            404: {
              description: "Reservación no encontrada",
            },
            500: {
              description: "Error interno del servidor",
            },
          },
        },
        put: {
          tags: ["Reservaciones"],
          summary: "Actualizar una reservación por ID",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
              description: "ID de la reservación",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Reservacion" },
              },
            },
          },
          responses: {
            200: {
              description: "Reservación actualizada exitosamente",
            },
            404: {
              description: "Reservación no encontrada",
            },
            500: {
              description: "Error interno del servidor",
            },
          },
        },
        delete: {
          tags: ["Reservaciones"],
          summary: "Eliminar una reservación por ID",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
              description: "ID de la reservación",
            },
          ],
          responses: {
            200: {
              description: "Reservación eliminada exitosamente",
            },
            404: {
              description: "Reservación no encontrada",
            },
            500: {
              description: "Error interno del servidor",
            },
          },
        },
      },
      // Nuevos paths para estadísticas
      "/api/stats/sales-summary": {
        get: {
          tags: ["Estadísticas"],
          summary: "Obtener resumen general de ventas",
          description:
            "Devuelve un resumen con las ventas totales, ventas mensuales y conteo de órdenes",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Resumen de ventas obtenido correctamente",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/SalesSummary" },
                },
              },
            },
            401: {
              description: "No autorizado - Se requiere rol de administrador",
            },
            500: { description: "Error interno del servidor" },
          },
        },
      },
      "/api/stats/sales-by-period": {
        get: {
          tags: ["Estadísticas"],
          summary: "Obtener ventas por período",
          description:
            "Devuelve las ventas agrupadas por el período especificado (day, week, month, year)",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "period",
              in: "query",
              description:
                "Período para agrupar ventas (day, week, month, year)",
              required: false,
              schema: {
                type: "string",
                enum: ["day", "week", "month", "year"],
                default: "month",
              },
            },
          ],
          responses: {
            200: {
              description: "Ventas por período obtenidas correctamente",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/SalesByPeriod" },
                  },
                },
              },
            },
            401: {
              description: "No autorizado - Se requiere rol de administrador",
            },
            500: { description: "Error interno del servidor" },
          },
        },
      },
      "/api/stats/top-products": {
        get: {
          tags: ["Estadísticas"],
          summary: "Obtener productos más vendidos",
          description:
            "Devuelve los productos más vendidos ordenados por cantidad",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "limit",
              in: "query",
              description: "Límite de productos a devolver",
              required: false,
              schema: {
                type: "integer",
                default: 5,
              },
            },
          ],
          responses: {
            200: {
              description: "Productos más vendidos obtenidos correctamente",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/TopProduct" },
                  },
                },
              },
            },
            401: {
              description: "No autorizado - Se requiere rol de administrador",
            },
            500: { description: "Error interno del servidor" },
          },
        },
      },
      "/api/stats/customer-stats": {
        get: {
          tags: ["Estadísticas"],
          summary: "Obtener estadísticas de clientes",
          description: "Devuelve estadísticas sobre los clientes registrados",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Estadísticas de clientes obtenidas correctamente",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/CustomerStats" },
                },
              },
            },
            401: {
              description: "No autorizado - Se requiere rol de administrador",
            },
            500: { description: "Error interno del servidor" },
          },
        },
      },
      "/api/stats/reservation-stats": {
        get: {
          tags: ["Estadísticas"],
          summary: "Obtener estadísticas de reservaciones",
          description:
            "Devuelve estadísticas sobre las reservaciones realizadas",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description:
                "Estadísticas de reservaciones obtenidas correctamente",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ReservationStats" },
                },
              },
            },
            401: {
              description: "No autorizado - Se requiere rol de administrador",
            },
            500: { description: "Error interno del servidor" },
          },
        },
      },
      // Endpoints de facturación
      "/api/invoices/{orderId}": {
        get: {
          tags: ["Facturas"],
          summary: "Generar factura en PDF",
          description: "Genera una factura en PDF para una orden específica",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "orderId",
              in: "path",
              required: true,
              description: "ID de la orden para la que se generará la factura",
              schema: {
                type: "string",
                format: "uuid"
              }
            }
          ],
          responses: {
            200: {
              description: "Factura generada correctamente",
              content: {
                "application/pdf": {
                  schema: {
                    type: "string",
                    format: "binary"
                  }
                }
              }
            },
            400: {
              description: "Solicitud incorrecta - ID de orden no proporcionado"
            },
            401: {
              description: "No autorizado - Se requiere autenticación"
            },
            403: {
              description: "Prohibido - No tienes permiso para acceder a esta orden"
            },
            404: {
              description: "Orden no encontrada"
            },
            500: {
              description: "Error interno del servidor"
            }
          }
        }
      },
      "/api/invoices/{orderId}/email": {
        post: {
          tags: ["Facturas"],
          summary: "Enviar factura por correo electrónico",
          description: "Genera una factura en PDF y la envía por correo electrónico",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "orderId",
              in: "path",
              required: true,
              description: "ID de la orden para la que se enviará la factura",
              schema: {
                type: "string",
                format: "uuid"
              }
            }
          ],
          requestBody: {
            required: false,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/EmailRequest"
                }
              }
            }
          },
          responses: {
            200: {
              description: "Factura enviada por correo electrónico correctamente",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true
                      },
                      message: {
                        type: "string",
                        example: "Factura enviada por correo electrónico"
                      }
                    }
                  }
                }
              }
            },
            400: {
              description: "Solicitud incorrecta - ID de orden no proporcionado"
            },
            401: {
              description: "No autorizado - Se requiere autenticación"
            },
            403: {
              description: "Prohibido - No tienes permiso para acceder a esta orden"
            },
            404: {
              description: "Orden no encontrada"
            },
            500: {
              description: "Error interno del servidor"
            }
          }
        }
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = { swaggerUi, swaggerSpec };
