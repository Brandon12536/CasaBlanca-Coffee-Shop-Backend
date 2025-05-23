// src/controllers/invoiceController.js
const supabase = require("../config/supabase");
const { generateInvoicePdf } = require("../services/invoiceService");

// Helper para manejo de errores
const handleError = (context, error, res) => {
  console.error(`[${context}] Error:`, error);
  return res.status(500).json({
    success: false,
    message: `Error en ${context}`,
    error: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
};

/**
 * Genera una factura en PDF para una orden específica
 * @route GET /api/invoices/:orderId
 */
const generateInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user?.id;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "ID de orden requerido",
      });
    }

    // Verificar que el usuario tenga acceso a esta orden
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return res.status(404).json({
        success: false,
        message: "Orden no encontrada",
      });
    }

    // Si no es admin, verificar que la orden pertenezca al usuario
    if (req.user?.role !== "admin" && order.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "No tienes permiso para acceder a esta orden",
      });
    }

    // Obtener items de la orden
    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select("*, product:products(*)")
      .eq("order_id", orderId);

    if (itemsError) {
      return handleError("generateInvoice:getItems", itemsError, res);
    }

    // Obtener datos del usuario
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", order.user_id)
      .single();

    if (userError) {
      return handleError("generateInvoice:getUser", userError, res);
    }

    // Preparar los items para el PDF
    const items = orderItems.map((item) => ({
      product_id: item.product_id,
      product_name: item.product?.name || `Producto ${item.product_id}`,
      quantity: item.quantity,
      price: item.price,
    }));

    // Preparar la orden con los items
    const orderWithItems = {
      ...order,
      items,
    };

    // Parsear la dirección de envío si está en formato JSON
    let shippingAddress = order.shipping_address;
    if (typeof shippingAddress === 'string') {
      try {
        shippingAddress = JSON.parse(shippingAddress);
      } catch (e) {
        console.error("Error al parsear dirección de envío:", e);
        shippingAddress = {};
      }
    }

    // Generar el PDF de la factura
    const pdfBuffer = await generateInvoicePdf(orderWithItems, userData, shippingAddress);

    // Establecer las cabeceras para la descarga del PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=factura-${orderId}.pdf`
    );

    // Enviar el PDF como respuesta
    return res.send(pdfBuffer);
  } catch (error) {
    return handleError("generateInvoice", error, res);
  }
};

/**
 * Envía una factura por correo electrónico
 * @route POST /api/invoices/:orderId/email
 */
const sendInvoiceByEmail = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { email } = req.body;
    const userId = req.user?.id;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "ID de orden requerido",
      });
    }

    // Verificar que el usuario tenga acceso a esta orden
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return res.status(404).json({
        success: false,
        message: "Orden no encontrada",
      });
    }

    // Si no es admin, verificar que la orden pertenezca al usuario
    if (req.user?.role !== "admin" && order.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "No tienes permiso para acceder a esta orden",
      });
    }

    // Obtener items de la orden
    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select("*, product:products(*)")
      .eq("order_id", orderId);

    if (itemsError) {
      return handleError("sendInvoiceByEmail:getItems", itemsError, res);
    }

    // Obtener datos del usuario
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", order.user_id)
      .single();

    if (userError) {
      return handleError("sendInvoiceByEmail:getUser", userError, res);
    }

    // Preparar los items para el PDF
    const items = orderItems.map((item) => ({
      product_id: item.product_id,
      product_name: item.product?.name || `Producto ${item.product_id}`,
      quantity: item.quantity,
      price: item.price,
    }));

    // Preparar la orden con los items
    const orderWithItems = {
      ...order,
      items,
    };

    // Parsear la dirección de envío si está en formato JSON
    let shippingAddress = order.shipping_address;
    if (typeof shippingAddress === 'string') {
      try {
        shippingAddress = JSON.parse(shippingAddress);
      } catch (e) {
        console.error("Error al parsear dirección de envío:", e);
        shippingAddress = {};
      }
    }

    // Generar el PDF de la factura
    const pdfBuffer = await generateInvoicePdf(orderWithItems, userData, shippingAddress);

    // Importar el servicio de email
    const nodemailer = require('nodemailer');

    // Configurar el transporte de correo
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Configurar las opciones del correo
    const mailOptions = {
      from: `"CasaBlanca Coffee Shop" <${process.env.EMAIL_USER}>`,
      to: email || userData.email,
      subject: '📋 Factura de tu compra en CasaBlanca Coffee Shop',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f5f0; padding: 20px; border-radius: 8px; border: 1px solid #e0d6cc;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #5d4037; font-size: 28px; margin-bottom: 5px;">CasaBlanca Coffee Shop <span style="font-size: 24px;">☕️</span></h1>
            <div style="height: 2px; background: linear-gradient(90deg, #d7ccc8, #8d6e63, #d7ccc8); margin: 10px 0;"></div>
          </div>
          
          <div style="background-color: #fff; padding: 25px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <h2 style="color: #5d4037; margin-top: 0;">¡Hola ${userData.name || 'Cliente'}!</h2>
            <p style="color: #5d4037; line-height: 1.6;">Adjunto encontrarás la factura de tu compra con el número de orden <strong>#${order.id}</strong>.</p>
            <p style="color: #5d4037; line-height: 1.6;">Gracias por tu preferencia.</p>
            
            <div style="margin-top: 25px; padding-top: 20px; border-top: 1px dashed #d7ccc8; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #8d6e63; font-weight: 500;">¿Tienes alguna pregunta?</p>
              <p style="margin: 0; color: #8d6e63;">Estamos aquí para ayudarte en <a href="mailto:contacto@casablancacoffee.com" style="color: #8d6e63; text-decoration: underline;">contacto@casablancacoffee.com</a></p>
              <p style="margin: 10px 0 0 0; color: #a1887f; font-size: 12px;">Horario de atención: Lunes a Sábado de 8:00 AM a 7:00 PM</p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #e0d6cc;">
            <p style="margin: 5px 0; color: #8d6e63; font-size: 12px;">© ${new Date().getFullYear()} CasaBlanca Coffee Shop. Todos los derechos reservados.</p>
            <p style="margin: 5px 0; color: #a1887f; font-size: 12px;">Blvd. Puerta de Hierro 5153, Fracc. Plaza Andares, Zapopan, Jalisco</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `factura-${orderId}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    // Enviar el correo
    const info = await transporter.sendMail(mailOptions);
    console.log('Factura enviada por correo:', info.messageId);

    return res.status(200).json({
      success: true,
      message: "Factura enviada por correo electrónico",
    });
  } catch (error) {
    return handleError("sendInvoiceByEmail", error, res);
  }
};

module.exports = {
  generateInvoice,
  sendInvoiceByEmail,
};
